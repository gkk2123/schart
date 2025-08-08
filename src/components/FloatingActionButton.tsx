// src/components/FloatingActionButton.tsx
import React, { useState } from 'react';

interface FloatingAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color?: string;
}

interface FloatingActionButtonProps {
  actions: FloatingAction[];
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 left-8 z-50">
      {/* Action Menu */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 mb-2 space-y-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              disabled={action.disabled}
              className={`
                flex items-center gap-3 px-4 py-2 rounded-lg shadow-lg
                transform transition-all duration-200 hover:scale-105
                ${action.disabled 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : action.color || 'bg-white text-gray-700 hover:bg-gray-50'
                }
              `}
              style={{
                animation: isOpen ? 'slideUp 0.2s ease-out' : 'none',
                animationFillMode: 'forwards'
              }}
            >
              {action.icon}
              <span className="font-medium whitespace-nowrap">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center
          transform transition-all duration-300 hover:scale-110
          ${isOpen 
            ? 'bg-gray-600 rotate-45' 
            : 'bg-blue-600 hover:bg-blue-700'
          }
        `}
        aria-label="Quick actions menu"
      >
        <svg 
          className="w-6 h-6 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 4v16m8-8H4" 
          />
        </svg>
      </button>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};