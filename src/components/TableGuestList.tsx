// src/components/TableGuestList.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { Table, Guest } from '../types';
import { CollapsibleCard } from './CollapsibleCard';

const getAffiliationColor = (guest: Guest): string => {
    const affiliation = guest.sourceSheet || guest.group || '';
    if (affiliation.includes('신랑')) return 'text-blue-600 font-medium';
    if (affiliation.includes('신부')) return 'text-pink-600 font-medium';
    return 'text-gray-700';
}

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
    </svg>
);

interface TableGuestListProps {
    tables: Table[];
    guestsById: Map<number, Guest>;
    onUpdateTableName: (tableId: number, newName: string) => void;
}

export const TableGuestList: React.FC<TableGuestListProps> = ({ tables, guestsById, onUpdateTableName }) => {
    const [editingTableId, setEditingTableId] = useState<number | null>(null);
    const [currentName, setCurrentName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const isAnyoneAssigned = tables.some(table => table.seats.some(seat => seat.guestId !== null));

    useEffect(() => {
        if (editingTableId !== null && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingTableId]);

    const handleStartEditing = (table: Table) => {
        setEditingTableId(table.id);
        setCurrentName(table.name);
    };

    const handleNameChange = () => {
        if (editingTableId === null) return;
        
        const trimmedName = currentName.trim();
        const originalTable = tables.find(t => t.id === editingTableId);

        if (trimmedName && trimmedName !== originalTable?.name) {
            onUpdateTableName(editingTableId, trimmedName);
        }
        setEditingTableId(null);
        setCurrentName('');
    };

    if (!isAnyoneAssigned && tables.length === 0) {
        return null; 
    }

    return (
        <CollapsibleCard title="Assigned Guests by Table" defaultOpen={true}>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {tables.map(table => {
                    const assignedGuests = table.seats
                        .map(seat => seat.guestId ? guestsById.get(seat.guestId) : null)
                        .filter((g): g is Guest => g !== null);
                    
                    const isEditing = editingTableId === table.id;

                    return (
                        <div key={table.id} className="p-3 bg-gray-50 rounded-lg">
                            {isEditing ? (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={currentName}
                                    onChange={(e) => setCurrentName(e.target.value)}
                                    onBlur={handleNameChange}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleNameChange();
                                        if (e.key === 'Escape') {
                                            setEditingTableId(null);
                                            setCurrentName('');
                                        }
                                    }}
                                    className="font-bold text-gray-800 bg-white w-full border border-blue-500 rounded px-1"
                                />
                            ) : (
                                <div
                                    className="group flex items-center gap-2 cursor-pointer"
                                    onClick={() => handleStartEditing(table)}
                                    title="Click to edit"
                                >
                                    <h4 className="font-bold text-gray-800">{table.name}</h4>
                                    <span className="font-normal text-sm text-gray-500">({assignedGuests.length}/{table.capacity})</span>
                                    <EditIcon className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}

                            {assignedGuests.length > 0 ? (
                                <ul className="mt-2 list-none space-y-1 pl-1">
                                    {assignedGuests.map(guest => (
                                        <li key={guest.id} className={`text-sm ${getAffiliationColor(guest)}`}>
                                            {guest.name}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-400 mt-1 italic">No guests assigned.</p>
                            )}
                        </div>
                    )
                })}
                 {tables.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No tables created yet.</p>
                )}
            </div>
        </CollapsibleCard>
    );
}