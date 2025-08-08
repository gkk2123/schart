// src/components/GuestImporter.tsx
import React, { useState } from 'react';
import type { Guest } from '../types';
import { validateFileUpload, ExcelRowSchema, findDuplicateGuests } from '../utils/validation';
import { LoadingSpinner, ProgressBar } from './LoadingSpinner';
import { useToast } from './Toast';

// Assume SheetJS is loaded from a CDN and available on window.XLSX
declare var XLSX: any;

export const GuestImporter: React.FC<{ onGuestsImported: (guests: Guest[]) => void }> = ({ onGuestsImported }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const { success, error: showError, warning } = useToast();

  const parseFile = (file: File): Promise<Omit<Guest, 'id'>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          let allGuestsFromFile: Omit<Guest, 'id'>[] = [];

          if (workbook.SheetNames.length === 0) {
              throw new Error(`File ${file.name} contains no sheets.`);
          }

          for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);

            const importedGuests = json.map((row, index): Omit<Guest, 'id'> | null => {
              const nameKey = Object.keys(row).find(k => k.toLowerCase() === 'name');
              const groupKey = Object.keys(row).find(k => k.toLowerCase() === 'group');
              const rsvpKey = Object.keys(row).find(k => k.toLowerCase() === 'rsvp');
              const plusOnesKey = Object.keys(row).find(k => k.toLowerCase().replace(/ /g, '') === 'plusones');
              
              if (!nameKey || !row[nameKey]) {
                // Skip rows without a name silently, as they are often headers or empty.
                // For stricter validation, you could throw an error here.
                return null;
              }

              const rsvpValue = row[rsvpKey];
              // Handle various RSVP formats
              let rsvpStatus: Guest['rsvp'] = 'Pending'; // Default to Pending instead of Attending
              
              if (rsvpValue) {
                const normalizedRsvp = String(rsvpValue).trim().toLowerCase();
                
                // Check for various attendance formats
                if (normalizedRsvp === 'attending' || normalizedRsvp === 'yes' || normalizedRsvp === 'y' || normalizedRsvp === '참석' || normalizedRsvp === 'o') {
                  rsvpStatus = 'Attending';
                } else if (normalizedRsvp === 'not attending' || normalizedRsvp === 'no' || normalizedRsvp === 'n' || normalizedRsvp === '불참' || normalizedRsvp === 'x') {
                  rsvpStatus = 'Not Attending';
                } else if (normalizedRsvp === 'pending' || normalizedRsvp === 'maybe' || normalizedRsvp === '미정') {
                  rsvpStatus = 'Pending';
                }
              }

              return {
                name: String(row[nameKey]),
                group: groupKey ? String(row[groupKey]) : undefined,
                rsvp: rsvpStatus,
                plusOnes: plusOnesKey ? parseInt(String(row[plusOnesKey]), 10) || 0 : 0,
                sourceSheet: sheetName,
              };
            }).filter((g): g is Omit<Guest, 'id'> => g !== null);
            allGuestsFromFile.push(...importedGuests);
          }
          resolve(allGuestsFromFile);
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      };
      reader.onerror = () => {
        reject(new Error(`Failed to read the file: ${file.name}.`));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setError(null);

    let allRawGuests: Omit<Guest, 'id'>[] = [];
    const errors: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const guestsFromFile = await parseFile(file);
        allRawGuests.push(...guestsFromFile);
      } catch (err) {
        const message = err instanceof Error ? err.message : `An unknown error occurred with ${file.name}`;
        errors.push(message);
      }
    }
    
    // De-duplicate guests from all files based on name
    const guestNames = new Set<string>();
    const uniqueGuests: Omit<Guest, 'id'>[] = [];
    for (const guest of allRawGuests) {
      const lowerCaseName = guest.name.toLowerCase().trim();
      if (lowerCaseName && !guestNames.has(lowerCaseName)) {
        guestNames.add(lowerCaseName);
        uniqueGuests.push(guest);
      }
    }

    // Expand plus-ones and assign final IDs
    const finalGuests: Guest[] = [];
    let idCounter = 0;
    uniqueGuests.forEach(guest => {
      finalGuests.push({ ...guest, id: idCounter++ });
      if (guest.plusOnes && guest.plusOnes > 0) {
        for (let i = 0; i < guest.plusOnes; i++) {
          finalGuests.push({
            id: idCounter++,
            name: `${guest.name}'s Guest ${i + 1}`,
            group: guest.group,
            rsvp: guest.rsvp,
            plusOnes: 0,
            sourceSheet: guest.sourceSheet,
          });
        }
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }
    
    onGuestsImported(finalGuests);
    
    setIsLoading(false);
    event.target.value = '';
  };

  return (
    <>
      <p className="text-gray-600 mb-4">
        Upload one or more Excel (.xlsx, .xls) files. All sheets will be read. Columns: <strong>Name</strong> (required), <strong>Group</strong>, <strong>RSVP</strong>, <strong>PlusOnes</strong>.
      </p>
      <div className="flex items-center space-x-4">
        <label htmlFor="file-upload" className={`inline-block px-6 py-3 text-white font-semibold rounded-lg shadow-md cursor-pointer transition-colors duration-300 ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {isLoading ? 'Processing...' : 'Upload File(s)'}
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".xlsx, .xls"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
          multiple
          aria-label="Upload guest list file"
        />
      </div>
      {error && <p className="mt-4 text-red-500 font-semibold whitespace-pre-wrap">{error}</p>}
    </>
  );
};