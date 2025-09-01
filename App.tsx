import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';
import { DEFORMATIONS } from './components/deformations';
import type { DeformationDef } from './types';

// Instructions component updated for sculpting controls
const Instructions: React.FC = () => (
  <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-70 text-white p-4 rounded-lg shadow-lg max-w-sm z-10">
    <h1 className="text-xl font-bold mb-2">3D Terrain Editor</h1>
    <ul className="list-disc list-inside space-y-1 text-sm">
      <li><b>Orbit:</b> Left-click + Drag</li>
      <li><b>Pan:</b> Right-click + Drag</li>
      <li><b>Zoom:</b> Scroll wheel</li>
      <li className="font-bold pt-2">Sculpting:</li>
      <li><b>Apply Brush:</b> Left-click on grid</li>
      <li><b>Rotate Brush:</b> Press 'R' key</li>
      <li>Select a brush from the toolbar at the bottom.</li>
    </ul>
  </div>
);

// Settings panel component remains the same
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

// New component for the deformation toolbar
const DeformationToolbar: React.FC<{
  selectedDeformationId: string | null;
  onSelect: (id: string) => void;
}> = ({ selectedDeformationId, onSelect }) => (
  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 bg-opacity-70 text-white p-2 rounded-lg shadow-lg z-10 flex space-x-2">
    <h3 className="text-lg font-bold my-auto px-2">Brushes</h3>
    {DEFORMATIONS.map(def => (
      <button
        key={def.id}
        onClick={() => onSelect(def.id)}
        className={`py-2 px-4 rounded-lg transition-colors ${selectedDeformationId === def.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
        aria-pressed={selectedDeformationId === def.id}
      >
        {def.name}
      </button>
    ))}
  </div>
);


const App: React.FC = () => {
  const [gridDivisions, setGridDivisions] = useState(20);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedDeformationId, setSelectedDeformationId] = useState<string>(DEFORMATIONS[0].id);

  const selectedDeformation = DEFORMATIONS.find(d => d.id === selectedDeformationId) || null;

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

      <DeformationToolbar selectedDeformationId={selectedDeformationId} onSelect={setSelectedDeformationId} />

      <Canvas shadows camera={{ position: [0, 80, 0.1], fov: 50 }}>
        <Scene gridDivisions={gridDivisions} selectedDeformation={selectedDeformation} />
      </Canvas>
    </div>
  );
};

export default App;
