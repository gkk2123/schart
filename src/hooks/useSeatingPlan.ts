// src/hooks/useSeatingPlan.ts
import { useState, useCallback } from 'react';
import type { Table } from '../types';

export const useSeatingPlan = (initialState: Table[] = []) => {
  const [history, setHistory] = useState<Table[][]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const tables = history[currentIndex];
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const setTables = useCallback((action: Table[] | ((prevState: Table[]) => Table[])) => {
    const newTables = typeof action === 'function' ? action(tables) : action;

    // Avoid adding duplicate states to the history
    if (JSON.stringify(newTables) === JSON.stringify(tables)) {
      return;
    }

    const newHistory = [...history.slice(0, currentIndex + 1), newTables];
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex, tables]);

  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex(i => i - 1);
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex(i => i + 1);
    }
  }, [canRedo]);

  const resetHistory = useCallback((initialState: Table[] = []) => {
    const newHistory = [initialState];
    setHistory(newHistory);
    setCurrentIndex(0);
  }, []);

  return { tables, setTables, undo, redo, canUndo, canRedo, resetHistory };
};
