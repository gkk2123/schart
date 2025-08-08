// src/components/GuestListManager.tsx
import React from 'react';
import type { Guest } from '../types';

const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);


interface GuestListManagerProps {
    guests: Guest[];
    onEditGuest: (guest: Guest) => void;
    onDeleteGuest: (guestId: number) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    rsvpFilter: string;
    setRsvpFilter: (filter: string) => void;
}

export const GuestListManager: React.FC<GuestListManagerProps> = ({
    guests,
    onEditGuest,
    onDeleteGuest,
    searchTerm,
    setSearchTerm,
    rsvpFilter,
    setRsvpFilter
}) => {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                    value={rsvpFilter}
                    onChange={(e) => setRsvpFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="All">All RSVPs</option>
                    <option value="Attending">Attending</option>
                    <option value="Not Attending">Not Attending</option>
                    <option value="Pending">Pending</option>
                </select>
            </div>

            <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
                {guests.length > 0 ? guests.map(guest => (
                    <div
                        key={guest.id}
                        className={`p-3 rounded-lg flex items-center justify-between transition-opacity ${guest.rsvp === 'Not Attending' ? 'opacity-50 bg-gray-100' : 'bg-white'}`}
                    >
                        <div>
                            <p className="font-semibold text-gray-800">{guest.name}</p>
                            <p className="text-xs text-gray-500">
                                {guest.group || 'No group'} {guest.sourceSheet ? `• ${guest.sourceSheet}` : ''}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => onEditGuest(guest)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full" aria-label={`Edit ${guest.name}`}>
                                <EditIcon />
                            </button>
                             <button onClick={() => onDeleteGuest(guest.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full" aria-label={`Delete ${guest.name}`}>
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                )) : (
                    <p className="text-gray-500 text-center py-4">No guests match the current filters.</p>
                )}
            </div>
        </>
    );
};