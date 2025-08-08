// src/components/CollapsibleCard.tsx
import React, { useState, useEffect } from 'react';

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  actionSlot?: React.ReactNode;
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({ title, children, defaultOpen = false, actionSlot }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isLg, setIsLg] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const checkScreenSize = () => {
      const largeScreen = window.innerWidth >= 1024;
      setIsLg(largeScreen);
       // On large screens, always keep it open; on small screens, respect its last state unless it's a default.
      if (largeScreen) {
        setIsOpen(true);
      } else {
        // This logic keeps it collapsed on mobile unless explicitly defaultOpen
        setIsOpen(defaultOpen);
      }
    };
    
    checkScreenSize(); // Initial check
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [defaultOpen]);

  const handleToggle = () => {
    // Only allow toggling on small screens
    if (!isLg) {
      setIsOpen(prev => !prev);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300">
      <button
        onClick={handleToggle}
        className="w-full flex justify-between items-center p-6 text-left"
        disabled={isLg} // Disable the button on large screens so it can't be closed
        aria-expanded={isOpen}
      >
        <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>
        <div className="flex items-center gap-4">
            {actionSlot}
            <ChevronDownIcon className={`transition-transform duration-300 lg:hidden ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <div className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
            <div className="px-6 pb-6 pt-0">
                {children}
            </div>
        </div>
      </div>
    </div>
  );
};
