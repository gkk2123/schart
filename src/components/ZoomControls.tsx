// src/components/ZoomControls.tsx
import React from 'react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen
}) => {
  const zoomPercentage = Math.round(zoom * 100);
  
  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 flex items-center gap-2 z-20">
      <button
        onClick={onFitToScreen}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Fit to screen"
        aria-label="Fit to screen"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>
      
      <div className="w-px h-6 bg-gray-300" />
      
      <button
        onClick={onZoomOut}
        disabled={zoom <= 0.25}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Zoom out (Ctrl+-)"
        aria-label="Zoom out"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      
      <button
        onClick={onResetZoom}
        className="px-3 py-1 min-w-[60px] text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Reset zoom to 100%"
      >
        {zoomPercentage}%
      </button>
      
      <button
        onClick={onZoomIn}
        disabled={zoom >= 2}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Zoom in (Ctrl++)"
        aria-label="Zoom in"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};