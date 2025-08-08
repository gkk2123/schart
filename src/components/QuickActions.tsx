// src/components/QuickActions.tsx
import React from 'react';
import type { Guest, Table } from '../types';

interface QuickActionsProps {
  guests: Guest[];
  tables: Table[];
  unassignedCount: number;
  onQuickAction: (action: string) => void;
  onExport: () => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  guests,
  tables,
  unassignedCount,
  onQuickAction,
  onExport,
  onSave,
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) => {
  const totalSeats = tables.reduce((sum, t) => sum + t.capacity, 0);
  const assignedSeats = tables.reduce((sum, t) => 
    sum + t.seats.filter(s => s.guestId !== null).length, 0
  );
  const availableSeats = totalSeats - assignedSeats;
  const totalGuests = guests.length;
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-colors ${
              canUndo 
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Undo last action"
            title="Undo (Ctrl+Z)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-colors ${
              canRedo 
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Redo last action"
            title="Redo (Ctrl+Y)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="bg-blue-50 p-2 rounded">
          <span className="text-blue-600">Seats Available:</span>
          <span className="font-bold text-blue-800 ml-1">{availableSeats}</span>
        </div>
        <div className="bg-yellow-50 p-2 rounded">
          <span className="text-yellow-600">Unassigned:</span>
          <span className="font-bold text-yellow-800 ml-1">{unassignedCount}</span>
        </div>
        <div className="bg-green-50 p-2 rounded">
          <span className="text-green-600">Assigned:</span>
          <span className="font-bold text-green-800 ml-1">{assignedSeats}</span>
        </div>
        <div className="bg-purple-50 p-2 rounded">
          <span className="text-purple-600">Tables:</span>
          <span className="font-bold text-purple-800 ml-1">{tables.length}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {unassignedCount > 0 && (
          <button
            onClick={() => onQuickAction('autoSeatAll')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Auto-Seat All Guests
          </button>
        )}

        {assignedSeats > 0 && (
          <button
            onClick={() => onQuickAction('clearAll')}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All Assignments
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExport}
            disabled={tables.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Export PDF
          </button>
          
          <button
            onClick={onSave}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
            </svg>
            Save
          </button>
        </div>

        {availableSeats < unassignedCount && (
          <div className="p-2 bg-red-50 rounded-lg">
            <p className="text-xs text-red-700">
              ⚠️ Not enough seats! Need {unassignedCount - availableSeats} more seats.
            </p>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-600 mb-2">Keyboard Shortcuts</h4>
        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Undo</span>
            <kbd className="px-2 py-0.5 bg-gray-100 rounded">Ctrl+Z</kbd>
          </div>
          <div className="flex justify-between">
            <span>Redo</span>
            <kbd className="px-2 py-0.5 bg-gray-100 rounded">Ctrl+Y</kbd>
          </div>
          <div className="flex justify-between">
            <span>Search</span>
            <kbd className="px-2 py-0.5 bg-gray-100 rounded">Ctrl+F</kbd>
          </div>
          <div className="flex justify-between">
            <span>Save</span>
            <kbd className="px-2 py-0.5 bg-gray-100 rounded">Ctrl+S</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};