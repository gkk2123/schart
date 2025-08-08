// src/components/SeatingControls.tsx
import React, { useState, useEffect } from 'react';

const SparklesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm6 0a1 1 0 011 1v1h1a1 1 0 010 2h-1v1a1 1 0 01-2 0V6h-1a1 1 0 010-2h1V3a1 1 0 011-1zM9 9a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-3 2a1 1 0 100 2h1a1 1 0 100-2H6zm-1-4a1 1 0 011-1h1a1 1 0 110 2H6a1 1 0 01-1-1zm8 6a1 1 0 100 2h1a1 1 0 100-2h-1z" clipRule="evenodd" />
    </svg>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const UndoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8A5 5 0 0019 5H9" />
    </svg>
);

const RedoIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 15l3-3m0 0l-3-3m3 3H5a5 5 0 000 10h2" />
    </svg>
);


export const SeatingControls: React.FC<{
  onAutoSeatByGroup: () => void;
  onAutoSeatByAffiliation: () => void;
  onAutoSeatAll: () => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isSeatingDisabled: boolean;
  sheetNames: string[];
  onAutoSeatFromSheet: (sheetName: string) => void;
}> = ({ onAutoSeatByGroup, onAutoSeatByAffiliation, onAutoSeatAll, onClear, onUndo, onRedo, canUndo, canRedo, isSeatingDisabled, sheetNames, onAutoSeatFromSheet }) => {
  const [selectedSheet, setSelectedSheet] = useState('');

  useEffect(() => {
    // Reset selection if sheet list changes and selected sheet is no longer valid
    if (sheetNames.length > 0 && !sheetNames.includes(selectedSheet)) {
      setSelectedSheet('');
    } else if (sheetNames.length === 0) {
      setSelectedSheet('');
    }
  }, [sheetNames, selectedSheet]);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors duration-200 bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        aria-label="Undo last action"
      >
        <UndoIcon />
        Undo
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors duration-200 bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        aria-label="Redo last action"
      >
        <RedoIcon />
        Redo
      </button>
      <div className="h-6 w-px bg-gray-300 mx-1"></div>

      {sheetNames.length > 0 && (
          <div className="flex items-center gap-2">
            <select
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                className="form-select block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-white"
                aria-label="Select sheet to auto-seat from"
            >
                <option value="">Select Sheet to Seat...</option>
                {sheetNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
            <button
                onClick={() => onAutoSeatFromSheet(selectedSheet)}
                disabled={!selectedSheet || isSeatingDisabled}
                title="Seat unassigned guests from the selected sheet."
                className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors duration-200 bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-cyan-300 disabled:cursor-not-allowed whitespace-nowrap"
            >
                <SparklesIcon />
                Seat From Sheet
            </button>
            <div className="h-6 w-px bg-gray-300 mx-1"></div>
          </div>
      )}
      
      <button
        onClick={onAutoSeatByAffiliation}
        disabled={isSeatingDisabled}
        title="Seats guests by splitting tables between Bride and Groom affiliations."
        className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors duration-200 bg-pink-600 text-white hover:bg-pink-700 disabled:bg-pink-300 disabled:cursor-not-allowed whitespace-nowrap"
      >
        <SparklesIcon />
        Auto-Seat Bride/Groom
      </button>

      <button
        onClick={onAutoSeatByGroup}
        disabled={isSeatingDisabled}
        title="Seats all attending guests, trying to keep groups together."
        className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors duration-200 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed whitespace-nowrap"
      >
        <SparklesIcon />
        Auto-Seat by Group
      </button>
       <button
        onClick={onAutoSeatAll}
        disabled={isSeatingDisabled}
        title="Seats remaining unassigned guests randomly."
        className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors duration-200 bg-teal-600 text-white hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed whitespace-nowrap"
      >
        <SparklesIcon />
        Seat All Guests
      </button>
      <button
        onClick={onClear}
        className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors duration-200 bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300 whitespace-nowrap"
      >
        <TrashIcon />
        Clear All Assignments
      </button>
    </div>
  );
};