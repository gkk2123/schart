// src/App.tsx
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import type { Guest, Table, Seat } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer, useToast } from './components/Toast';
import { LoadingSpinner, LoadingOverlay } from './components/LoadingSpinner';
import { validateSeatingCapacity, findDuplicateGuests } from './utils/validation';
import { useBreakpoint } from './hooks/useMediaQuery';
import { SearchProvider } from './context/SearchContext';
import { EnhancedGuestSearch } from './components/EnhancedGuestSearch';

import { Header } from './components/Header';
import { GuestImporter } from './components/GuestImporter';
import { TableConfiguration } from './components/TableConfiguration';
import { UnassignedGuestList } from './components/UnassignedGuestList';
import { SeatingArea } from './components/SeatingArea';
import { DraggableGuestPill } from './components/GuestPill';
import { TableCard } from './components/TableCard';
import { ProjectControls } from './components/ProjectControls';
import { ExportControls } from './components/ExportControls';
import { autoSeatGuests, seatGuestsInEmptySlots, autoSeatByAffiliation } from './utils/autoSeating';
import { generateSeatingChartPDF } from './utils/pdfExport';
import { GuestListManager } from './components/GuestListManager';
import { GuestEditModal } from './components/GuestEditModal';
import { useSeatingPlan } from './hooks/useSeatingPlan';
import { PasswordScreen } from './components/PasswordScreen';
import { CollapsibleCard } from './components/CollapsibleCard';
import { TableGuestList } from './components/TableGuestList';
import { calculateSeatPositions } from './utils/layout';
import { GuestStatusInfo } from './components/GuestStatusInfo';
import { QuickActions } from './components/QuickActions';
import { FloatingActionButton } from './components/FloatingActionButton';
import { HelpModal } from './components/HelpModal';
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from './hooks/useKeyboardShortcuts';

