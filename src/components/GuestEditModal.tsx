// src/components/GuestEditModal.tsx
import React, { useState, useEffect } from 'react';
import type { Guest } from '../types';

interface GuestEditModalProps {
  guest: Guest | null;
  onClose: () => void;
  onSave: (guest: Guest) => void;
  maxId: number;
}

export const GuestEditModal: React.FC<GuestEditModalProps> = ({ guest, onClose, onSave, maxId }) => {
  const [formData, setFormData] = useState<Omit<Guest, 'id'>>({
    name: '',
    group: '',
    rsvp: 'Pending',
    plusOnes: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (guest) {
      setFormData({
        name: guest.name,
        group: guest.group || '',
        rsvp: guest.rsvp || 'Pending',
        plusOnes: guest.plusOnes || 0,
      });
    } else {
        setFormData({ name: '', group: '', rsvp: 'Pending', plusOnes: 0 });
    }
    setError('');
  }, [guest]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Guest name is required.');
      return;
    }
    setError('');
    onSave({
      ...formData,
      id: guest ? guest.id : maxId + 1,
      plusOnes: 0, // Plus-ones are handled on import, disable manual creation for simplicity
    });
  };
  
  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {guest ? 'Edit Guest' : 'Add New Guest'}
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="group" className="block text-sm font-medium text-gray-700">Group (optional)</label>
              <input type="text" name="group" id="group" value={formData.group} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="rsvp" className="block text-sm font-medium text-gray-700">RSVP Status</label>
              <select name="rsvp" id="rsvp" value={formData.rsvp} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option>Attending</option>
                <option>Not Attending</option>
                <option>Pending</option>
              </select>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};