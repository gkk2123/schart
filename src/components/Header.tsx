// src/components/Header.tsx
import React from 'react';

export const Header: React.FC = () => (
  <header className="bg-white shadow-md">
    <div className="container mx-auto px-6 py-4">
      <h1 className="text-3xl font-bold text-gray-800">
        Interactive Seating Chart
      </h1>
      <p className="text-sm text-gray-600">
        Create, manage, and export your event seating plan with ease.
      </p>
    </div>
  </header>
);
