// src/components/TableCard.tsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { SeatSlot } from './SeatSlot';
import type { Table, Guest } from '../types';
import { calculateSeatPositions, SEAT_DIAMETER, TABLE_PADDING } from '../utils/layout';
import { useSearch } from '../context/SearchContext';

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
    </svg>
);

export const TableCard: React.FC<{
    table: Table;
    guestsById: Map<number, Guest>;
    isOverlay?: boolean;
    onUpdateTableName: (tableId: number, newName: string) => void;
}> = ({ table, guestsById, isOverlay, onUpdateTableName }) => {
    const { highlightedGuestId, highlightedTableId } = useSearch();
    
    const assignedGuestsCount = useMemo(() => table.seats.filter(s => s.guestId !== null).length, [table.seats]);
    const isFull = assignedGuestsCount >= table.capacity;

    const [isEditingName, setIsEditingName] = useState(false);
    const [currentName, setCurrentName] = useState(table.name);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const { setNodeRef: setDroppableNodeRef, isOver: isTableOver } = useDroppable({
        id: `table-${table.id}`,
        disabled: isFull,
    });
    
    const { attributes, listeners, setNodeRef: setDraggableNodeRef, transform, isDragging } = useDraggable({
        id: `table-${table.id}`,
        data: { type: 'table' },
        disabled: isEditingName, // Disable dragging while editing name
    });

    useEffect(() => {
        if (isEditingName && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditingName]);
    
    useEffect(() => {
        // If table name is updated from outside (e.g., side list), update local state
        if (!isEditingName) {
            setCurrentName(table.name);
        }
    }, [table.name, isEditingName]);

    const handleNameChange = () => {
        setIsEditingName(false);
        const trimmedName = currentName.trim();
        if (trimmedName && trimmedName !== table.name) {
            onUpdateTableName(table.id, trimmedName);
        } else {
            setCurrentName(table.name); // Revert if empty or unchanged
        }
    };
    
    if (isOverlay) { // Simplified view for when dragging
        return (
            <div className="bg-white p-4 rounded-lg shadow-xl" style={{transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`}}>
                <div className={`relative border-4 border-gray-300 flex items-center justify-center mb-3 ${table.shape === 'Circle' ? 'w-36 h-36 rounded-full' : 'w-48 h-28 rounded-lg'}`}>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg text-gray-800">{table.name}</span>
                        <span className="text-sm text-gray-500">
                            {assignedGuestsCount} / {table.capacity}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    const staticStyle = {
        position: 'absolute' as const,
        top: `${table.y}px`,
        left: `${table.x}px`,
        opacity: isDragging ? 0.5 : 1,
    };

    const dynamicStyle = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {};
    const style = { ...staticStyle, ...dynamicStyle, zIndex: isDragging ? 50 : 10 };

    const { positions, width, height } = useMemo(() => calculateSeatPositions(table), [table]);
    const tableOverClass = isTableOver && !isFull ? 'bg-blue-50 ring-2 ring-blue-400' : 'bg-gray-200';
    const centralTableShapeStyle = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: `${width - (SEAT_DIAMETER + TABLE_PADDING) * 2}px`,
      height: `${height - (SEAT_DIAMETER + TABLE_PADDING) * 2}px`
    };

    const tableNameContent = isEditingName ? (
        <input
            ref={inputRef}
            type="text"
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            onBlur={handleNameChange}
            onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameChange();
                if (e.key === 'Escape') {
                    setCurrentName(table.name);
                    setIsEditingName(false);
                }
            }}
            className="font-bold text-lg text-gray-800 break-words bg-white w-full text-center rounded border border-blue-500"
            onClick={(e) => e.stopPropagation()} // Prevent any parent clicks
        />
    ) : (
        <div 
          className="group relative font-bold text-lg text-gray-800 break-words p-1 rounded cursor-pointer flex items-center justify-center gap-1 hover:bg-gray-300/50"
          onDoubleClick={(e) => { e.stopPropagation(); setIsEditingName(true); }}
          title="Double-click to edit table name"
        >
          <span>{table.name}</span>
          <EditIcon className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
    
    // Check if this table has a highlighted guest
    const hasHighlightedGuest = useMemo(() => {
        return table.seats.some(seat => seat.guestId === highlightedGuestId);
    }, [table.seats, highlightedGuestId]);
    
    const isHighlightedTable = highlightedTableId === table.id;
    
    // Add highlight effect
    const highlightClass = isHighlightedTable || hasHighlightedGuest 
        ? 'ring-4 ring-yellow-400 ring-offset-2 shadow-xl scale-105' 
        : '';
    
    return (
        <div 
            id={`table-${table.id}`}
            ref={setDraggableNodeRef}
            style={style}
            className={`transition-all duration-300 ${highlightClass}`}
            {...attributes}
            {...listeners}
        >
             <div ref={setDroppableNodeRef} className="relative cursor-grab" style={{ width, height }}>
                <div 
                  className={`absolute border-4 ${isHighlightedTable || hasHighlightedGuest ? 'border-yellow-400' : 'border-gray-300'} ${tableOverClass} transition-all duration-300 ${table.shape === 'Circle' ? 'rounded-full' : 'rounded-lg'}`}
                  style={centralTableShapeStyle}
                >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                        <div className="pointer-events-auto w-full">
                            {tableNameContent}
                        </div>
                        <span className={`text-sm pointer-events-none ${isFull ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                            {assignedGuestsCount} / {table.capacity}
                        </span>
                    </div>
                </div>

                {table.seats.map((seat, index) => {
                    const guest = seat.guestId ? guestsById.get(seat.guestId) ?? null : null;
                    return (
                        <div key={seat.id} className="absolute" style={positions[index]}>
                             <SeatSlot
                                seatId={seat.id}
                                guest={guest}
                                seatNumber={index + 1}
                                isOccupied={!!guest}
                                isDisabled={isFull && !guest}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};