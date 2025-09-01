import React from 'react';
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


const App: React.FC = () => {
  return (
    <div className="w-screen h-screen bg-gray-800">
      <Instructions />
      <Canvas shadows>
        <Scene />
      </Canvas>
    </div>
  );
};

export default App;
