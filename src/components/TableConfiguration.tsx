// src/components/TableConfiguration.tsx
import React, { useState } from 'react';
import type { Table } from '../types';

export const TableConfiguration: React.FC<{ onAddTable: (table: Omit<Table, 'id' | 'seats' | 'x' | 'y'>) => void }> = ({ onAddTable }) => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(8);
  const [shape, setShape] = useState<'Circle' | 'Rectangle'>('Circle');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (capacity <= 0) {
      setError('Capacity must be greater than 0.');
      return;
    }
    
    setError('');
    onAddTable({ name, capacity, shape });
    setName(''); // Reset form
  };

  return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="table-name" className="block text-sm font-medium text-gray-700">Table Name (Optional)</label>
          <input
            id="table-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., Table 1, Head Table"
          />
        </div>
        <div>
          <label htmlFor="table-capacity" className="block text-sm font-medium text-gray-700">Seats</label>
          <input
            id="table-capacity"
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 1)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="table-shape" className="block text-sm font-medium text-gray-700">Shape</label>
          <select
            id="table-shape"
            value={shape}
            onChange={(e) => setShape(e.target.value as 'Circle' | 'Rectangle')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option>Circle</option>
            <option>Rectangle</option>
          </select>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full px-6 py-3 text-white font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 transition-colors duration-300">
          Add Table
        </button>
      </form>
  );
};