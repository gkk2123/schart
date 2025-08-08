// src/components/HelpModal.tsx
import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: 'Ctrl+Z', description: 'Undo last action' },
    { keys: 'Ctrl+Y', description: 'Redo last action' },
    { keys: 'Ctrl+S', description: 'Save project' },
    { keys: 'Ctrl+E', description: 'Export PDF' },
    { keys: 'Ctrl+F', description: 'Focus search' },
    { keys: 'Ctrl+N', description: 'Add new guest' },
    { keys: 'Ctrl+T', description: 'Add new table' },
    { keys: 'Ctrl++', description: 'Zoom in' },
    { keys: 'Ctrl+-', description: 'Zoom out' },
    { keys: 'Ctrl+0', description: 'Reset zoom' },
    { keys: 'Esc', description: 'Close dialogs' },
    { keys: '?', description: 'Show this help' },
  ];

  const features = [
    {
      title: 'Drag & Drop',
      items: [
        'Drag guests from the list to seats',
        'Drag between seats to swap guests',
        'Drag tables to reposition them',
        'Drag guests back to unassigned list',
      ]
    },
    {
      title: 'Search & Highlight',
      items: [
        'Search guests by name or group',
        'Searched guests are highlighted in yellow',
        'Click search result to focus on table',
        'Use arrow keys to navigate results',
      ]
    },
    {
      title: 'Auto-Seating',
      items: [
        'Auto-seat by group keeps groups together',
        'Auto-seat by affiliation groups similar guests',
        'Auto-seat all fills remaining seats',
        'Auto-seat from specific Excel sheets',
      ]
    },
    {
      title: 'Export Options',
      items: [
        'Export to PDF for printing',
        'Export to JPEG for sharing',
        'Save project as JSON file',
        'Load previous project files',
      ]
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Help & Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close help"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Keyboard Shortcuts */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-700">{shortcut.description}</span>
                  <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-mono">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">Features</h3>
            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">{feature.title}</h4>
                  <ul className="space-y-1">
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-blue-700 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">💡 Pro Tips</h3>
            <ul className="space-y-1 text-sm text-yellow-700">
              <li>• Double-click table names to edit them</li>
              <li>• Use the floating action button (bottom-left) for quick actions</li>
              <li>• Zoom controls are in the bottom-right of the seating area</li>
              <li>• Groups with the same affiliation will be seated together when possible</li>
              <li>• The search highlights both the guest and their table</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};