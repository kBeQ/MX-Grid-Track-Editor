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

// New component for controls
const Controls: React.FC<{ gridDivisions: number; onGridDivisionsChange: (newSize: number) => void; }> = ({ gridDivisions, onGridDivisionsChange }) => {
  const [inputValue, setInputValue] = useState(gridDivisions.toString());

  useEffect(() => {
    setInputValue(gridDivisions.toString());
  }, [gridDivisions]);

  const handleApply = () => {
    const newSize = parseInt(inputValue, 10);
    if (!isNaN(newSize) && newSize > 0) {
      onGridDivisionsChange(newSize);
    } else {
      setInputValue(gridDivisions.toString());
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

  return (
    <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-70 text-white p-4 rounded-lg shadow-lg max-w-sm z-10">
      <label htmlFor="grid-size-input" className="text-sm font-bold mb-2 block">Grid Scale</label>
      <input
        id="grid-size-input"
        type="number"
        min="1"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleApply}
        className="bg-gray-700 text-white rounded px-2 py-1 w-full"
        aria-label="Grid scale input"
      />
    </div>
  );
};


const App: React.FC = () => {
  const [gridDivisions, setGridDivisions] = useState(20);

  return (
    <div className="w-screen h-screen bg-gray-800">
      <Instructions />
      <Controls gridDivisions={gridDivisions} onGridDivisionsChange={setGridDivisions} />
      <Canvas shadows>
        <Scene gridDivisions={gridDivisions} />
      </Canvas>
    </div>
  );
};

export default App;