declare const html2canvas: any;

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const { tables, setTables, undo, redo, canUndo, canRedo, resetHistory } = useSeatingPlan();
  const { toasts, removeToast, success, error: showError, warning, info } = useToast();
  const { isMobile, isTablet, deviceType } = useBreakpoint();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [activeId, setActiveId] = useState<string | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [splitGroupsNotification, setSplitGroupsNotification] = useState<string | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null | 'new'>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState('All');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const guestsById = useMemo(() => new Map(guests.map(g => [g.id, g])), [guests]);
  const tablesById = useMemo(() => new Map(tables.map(t => [t.id, t])), [tables]);
  
  const activeGuest = useMemo(() => {
    if (!activeId || !activeId.startsWith('guest-')) return null;
    return guestsById.get(parseInt(activeId.split('-')[1], 10)) ?? null;
  }, [activeId, guestsById]);
  
  const activeTable = useMemo(() => {
    if (!activeId || !activeId.startsWith('table-')) return null;
    return tablesById.get(parseInt(activeId.split('-')[1], 10)) ?? null;
  }, [activeId, tablesById]);

  const assignedGuestIds = useMemo(() => {
    const ids = new Set<number>();
    tables.forEach(table => {
      table.seats.forEach(seat => {
        if (seat.guestId !== null) ids.add(seat.guestId);
      });
    });
    return ids;
  }, [tables]);
  const unassignedGuests = useMemo(() => guests.filter(g => !assignedGuestIds.has(g.id)), [guests, assignedGuestIds]);
  const isAnythingAssigned = useMemo(() => assignedGuestIds.size > 0, [assignedGuestIds]);

  const handleGuestsImported = useCallback((importedGuests: Guest[]) => {
      // Check for duplicates
      const duplicates = findDuplicateGuests(importedGuests);
      if (duplicates.length > 0) {
        warning('Duplicate guests detected', `Found duplicates: ${duplicates.slice(0, 3).join(', ')}${duplicates.length > 3 ? '...' : ''}`);
      }
      
      setGuests(importedGuests);
      const uniqueSheetNames = Array.from(new Set(importedGuests.map(g => g.sourceSheet).filter((s): s is string => !!s)));
      setSheetNames(uniqueSheetNames);
      resetHistory([]);
      setLoadError(null);
      setSplitGroupsNotification(null);
      
      success('Guests imported successfully', `Loaded ${importedGuests.length} guests`);
  }, [resetHistory, success, warning]);

  const handleAddTable = useCallback((newTableData: Omit<Table, 'id' | 'seats' | 'x' | 'y'>) => {
    setTables(prevTables => {
        const tableName = newTableData.name.trim() || `Table ${prevTables.length + 1}`;
        const newId = Date.now();
        const newTable: Table = {
            ...newTableData,
            name: tableName,
            id: newId,
            seats: Array.from({ length: newTableData.capacity }, (_, i) => ({
                id: `seat-${newId}-${i}`,
                guestId: null,
            })),
            x: (prevTables.length % 3) * 400 + 20,
            y: Math.floor(prevTables.length / 3) * 400 + 20,
        };
        return [...prevTables, newTable];
    });
    setSplitGroupsNotification(null);
  }, [setTables]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setSplitGroupsNotification(null);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
      setActiveId(null);
      const { active, over, delta } = event;

      // Handle table dragging to update position
      if (String(active.id).startsWith('table-') && (delta.x !== 0 || delta.y !== 0)) {
          setTables(prevTables => prevTables.map(t =>
              `table-${t.id}` === active.id ? { ...t, x: t.x + delta.x, y: t.y + delta.y } : t
          ));
          return;
      }
      
      // Ensure we are handling a guest drag operation
      if (!String(active.id).startsWith('guest-') || !over?.id) {
          return;
      }

      const draggedGuestId = parseInt(String(active.id).split('-')[1], 10);
      const overId = String(over.id);

      setTables(currentTables => {
          let newTables = JSON.parse(JSON.stringify(currentTables)) as Table[];

          // Find the guest's original seat (if any)
          let sourceSeat: Seat | null = null;
          for (const table of newTables) {
              const seat = table.seats.find(s => s.guestId === draggedGuestId);
              if (seat) {
                  sourceSeat = seat;
                  break;
              }
          }

          // Case 1: Dragging guest back to the unassigned list
          if (overId === 'unassigned-area') {
              if (sourceSeat) {
                  sourceSeat.guestId = null; // Vacate the seat
              }
              return newTables;
          }

          // Case 2: Find the target seat based on what was dropped on
          let targetSeat: Seat | null = null;
          if (overId.startsWith('seat-')) {
              const table = newTables.find(t => t.id === parseInt(overId.split('-')[1], 10));
              if (table) targetSeat = table.seats.find(s => s.id === overId) || null;
          } else if (overId.startsWith('guest-')) {
              const overGuestId = parseInt(overId.split('-')[1], 10);
              for (const table of newTables) {
                  const seat = table.seats.find(s => s.guestId === overGuestId);
                  if (seat) {
                      targetSeat = seat;
                      break;
                  }
              }
          } else if (overId.startsWith('table-')) {
              // Find the first available empty seat on the dropped-on table
              const table = newTables.find(t => t.id === parseInt(overId.split('-')[1], 10));
              if (table) targetSeat = table.seats.find(s => s.guestId === null) || null;
          }

          // If no valid target or dropping on the same seat, cancel the operation
          if (!targetSeat || targetSeat.id === sourceSeat?.id) {
              return currentTables;
          }

          const displacedGuestId = targetSeat.guestId;

          // --- Perform the seat assignment logic ---

          // 1. Vacate the source seat first to prevent guest duplication.
          if (sourceSeat) {
              sourceSeat.guestId = null;
          }

          // 2. Handle the guest who was in the target seat (if any).
          if (displacedGuestId) {
              // If the dragged guest came from a seat, it's a SWAP.
              // Put the displaced guest into the now-empty source seat.
              if (sourceSeat) {
                  sourceSeat.guestId = displacedGuestId;
              }
              // If the dragged guest was unassigned, it's a BUMP.
              // The displaced guest is now unassigned, which is the implicit state
              // as their seat is about to be taken and they haven't been given a new one.
          }

          // 3. Place the dragged guest in the target seat.
          targetSeat.guestId = draggedGuestId;
          
          return newTables;
      });
  }, [setTables]);


  const handleSaveProject = useCallback(() => {
    setLoadError(null);
    try {
        const stateToSave = { version: '1.2', guests, tables };
        const blob = new Blob([JSON.stringify(stateToSave, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'seating-chart-project.json';
        a.click();
        URL.revokeObjectURL(url);
    } catch(err) {
        setLoadError("Failed to save the project. Please try again.");
    }
  }, [guests, tables]);

  const handleLoadProject = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        if (!data || !Array.isArray(data.guests) || !Array.isArray(data.tables)) {
          throw new Error('Invalid file format.');
        }

        const loadedGuests: Guest[] = data.guests;
        setGuests(loadedGuests);
        const uniqueSheetNames = Array.from(new Set(loadedGuests.map(g => g.sourceSheet).filter((s): s is string => !!s)));
        setSheetNames(uniqueSheetNames);

        const loadedTables: Table[] = data.tables.map((table: any, index: number) => {
            let seats: Seat[] = [];
            if (table.assignedGuestIds) { // Legacy v1.1 format
                seats = Array.from({ length: table.capacity }, (_, i) => ({
                    id: `seat-${table.id}-${i}`,
                    guestId: table.assignedGuestIds[i] || null,
                }));
            } else {
                seats = table.seats;
            }
            return { ...table, seats, assignedGuestIds: undefined, x: table.x ?? (index % 3) * 400 + 20, y: table.y ?? Math.floor(index / 3) * 400 + 20 };
        });
        
        resetHistory(loadedTables);
        setLoadError(null);
        setSplitGroupsNotification(null);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Error loading file.');
      }
    };
    reader.onerror = () => setLoadError('Failed to read the file.');
    reader.readAsText(file);
  }, [resetHistory]);

  const handleAutoSeatByGroup = useCallback(() => {
    const clearedTables = tables.map(t => ({ ...t, seats: t.seats.map(s => ({ ...s, guestId: null })) }));
    const { updatedTables, splitGroups } = autoSeatGuests(guests, clearedTables);
    setTables(updatedTables);
    
    if (splitGroups.length > 0) {
      setSplitGroupsNotification(`Groups split: ${splitGroups.join(', ')}.`);
    } else if (guests.length > 0) {
      setSplitGroupsNotification('All guests seated without splitting groups.');
    } else {
      setSplitGroupsNotification(null);
    }
  }, [guests, tables, setTables]);

  const handleAutoSeatAll = useCallback(() => {
    const guestsToSeat = guests.filter(g => !assignedGuestIds.has(g.id));
    const { updatedTables, seatedCount } = seatGuestsInEmptySlots(guestsToSeat, tables);
    setTables(updatedTables);
    if(seatedCount > 0) {
      setSplitGroupsNotification(`Seated ${seatedCount} remaining guest(s).`);
    } else {
      setSplitGroupsNotification('No unassigned guests to seat.');
    }
  }, [guests, tables, setTables, assignedGuestIds]);
  
  const handleAutoSeatByAffiliation = useCallback(() => {
    const { updatedTables, notification } = autoSeatByAffiliation(guests, tables);
    setTables(updatedTables);
    setSplitGroupsNotification(notification);
  }, [guests, tables, setTables]);

  const handleAutoSeatFromSheet = useCallback((sheetName: string) => {
    const guestsToSeat = guests.filter(g => g.sourceSheet === sheetName && !assignedGuestIds.has(g.id));
    
    if (guestsToSeat.length === 0) {
        setSplitGroupsNotification(`All guests from "${sheetName}" are already seated or there are no guests from this sheet.`);
        return;
    }
    
    const { updatedTables, seatedCount } = seatGuestsInEmptySlots(guestsToSeat, tables);
    setTables(updatedTables);
    
    let message = `Seated ${seatedCount} guest(s) from "${sheetName}".`;
    if (seatedCount < guestsToSeat.length) {
        message += ` Could not seat ${guestsToSeat.length - seatedCount} guest(s) due to lack of space.`;
    }
    setSplitGroupsNotification(message);
  }, [guests, tables, setTables, assignedGuestIds]);

  const handleClearAllAssignments = useCallback(() => {
    setTables(prevTables => prevTables.map(t => ({ ...t, seats: t.seats.map(s => ({ ...s, guestId: null })) })));
    setSplitGroupsNotification(null);
  }, [setTables]);

  const handleExportPdf = useCallback(async () => {
    if (tables.length === 0) return;
    try {
        const pdfBytes = await generateSeatingChartPDF(tables, guestsById);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'seating-chart.pdf';
        a.click();
        URL.revokeObjectURL(url);
    } catch(err) {
        console.error("Failed to generate PDF", err);
    }
  }, [tables, guestsById]);
  
  const handleExportJpeg = useCallback(async () => {
    const seatingPlanElement = document.getElementById('seating-plan-area');
    if (!seatingPlanElement) {
        console.error('Seating plan element not found for JPEG export.');
        return;
    }
    
    // 1. Calculate the full dimensions required to contain all tables.
    let totalWidth = 0;
    let totalHeight = 0;
    tables.forEach(table => {
        const { width, height } = calculateSeatPositions(table);
        totalWidth = Math.max(totalWidth, table.x + width + 40); // Add some padding
        totalHeight = Math.max(totalHeight, table.y + height + 40); // Add some padding
    });
    
    totalWidth = Math.max(totalWidth, 500);
    totalHeight = Math.max(totalHeight, 500);

    // 2. Store original styles and apply new temporary styles for capture.
    const originalStyle = seatingPlanElement.style.cssText;
    seatingPlanElement.style.width = `${totalWidth}px`;
    seatingPlanElement.style.height = `${totalHeight}px`;
    seatingPlanElement.style.minHeight = 'auto'; // Override any min-height from Tailwind
    
    try {
        // 3. Capture the resized element.
        const canvas = await html2canvas(seatingPlanElement, {
            scale: 2,
            backgroundColor: '#f9fafb',
        });
        
        // 4. Trigger download.
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/jpeg', 0.9);
        a.download = 'seating-plan.jpeg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (err) {
        console.error("Failed to generate JPEG", err);
    } finally {
        // 5. Restore original styles.
        seatingPlanElement.style.cssText = originalStyle;
    }
  }, [tables]);

  const handleSaveGuest = useCallback((guestData: Guest) => {
    // Don't remove from seat when RSVP status changes - allow all guests to be seated
    setGuests(prev => {
        const existingIndex = prev.findIndex(g => g.id === guestData.id);
        if (existingIndex > -1) {
            const updatedGuests = [...prev];
            updatedGuests[existingIndex] = guestData;
            return updatedGuests;
        } else {
            return [...prev, { ...guestData, id: guests.reduce((max, g) => Math.max(max, g.id), 0) + 1 }];
        }
    });
    setEditingGuest(null);
  }, [guests]);

  const handleDeleteGuest = useCallback((guestId: number) => {
    if (window.confirm("Are you sure you want to delete this guest?")) {
        setGuests(prev => prev.filter(g => g.id !== guestId));
        setTables(prev => prev.map(t => ({
            ...t,
            seats: t.seats.map(s => s.guestId === guestId ? { ...s, guestId: null } : s)
        })));
    }
  }, [setTables]);

  const handleUpdateTableName = useCallback((tableId: number, newName: string) => {
      setTables(prevTables => prevTables.map(t => 
        t.id === tableId ? { ...t, name: newName } : t
      ));
  }, [setTables]);

  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = rsvpFilter === 'All' || guest.rsvp === rsvpFilter;
      return matchesSearch && matchesFilter;
    }).sort((a,b) => a.name.localeCompare(b.name));
  }, [guests, searchTerm, rsvpFilter]);

  // Keyboard shortcuts
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  useKeyboardShortcuts([
    { ...COMMON_SHORTCUTS.UNDO, handler: undo },
    { ...COMMON_SHORTCUTS.REDO, handler: redo },
    { ...COMMON_SHORTCUTS.SAVE, handler: handleSaveProject },
    { ...COMMON_SHORTCUTS.EXPORT, handler: handleExportPdf },
    { ...COMMON_SHORTCUTS.NEW_GUEST, handler: () => setEditingGuest('new') },
    { ...COMMON_SHORTCUTS.SEARCH, handler: () => {
      const searchElement = document.querySelector('input[placeholder*="Search guests"]') as HTMLInputElement;
      searchElement?.focus();
    }},
    { ...COMMON_SHORTCUTS.HELP, handler: () => setShowHelp(true) },
  ]);

  // Floating action button actions
  const fabActions = useMemo(() => [
    {
      id: 'auto-seat',
      label: 'Auto-Seat All',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      onClick: handleAutoSeatAll,
      disabled: unassignedGuests.length === 0,
      color: 'bg-blue-600 text-white hover:bg-blue-700'
    },
    {
      id: 'add-guest',
      label: 'Add Guest',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      onClick: () => setEditingGuest('new'),
      color: 'bg-green-600 text-white hover:bg-green-700'
    },
    {
      id: 'export',
      label: 'Export PDF',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      onClick: handleExportPdf,
      disabled: tables.length === 0,
      color: 'bg-purple-600 text-white hover:bg-purple-700'
    },
    {
      id: 'save',
      label: 'Save Project',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
        </svg>
      ),
      onClick: handleSaveProject,
      color: 'bg-gray-600 text-white hover:bg-gray-700'
    }
  ], [handleAutoSeatAll, handleExportPdf, handleSaveProject, unassignedGuests.length, tables.length]);

  if (!isAuthenticated) {
    return <PasswordScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="min-h-screen bg-gray-100 font-sans">
          <Header />
          <main className="p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <CollapsibleCard title="Import Guest List" defaultOpen={true}>
                      <GuestImporter onGuestsImported={handleGuestsImported} />
                    </CollapsibleCard>

                    {/* Enhanced Search with Highlighting */}
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">Quick Guest Search</h3>
                      <EnhancedGuestSearch 
                        guests={guests}
                        tables={tables}
                        onScrollToTable={(tableId) => {
                          // Scroll to table in the seating area
                          const tableElement = document.getElementById(`table-${tableId}`);
                          tableElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                      />
                    </div>

                    <CollapsibleCard title="Configure Tables" defaultOpen={true}>
                      <TableConfiguration onAddTable={handleAddTable} />
                    </CollapsibleCard>

                    <CollapsibleCard 
                      title="Guest List"
                      actionSlot={
                         <button
                            onClick={() => setEditingGuest('new')}
                            className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                         >
                            Add Guest
                        </button>
                      }
                    >
                      <GuestListManager 
                          guests={filteredGuests}
                          onEditGuest={setEditingGuest}
                          onDeleteGuest={handleDeleteGuest}
                          searchTerm={searchTerm}
                          setSearchTerm={setSearchTerm}
                          rsvpFilter={rsvpFilter}
                          setRsvpFilter={setRsvpFilter}
                      />
                    </CollapsibleCard>
                    
                    <GuestStatusInfo guests={guests} />
                    
                    <QuickActions
                      guests={guests}
                      tables={tables}
                      unassignedCount={unassignedGuests.length}
                      onQuickAction={(action) => {
                        if (action === 'autoSeatAll') {
                          handleAutoSeatAll();
                        } else if (action === 'clearAll') {
                          handleClearAllAssignments();
                        }
                      }}
                      onExport={handleExportPdf}
                      onSave={handleSaveProject}
                      canUndo={canUndo}
                      canRedo={canRedo}
                      onUndo={undo}
                      onRedo={redo}
                    />
                    
                    <UnassignedGuestList guests={unassignedGuests} />

                    <TableGuestList 
                      tables={tables} 
                      guestsById={guestsById} 
                      onUpdateTableName={handleUpdateTableName} 
                    />
                    
                    <CollapsibleCard title="Save & Load">
                      <ProjectControls
                          onSave={handleSaveProject}
                          onLoad={handleLoadProject}
                          loadError={loadError}
                          clearLoadError={() => setLoadError(null)}
                       />
                    </CollapsibleCard>

                    <CollapsibleCard title="Export Plan">
                      <ExportControls 
                          onExport={handleExportPdf}
                          onExportJpeg={handleExportJpeg}
                          isDisabled={!isAnythingAssigned}
                      />
                    </CollapsibleCard>
                </div>
                <div className="lg:col-span-3">
                     <SeatingArea
                        tables={tables}
                        guestsById={guestsById}
                        onAutoSeatByGroup={handleAutoSeatByGroup}
                        onAutoSeatByAffiliation={handleAutoSeatByAffiliation}
                        onAutoSeatAll={handleAutoSeatAll}
                        onUpdateTableName={handleUpdateTableName}
                        onClear={handleClearAllAssignments}
                        onUndo={undo}
                        onRedo={redo}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        splitGroupsNotification={splitGroupsNotification}
                        isSeatingDisabled={unassignedGuests.length === 0}
                        sheetNames={sheetNames}
                        onAutoSeatFromSheet={handleAutoSeatFromSheet}
                     />
                </div>
            </div>
          </main>
        </div>
        <DragOverlay>
            {activeGuest ? (
                <DraggableGuestPill guest={activeGuest} isOverlay /> 
            ) : activeTable ? (
                <TableCard 
                    table={activeTable} 
                    guestsById={guestsById}
                    isOverlay={true}
                    onUpdateTableName={() => {}} // No-op for overlay
                />
            ) : null}
        </DragOverlay>
        {editingGuest && (
            <GuestEditModal
                guest={editingGuest === 'new' ? null : editingGuest}
                onClose={() => setEditingGuest(null)}
                onSave={handleSaveGuest}
                maxId={guests.reduce((max, g) => Math.max(max, g.id), 0)}
            />
        )}
        <ToastContainer toasts={toasts} onClose={removeToast} />
        <FloatingActionButton actions={fabActions} />
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </DndContext>
  );
};

// Main App component with error boundary and toast container
export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <SearchProvider>
        <AppContent />
      </SearchProvider>
    </ErrorBoundary>
  );
};