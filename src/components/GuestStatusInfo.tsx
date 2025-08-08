// src/components/GuestStatusInfo.tsx
import React from 'react';
import type { Guest } from '../types';

interface GuestStatusInfoProps {
  guests: Guest[];
}

export const GuestStatusInfo: React.FC<GuestStatusInfoProps> = ({ guests }) => {
  const attendingCount = guests.filter(g => g.rsvp === 'Attending').length;
  const notAttendingCount = guests.filter(g => g.rsvp === 'Not Attending').length;
  const pendingCount = guests.filter(g => g.rsvp === 'Pending').length;
  const totalGuests = guests.length;
  
  const attendingWithPlusOnes = guests
    .filter(g => g.rsvp === 'Attending')
    .reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Guest Status Summary</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Guests:</span>
          <span className="font-semibold text-gray-900">{totalGuests}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-green-600">Attending:</span>
          <span className="font-semibold text-green-700">
            {attendingCount} ({attendingWithPlusOnes} with +1s)
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-red-600">Not Attending:</span>
          <span className="font-semibold text-red-700">{notAttendingCount}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-yellow-600">Pending:</span>
          <span className="font-semibold text-yellow-700">{pendingCount}</span>
        </div>
      </div>
      
      {(notAttendingCount > 0 || pendingCount > 0) && (
        <div className="mt-3 p-2 bg-blue-50 rounded-md">
          <p className="text-xs text-blue-700">
            ℹ️ Only guests marked as "Attending" are shown in the seating area.
            {pendingCount > 0 && ` ${pendingCount} guest(s) have pending RSVP status.`}
          </p>
        </div>
      )}
    </div>
  );
};