// src/context/SearchContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  highlightedGuestId: number | null;
  setHighlightedGuestId: (id: number | null) => void;
  highlightedTableId: number | null;
  setHighlightedTableId: (id: number | null) => void;
  clearHighlight: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedGuestId, setHighlightedGuestId] = useState<number | null>(null);
  const [highlightedTableId, setHighlightedTableId] = useState<number | null>(null);

  const clearHighlight = useCallback(() => {
    setHighlightedGuestId(null);
    setHighlightedTableId(null);
  }, []);

  return (
    <SearchContext.Provider value={{
      searchTerm,
      setSearchTerm,
      highlightedGuestId,
      setHighlightedGuestId,
      highlightedTableId,
      setHighlightedTableId,
      clearHighlight
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};