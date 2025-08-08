// src/utils/autoSeating.ts
import type { Guest, Table } from '../types';

interface AutoSeatResult {
  updatedTables: Table[];
  splitGroups: string[];
}

export const autoSeatGuests = (guests: Guest[], tables: Table[]): AutoSeatResult => {
  const guestsToSeat = guests; // Remove RSVP filter - seat all guests
  const availableTables = JSON.parse(JSON.stringify(tables)) as Table[];
  const splitGroups = new Set<string>();

  const groupedGuests = guestsToSeat.reduce((acc, guest) => {
    const groupName = guest.group || 'Individual';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(guest);
    return acc;
  }, {} as Record<string, Guest[]>);

  const sortedGroups = Object.entries(groupedGuests).sort(([, a], [, b]) => b.length - a.length);

  const assignGuestToSeat = (guest: Guest, tables: Table[]): boolean => {
    for (const table of tables) {
      const emptySeat = table.seats.find(s => s.guestId === null);
      if (emptySeat) {
        emptySeat.guestId = guest.id;
        return true;
      }
    }
    return false;
  };
  
  const assignGroupToTable = (groupMembers: Guest[], table: Table): void => {
    let membersToAssign = [...groupMembers];
    for (const seat of table.seats) {
      if (membersToAssign.length === 0) break;
      if (seat.guestId === null) {
        seat.guestId = membersToAssign.shift()!.id;
      }
    }
  };

  for (const [groupName, groupMembers] of sortedGroups) {
    if (groupName === 'Individual') continue;

    const getRemainingSeats = (table: Table) => table.seats.filter(s => s.guestId === null).length;

    const tableThatFits = availableTables
        .filter(t => getRemainingSeats(t) >= groupMembers.length)
        .sort((a,b) => getRemainingSeats(a) - getRemainingSeats(b))[0];

    if (tableThatFits) {
      assignGroupToTable(groupMembers, tableThatFits);
    } else {
      if (groupMembers.length > 0) splitGroups.add(groupName);
      for (const member of groupMembers) {
        assignGuestToSeat(member, availableTables);
      }
    }
  }

  const individuals = groupedGuests['Individual'] || [];
  for (const individual of individuals) {
    const tablesWithMostSpace = availableTables
        .map(t => ({...t, remaining: t.seats.filter(s => s.guestId === null).length}))
        .filter(t => t.remaining > 0)
        .sort((a,b) => b.remaining - a.remaining);
    
    if (tablesWithMostSpace.length > 0) {
        const targetTable = availableTables.find(t => t.id === tablesWithMostSpace[0].id);
        if(targetTable){
            const emptySeat = targetTable.seats.find(s => s.guestId === null);
            if (emptySeat) emptySeat.guestId = individual.id;
        }
    }
  }

  return {
    updatedTables: availableTables,
    splitGroups: Array.from(splitGroups),
  };
};


export const seatGuestsInEmptySlots = (guestsToSeat: Guest[], tables: Table[]): { updatedTables: Table[]; seatedCount: number } => {
    const shuffledGuests = [...guestsToSeat].sort(() => Math.random() - 0.5);
    const updatedTables = JSON.parse(JSON.stringify(tables)) as Table[];
    let seatedCount = 0;

    for (const guest of shuffledGuests) {
        let wasSeated = false;
        // Start with tables that have more space, to distribute more evenly
        const sortedTables = updatedTables
            .map(t => ({ table: t, remaining: t.seats.filter(s => s.guestId === null).length }))
            .filter(t => t.remaining > 0)
            .sort((a, b) => b.remaining - a.remaining)
            .map(t => t.table);

        for (const table of sortedTables) {
            const emptySeat = table.seats.find(s => s.guestId === null);
            if (emptySeat) {
                emptySeat.guestId = guest.id;
                wasSeated = true;
                seatedCount++;
                break;
            }
        }
        if (!wasSeated) {
            // No more empty seats anywhere
            break;
        }
    }

    return { updatedTables, seatedCount };
};

export const autoSeatByAffiliation = (guests: Guest[], tables: Table[]): { updatedTables: Table[], notification: string } => {
  // 1. Clear all table assignments
  const clearedTables = tables.map(t => ({ 
    ...t, 
    seats: t.seats.map(s => ({ ...s, guestId: null })) 
  }));

  // 2. Categorize all guests (not just attending)
  const allGuests = guests; // Use all guests regardless of RSVP status
  const groomGuests = allGuests.filter(g => (g.sourceSheet?.includes('신랑') || g.group?.includes('신랑')));
  const brideGuests = allGuests.filter(g => (g.sourceSheet?.includes('신부') || g.group?.includes('신부')));
  
  const groomGuestIds = new Set(groomGuests.map(g => g.id));
  const brideGuestIds = new Set(brideGuests.map(g => g.id));
  const otherGuests = allGuests.filter(g => !groomGuestIds.has(g.id) && !brideGuestIds.has(g.id));

  // 3. Divide tables, preserving original order for predictability
  const totalTables = clearedTables.length;
  if (totalTables < 2) {
      const { updatedTables, splitGroups } = autoSeatGuests(allGuests, clearedTables);
      return {
          updatedTables,
          notification: `Seated all guests. Not enough tables to split by affiliation. ${splitGroups.length > 0 ? `Groups split: ${splitGroups.join(', ')}.` : ''}`
      };
  }

  const midPoint = Math.ceil(totalTables / 2);
  const groomTables = clearedTables.slice(0, midPoint);
  const brideTables = clearedTables.slice(midPoint);

  // 4. Seat main affiliations
  const { updatedTables: seatedGroomTables, splitGroups: groomSplitGroups } = autoSeatGuests(groomGuests, groomTables);
  const { updatedTables: seatedBrideTables, splitGroups: brideSplitGroups } = autoSeatGuests(brideGuests, brideTables);

  // 5. Seat other guests in remaining slots
  const combinedSeatedTables = [...seatedGroomTables, ...seatedBrideTables];
  const { updatedTables: finalTablesWithOthers, seatedCount: othersSeatedCount } = seatGuestsInEmptySlots(otherGuests, combinedSeatedTables);

  // 6. Consolidate results and create notification
  const finalTablesById = new Map(finalTablesWithOthers.map(t => [t.id, t]));
  const correctlyOrderedTables = tables.map(t => finalTablesById.get(t.id)!);

  const groomSeatedCount = seatedGroomTables.flatMap(t => t.seats).filter(s => s.guestId).length;
  const brideSeatedCount = seatedBrideTables.flatMap(t => t.seats).filter(s => s.guestId).length;
  
  let notificationParts = [];
  notificationParts.push(`Seated ${groomSeatedCount}/${groomGuests.length} from Groom's side and ${brideSeatedCount}/${brideGuests.length} from Bride's side.`);
  if (othersSeatedCount > 0) {
    notificationParts.push(`Seated ${othersSeatedCount}/${otherGuests.length} other guests.`);
  }
  const allSplitGroups = [...groomSplitGroups, ...brideSplitGroups];
  if (allSplitGroups.length > 0) {
      notificationParts.push(`Groups split: ${[...new Set(allSplitGroups)].join(', ')}.`);
  }

  return { 
    updatedTables: correctlyOrderedTables, 
    notification: notificationParts.join(' ')
  };
};