import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';

// Instructions component defined inside App.tsx to reduce file count
const Instructions: React.FC = () => (
  <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-70 text-white p-4 rounded-lg shadow-lg max-w-sm z-10">
    <h1 className="text-xl font-bold mb-2">3D Terrain Editor</h1>
    <ul className="list-disc list-inside space-y-1 text-sm">
      <li><b>Orbit:</b> Left-click + Drag</li>
      <li><b>Pan:</b> Right-click + Drag</li>
      <li><b>Zoom:</b> Scroll wheel</li>
      <li><b>Select Cell:</b> Click on a grid cell</li>
      <li><b>Multi-select:</b> Shift + Click on grid cells</li>
    </ul>
  </div>
);

// New component for the settings panel
const SettingsPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  gridDivisions: number;
  onGridDivisionsChange: (newSize: number) => void;
}> = ({ isOpen, onClose, gridDivisions, onGridDivisionsChange }) => {
  const [inputValue, setInputValue] = useState(gridDivisions.toString());

  useEffect(() => {
    setInputValue(gridDivisions.toString());
  }, [gridDivisions]);

  const handleApply = () => {
    const newSize = parseInt(inputValue, 10);
    if (!isNaN(newSize) && newSize > 0) {
      onGridDivisionsChange(newSize);
    } else {
      setInputValue(gridDivisions.toString()); // Reset if invalid
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
       if (event.key === 'Escape') {
        onClose();
       }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
        window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20" aria-modal="true" role="dialog">
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none" aria-label="Close settings">&times;</button>
        </div>
        <div>
          <label htmlFor="grid-size-input" className="text-sm font-bold mb-2 block">Grid Scale</label>
          <div className="flex items-center space-x-2">
            <input
              id="grid-size-input"
              type="number"
              min="1"
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="bg-gray-700 text-white rounded px-2 py-1 w-full"
              aria-label="Grid scale input"
            />
            <button
              onClick={handleApply}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [gridDivisions, setGridDivisions] = useState(20);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="w-screen h-screen bg-gray-800">
      <Instructions />
      
      <button 
        onClick={() => setIsSettingsOpen(true)}
        className="absolute top-4 right-4 bg-gray-900 bg-opacity-70 text-white py-2 px-4 rounded-lg shadow-lg z-10 hover:bg-opacity-90 transition-colors"
        aria-haspopup="dialog"
      >
        Settings
      </button>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        gridDivisions={gridDivisions}
        onGridDivisionsChange={setGridDivisions}
      />

      <Canvas shadows>
        <Scene gridDivisions={gridDivisions} />
      </Canvas>
    </div>
  );
};

export default App;