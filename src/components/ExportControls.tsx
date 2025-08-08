// src/components/ExportControls.tsx
import React, { useState } from 'react';

const ExportIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);


export const ExportControls: React.FC<{
  onExport: () => Promise<void>;
  onExportJpeg: () => Promise<void>;
  isDisabled: boolean;
}> = ({ onExport, onExportJpeg, isDisabled }) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingJpeg, setIsExportingJpeg] = useState(false);

  const handleExportPdfClick = async () => {
    if (isExportingPdf || isDisabled) return;
    setIsExportingPdf(true);
    try {
      await onExport();
    } catch (error) {
      console.error("Failed to export PDF:", error);
    } finally {
      setIsExportingPdf(false);
    }
  };
  
  const handleExportJpegClick = async () => {
    if (isExportingJpeg || isDisabled) return;
    setIsExportingJpeg(true);
    try {
      await onExportJpeg();
    } catch (error) {
      console.error("Failed to export JPEG:", error);
    } finally {
      setIsExportingJpeg(false);
    }
  };

  const isAnyExporting = isExportingPdf || isExportingJpeg;

  return (
    <div className="space-y-4">
      <button
        onClick={handleExportPdfClick}
        disabled={isAnyExporting || isDisabled}
        className="w-full px-6 py-3 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors duration-300 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed"
        aria-label="Export seating chart to PDF"
      >
        <ExportIcon />
        {isExportingPdf ? 'Generating PDF...' : 'Export to PDF'}
      </button>

      <button
        onClick={handleExportJpegClick}
        disabled={isAnyExporting || isDisabled}
        className="w-full px-6 py-3 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors duration-300 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed"
        aria-label="Export seating chart as a JPEG image"
      >
        <ExportIcon />
        {isExportingJpeg ? 'Generating JPEG...' : 'Export as JPEG'}
      </button>

      <p className="text-xs text-gray-500 text-center">
          {isDisabled ? 'Add tables and assign guests to enable export.' : 'Generates a PDF or JPEG of the seating plan.'}
      </p>
    </div>
  );
};