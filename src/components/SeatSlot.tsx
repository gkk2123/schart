// src/components/SeatSlot.tsx
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { DraggableGuestPill } from './GuestPill';
import type { Guest } from '../types';
import { useSearch } from '../context/SearchContext';

interface SeatSlotProps {
  seatId: string;
  guest: Guest | null;
  seatNumber: number;
  isOccupied: boolean;
  isDisabled: boolean;
}

export const SeatSlot: React.FC<SeatSlotProps> = ({ seatId, guest, seatNumber, isOccupied, isDisabled }) => {
  const { highlightedGuestId } = useSearch();
  const { setNodeRef, isOver } = useDroppable({
    id: seatId,
    // The droppable should NOT be disabled when occupied, to allow for swaps.
    // It should only be disabled if the table is full AND this slot is empty.
    disabled: isDisabled,
  });

  const isHighlighted = guest && guest.id === highlightedGuestId;

  const baseClasses = "w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-200";
  const stateClasses = isHighlighted
    ? "border-yellow-400 bg-yellow-100 ring-2 ring-yellow-400 animate-pulse"
    : isOccupied && !isOver
    ? "border-transparent bg-transparent"
    : isOver
    ? "border-blue-500 bg-blue-100 ring-2 ring-blue-500"
    : "border-dashed border-gray-400 bg-gray-100 hover:bg-gray-200";

  return (
    <div
      ref={setNodeRef}
      className={`${baseClasses} ${stateClasses}`}
      aria-label={`Seat ${seatNumber}${guest ? ` - ${guest.name}` : ''}`}
    >
      {guest ? (
        <DraggableGuestPill guest={guest} />
      ) : (
        <span className="text-xs font-semibold text-gray-500">{seatNumber}</span>
      )}
    </div>
  );
};