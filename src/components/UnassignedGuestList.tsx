// src/components/UnassignedGuestList.tsx
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { DraggableGuestPill } from './GuestPill';
import type { Guest } from '../types';

export const UnassignedGuestList: React.FC<{ guests: Guest[] }> = ({ guests }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'unassigned-area' });

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Unassigned Guests ({guests.length})</h3>
      <div
        ref={setNodeRef}
        className={`min-h-[200px] max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg border-2 border-dashed ${isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} transition-colors duration-200`}
        aria-label="Unassigned guests drop area"
      >
        {guests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {guests.map(guest => <DraggableGuestPill key={guest.id} guest={guest} />)}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 py-10">
            All attending guests are seated.
          </div>
        )}
      </div>
    </div>
  );
};