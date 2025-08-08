// src/components/GuestPill.tsx
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Guest } from '../types';

const getAffiliationColors = (guest: Guest): { bg: string; text: string; ring: string } => {
  const affiliation = guest.sourceSheet || guest.group || '';
  if (affiliation.includes('신랑')) { // Groom
    return { bg: 'bg-blue-500', text: 'text-white', ring: 'ring-blue-300' };
  }
  if (affiliation.includes('신부')) { // Bride
    return { bg: 'bg-pink-500', text: 'text-white', ring: 'ring-pink-300' };
  }
  return { bg: 'bg-gray-500', text: 'text-white', ring: 'ring-gray-300' }; // Other/Default
};

export const DraggableGuestPill: React.FC<{ guest: Guest; isOverlay?: boolean }> = ({ guest, isOverlay }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `guest-${guest.id}`,
    data: { // Pass guest data for DragOverlay
      guest: guest
    }
  });

  const style = transform && !isOverlay ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const title = [
    `Name: ${guest.name}`,
    `RSVP: ${guest.rsvp}`,
    `Group: ${guest.group || 'N/A'}`,
    `From: ${guest.sourceSheet || 'N/A'}`
  ].join(' | ');

  const colors = getAffiliationColors(guest);
  
  // Add opacity for non-attending guests
  const opacity = guest.rsvp === 'Not Attending' ? 'opacity-60' : '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      title={title}
      className={`relative px-3 py-1.5 rounded-full shadow-sm text-sm font-medium cursor-grab ${colors.bg} ${colors.text} ${opacity} ${isDragging && !isOverlay ? 'opacity-30' : ''} ${isOverlay ? `ring-2 ${colors.ring}` : ''}`}
      aria-label={`Draggable guest: ${guest.name}`}
    >
      <span className="flex items-center gap-1">
        {guest.name}
        {guest.rsvp === 'Not Attending' && (
          <span className="text-xs">✗</span>
        )}
      </span>
    </div>
  );
};