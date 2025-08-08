// src/components/EnhancedGuestSearch.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Guest, Table } from '../types';
import { useSearch } from '../context/SearchContext';

interface SearchResult {
  guest: Guest;
  table?: Table;
  seatIndex?: number;
}

interface EnhancedGuestSearchProps {
  guests: Guest[];
  tables: Table[];
  onGuestSelect?: (guest: Guest, table?: Table) => void;
  onScrollToTable?: (tableId: number) => void;
}

export const EnhancedGuestSearch: React.FC<EnhancedGuestSearchProps> = ({
  guests,
  tables,
  onGuestSelect,
  onScrollToTable
}) => {
  const { searchTerm, setSearchTerm, setHighlightedGuestId, setHighlightedTableId, clearHighlight } = useSearch();
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Create a map of guest locations
  const guestLocations = useMemo(() => {
    const locations = new Map<number, { table: Table; seatIndex: number }>();
    
    tables.forEach(table => {
      table.seats.forEach((seat, index) => {
        if (seat.guestId !== null) {
          locations.set(seat.guestId, { table, seatIndex: index });
        }
      });
    });
    
    return locations;
  }, [tables]);

  // Search results with table information
  const searchResults = useMemo((): SearchResult[] => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const lowerSearch = searchTerm.toLowerCase();
    return guests
      .filter(guest => 
        guest.name.toLowerCase().includes(lowerSearch) ||
        guest.group?.toLowerCase().includes(lowerSearch)
      )
      .map(guest => {
        const location = guestLocations.get(guest.id);
        return {
          guest,
          table: location?.table,
          seatIndex: location?.seatIndex
        };
      })
      .slice(0, 10); // Limit to 10 results
  }, [searchTerm, guests, guestLocations]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(value.length >= 2);
    setSelectedIndex(0);
    
    if (value.length < 2) {
      clearHighlight();
    }
  };

  // Handle result selection
  const handleSelectResult = useCallback((result: SearchResult) => {
    setHighlightedGuestId(result.guest.id);
    
    if (result.table) {
      setHighlightedTableId(result.table.id);
      onScrollToTable?.(result.table.id);
    } else {
      setHighlightedTableId(null);
    }
    
    onGuestSelect?.(result.guest, result.table);
    setShowResults(false);
  }, [setHighlightedGuestId, setHighlightedTableId, onGuestSelect, onScrollToTable]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showResults || searchResults.length === 0) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % searchResults.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
          break;
        case 'Enter':
          e.preventDefault();
          handleSelectResult(searchResults[selectedIndex]);
          break;
        case 'Escape':
          setShowResults(false);
          clearHighlight();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResults, searchResults, selectedIndex, handleSelectResult, clearHighlight]);

  // Auto-highlight first result
  useEffect(() => {
    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      setHighlightedGuestId(firstResult.guest.id);
      if (firstResult.table) {
        setHighlightedTableId(firstResult.table.id);
      }
    } else {
      clearHighlight();
    }
  }, [searchResults, setHighlightedGuestId, setHighlightedTableId, clearHighlight]);

  const getRsvpBadge = (rsvp: Guest['rsvp']) => {
    const badges = {
      'Attending': 'bg-green-100 text-green-800',
      'Not Attending': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800'
    };
    return badges[rsvp] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
          placeholder="🔍 Search guests by name or group..."
          className="w-full px-4 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          aria-label="Search guests"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-expanded={showResults}
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              clearHighlight();
              setShowResults(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div
          id="search-results"
          className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto"
        >
          <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-600">
              Found {searchResults.length} guest{searchResults.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {searchResults.map((result, index) => (
            <button
              key={result.guest.id}
              onClick={() => handleSelectResult(result)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full px-3 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                selectedIndex === index ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{result.guest.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRsvpBadge(result.guest.rsvp)}`}>
                      {result.guest.rsvp}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {result.guest.group && <span>Group: {result.guest.group}</span>}
                    {result.guest.plusOnes > 0 && <span className="ml-2">+{result.guest.plusOnes}</span>}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {result.table ? (
                    <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <span className="text-xs font-semibold">{result.table.name}</span>
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                      <span className="text-xs">Unassigned</span>
                    </div>
                  )}
                  
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {showResults && searchTerm.length >= 2 && searchResults.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl p-4">
          <p className="text-gray-500 text-center">No guests found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Search Stats */}
      {searchTerm && searchResults.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-semibold">{searchResults.filter(r => r.table).length}</span> seated, 
          <span className="font-semibold ml-1">{searchResults.filter(r => !r.table).length}</span> unassigned
        </div>
      )}
    </div>
  );
};