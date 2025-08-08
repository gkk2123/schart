// src/components/ProjectControls.tsx
import React from 'react';

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const UploadIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export const ProjectControls: React.FC<{
  onSave: () => void;
  onLoad: (file: File) => void;
  loadError: string | null;
  clearLoadError: () => void;
}> = ({ onSave, onLoad, loadError, clearLoadError }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      clearLoadError();
      onLoad(file);
    }
    // Reset file input so the same file can be loaded again
    event.target.value = ''; 
  };

  return (
    <>
      <div className="space-y-4">
        <div>
            <button
              onClick={onSave}
              className="w-full px-6 py-3 text-white font-semibold rounded-lg shadow-md bg-green-600 hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
              aria-label="Save current project to a file"
            >
              <DownloadIcon />
              Save Project
            </button>
            <p className="text-xs text-gray-500 mt-1 text-center">Saves the plan to a `.json` file.</p>
        </div>
        <div>
            <label
              htmlFor="load-project-input"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg shadow-md cursor-pointer transition-colors duration-300 bg-gray-600 hover:bg-gray-700 text-center"
            >
              <UploadIcon />
              Load Project
            </label>
            <input
              id="load-project-input"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Load project from a file"
            />
             <p className="text-xs text-gray-500 mt-1 text-center">Loads a plan from a `.json` file.</p>
        </div>
      </div>
        {loadError && (
            <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                <p className="font-bold">Load Error</p>
                <p>{loadError}</p>
            </div>
        )}
    </>
  );
};