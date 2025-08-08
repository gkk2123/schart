// src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: () => void;
  description?: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? (event.ctrlKey || event.metaKey) : true;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : true;
        const altMatch = shortcut.altKey ? event.altKey : true;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Common keyboard shortcuts
export const COMMON_SHORTCUTS = {
  UNDO: { key: 'z', ctrlKey: true, description: 'Undo last action' },
  REDO: { key: 'y', ctrlKey: true, description: 'Redo last action' },
  SAVE: { key: 's', ctrlKey: true, description: 'Save project' },
  SEARCH: { key: 'f', ctrlKey: true, description: 'Focus search' },
  EXPORT: { key: 'e', ctrlKey: true, description: 'Export PDF' },
  NEW_GUEST: { key: 'n', ctrlKey: true, description: 'Add new guest' },
  NEW_TABLE: { key: 't', ctrlKey: true, description: 'Add new table' },
  ZOOM_IN: { key: '+', ctrlKey: true, description: 'Zoom in' },
  ZOOM_OUT: { key: '-', ctrlKey: true, description: 'Zoom out' },
  RESET_ZOOM: { key: '0', ctrlKey: true, description: 'Reset zoom' },
  HELP: { key: '?', description: 'Show help' },
  ESCAPE: { key: 'Escape', description: 'Close dialogs' }
};