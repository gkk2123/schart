// src/components/SeatingArea.tsx
import React, { useMemo, useState, useRef, useCallback } from 'react';
import { TableCard } from './TableCard';
import { SeatingControls } from './SeatingControls';
import { ZoomControls } from './ZoomControls';
import type { Table, Guest } from '../types';

export const SeatingArea: React.FC<{
  tables: Table[];
  guestsById: Map<number, Guest>;
  onAutoSeatByGroup: () => void;
  onAutoSeatByAffiliation: () => void;
  onAutoSeatAll: () => void;
  onUpdateTableName: (tableId: number, newName: string) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  splitGroupsNotification: string | null;
  isSeatingDisabled: boolean;
  sheetNames: string[];
  onAutoSeatFromSheet: (sheetName: string) => void;
}> = ({
    tables, guestsById, onAutoSeatByGroup, onAutoSeatByAffiliation, onAutoSeatAll, onUpdateTableName, 
    onClear, onUndo, onRedo, canUndo, canRedo, splitGroupsNotification, isSeatingDisabled,
    sheetNames, onAutoSeatFromSheet
}) => {
    const totalGuestCount = useMemo(() => Array.from(guestsById.values()).length, [guestsById]);
    const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0);
    const [zoom, setZoom] = useState(1);
    const seatingAreaRef = useRef<HTMLDivElement>(null);

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(2, prev + 0.1));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(0.25, prev - 0.1));
    }, []);

    const handleResetZoom = useCallback(() => {
        setZoom(1);
    }, []);

    const handleFitToScreen = useCallback(() => {
        if (!seatingAreaRef.current || tables.length === 0) return;
        
        const container = seatingAreaRef.current;
        const containerWidth = container.clientWidth - 32; // Subtract padding
        const containerHeight = container.clientHeight - 32;
        
        // Find the bounds of all tables
        let maxX = 0;
        let maxY = 0;
        tables.forEach(table => {
            maxX = Math.max(maxX, table.x + 350); // Approximate table width
            maxY = Math.max(maxY, table.y + 350); // Approximate table height
        });
        
        if (maxX > 0 && maxY > 0) {
            const scaleX = containerWidth / maxX;
            const scaleY = containerHeight / maxY;
            const newZoom = Math.min(scaleX, scaleY, 1);
            setZoom(Math.max(0.25, Math.min(2, newZoom)));
        }
    }, [tables]);

    if (tables.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg h-full flex flex-col justify-center items-center text-center min-h-[400px]">
                <h3 className="text-xl font-semibold text-gray-700">Seating Area</h3>
                <p className="text-gray-500 mt-2">Add some tables using the form on the left to begin planning.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-gray-700">Seating Plan</h3>
                <div className="text-right">
                    <p className="font-semibold text-gray-800">Capacity: {totalCapacity}</p>
                    <p className={`text-sm ${totalGuestCount > totalCapacity ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                        Total Guests: {totalGuestCount}
                    </p>
                </div>
            </div>
            
            <SeatingControls 
                onAutoSeatByGroup={onAutoSeatByGroup}
                onAutoSeatByAffiliation={onAutoSeatByAffiliation}
                onAutoSeatAll={onAutoSeatAll}
                onClear={onClear} 
                onUndo={onUndo}
                onRedo={onRedo}
                canUndo={canUndo}
                canRedo={canRedo}
                isSeatingDisabled={isSeatingDisabled} 
                sheetNames={sheetNames}
                onAutoSeatFromSheet={onAutoSeatFromSheet}
            />

            {splitGroupsNotification && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-4" role="alert">
                    <p className="font-bold">Auto-Seat Status</p>
                    <p>{splitGroupsNotification}</p>
                </div>
            )}

            <div className="relative">
                <div 
                    ref={seatingAreaRef}
                    id="seating-plan-area" 
                    className="relative w-full min-h-[600px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 overflow-auto"
                    style={{ height: '600px' }}
                >
                    <div 
                        style={{ 
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top left',
                            transition: 'transform 0.2s ease-out',
                            width: 'max-content',
                            minWidth: '100%',
                            minHeight: '1200px'
                        }}
                    >
                        {tables.map(table => (
                            <TableCard 
                                key={table.id} 
                                table={table} 
                                guestsById={guestsById}
                                onUpdateTableName={onUpdateTableName}
                            />
                        ))}
                    </div>
                </div>
                <ZoomControls
                    zoom={zoom}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onResetZoom={handleResetZoom}
                    onFitToScreen={handleFitToScreen}
                />
            </div>
        </div>
    );
};