import React, { useState, useEffect, useRef } from 'react';
import { BRUSHES } from '../lib/brushes';
import type { Deformation } from '../types';
import { HelpIcon, ResetIcon, SettingsIcon } from './icons';

// High-resolution canvas-based brush preview renderer
const BrushPreview: React.FC<{ className?: string; shape: Deformation; }> = ({ className, shape }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const PREVIEW_RESOLUTION = 256;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !shape || shape.length === 0 || shape[0].length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const allValues = shape.flat();
    const min = Math.min(...allValues, 0); // Include 0 in range for better visualization
    const max = Math.max(...allValues, 0);
    const range = max - min;
    
    const imageData = ctx.createImageData(PREVIEW_RESOLUTION, PREVIEW_RESOLUTION);
    const data = imageData.data;

    const interpolate = (v11: number, v12: number, v21: number, v22: number, dx: number, dy: number) => {
      const w1 = (1 - dx) * v11 + dx * v21;
      const w2 = (1 - dx) * v12 + dx * v22;
      return (1 - dy) * w1 + dy * w2;
    };

    for (let y = 0; y < PREVIEW_RESOLUTION; y++) {
      for (let x = 0; x < PREVIEW_RESOLUTION; x++) {
        const u = (x / (PREVIEW_RESOLUTION - 1)) * (shape[0].length - 1);
        const v = (y / (PREVIEW_RESOLUTION - 1)) * (shape.length - 1);

        const x1 = Math.floor(u), y1 = Math.floor(v);
        const x2 = Math.min(x1 + 1, shape[0].length - 1), y2 = Math.min(y1 + 1, shape.length - 1);
        const dx = u - x1, dy = v - y1;
        
        const v11 = shape[y1][x1], v12 = shape[y2][x1], v21 = shape[y1][x2], v22 = shape[y2][x2];
        const value = interpolate(v11, v12, v21, v22, dx, dy);
        
        const normalized = range === 0 ? 0.5 : (value - min) / range;
        const colorValue = Math.floor(normalized * 255);

        const i = (y * PREVIEW_RESOLUTION + x) * 4;
        data[i] = data[i+1] = data[i+2] = colorValue;
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, [shape]);

  return <canvas ref={canvasRef} width={PREVIEW_RESOLUTION} height={PREVIEW_RESOLUTION} className={className} style={{ aspectRatio: '1 / 1' }} />;
};

// Modal for Settings
const SettingsPanel: React.FC<{ isOpen: boolean; onClose: () => void; state: any; dispatch: any; }> = ({ isOpen, onClose, state, dispatch }) => {
  const [inputValue, setInputValue] = useState(state.gridDivisions.toString());
  
  useEffect(() => setInputValue(state.gridDivisions.toString()), [state.gridDivisions]);

  const handleApply = () => {
    const newSize = parseInt(inputValue, 10);
    if (!isNaN(newSize) && newSize > 0 && newSize <= 100) {
      dispatch({ type: 'REQUEST_GRID_RESIZE', payload: newSize });
    } else {
      setInputValue(state.gridDivisions.toString()); // Reset if invalid
    }
  };
  
  const handleReset = () => {
     dispatch({ type: 'RESET_TERRAIN' });
     onClose();
  };
  
  if (!isOpen) return null;
  return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20" onClick={onClose}>
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">Settings</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="grid-size-input" className="text-sm font-bold mb-2 block">Grid Scale</label>
            <div className="flex items-center space-x-2">
              <input id="grid-size-input" type="number" min="1" max="100" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleApply()} className="bg-gray-700 text-white rounded px-2 py-1 w-full" />
              <button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded transition-colors">Apply</button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Warning: Changing this will reset the terrain.</p>
          </div>
          <div>
             <h3 className="text-sm font-bold mb-2">Actions</h3>
             <button onClick={handleReset} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors w-full flex items-center justify-center space-x-2">
                <ResetIcon className="w-4 h-4" />
                <span>Reset Terrain</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// Modal for Help/Instructions
const HelpPanel: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20" onClick={onClose}>
        <div className="bg-gray-900 bg-opacity-90 text-white p-6 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h1 className="text-xl font-bold mb-2">3D Terrain Editor</h1>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><b>Orbit:</b> Left-click + Drag</li>
              <li><b>Pan:</b> Right-click + Drag</li>
              <li><b>Zoom:</b> Scroll wheel</li>
              <li className="font-bold pt-2">Sculpting:</li>
              <li><b>Raise Terrain:</b> Left-click on grid</li>
              <li><b>Lower Terrain:</b> Shift + Left-click on grid</li>
              <li><b>Rotate Brush:</b> Press 'R' key</li>
            </ul>
        </div>
    </div>
  );
};

// Confirmation Dialog for resetting terrain
const ConfirmationDialog: React.FC<{ isOpen: boolean; onConfirm: () => void; onCancel: () => void; }> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-30">
      <div className="bg-gray-900 text-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">Reset Terrain?</h2>
        <p className="mb-6 text-gray-300">This action will reset all terrain modifications. Are you sure you want to continue?</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 font-bold py-2 px-4 rounded transition-colors">Cancel</button>
          <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 font-bold py-2 px-4 rounded transition-colors">Confirm & Reset</button>
        </div>
      </div>
    </div>
  );
}


// Main Toolbar Component
const Toolbar: React.FC<{ state: any; dispatch: any }> = ({ state, dispatch }) => {
  return (
    <>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 bg-opacity-80 backdrop-blur-sm text-white p-2 rounded-lg shadow-lg z-10 flex items-center space-x-4 h-20">
        {/* Brushes Section */}
        <div className="flex items-center space-x-2 pr-2 border-r border-gray-600">
          <h3 className="text-md font-bold my-auto px-2 hidden sm:block">Brushes</h3>
          <div className="flex space-x-1 p-1 bg-gray-800 rounded-md">
            {BRUSHES.map(def => (
              <button
                key={def.id}
                onClick={() => dispatch({ type: 'SELECT_BRUSH', payload: def.id })}
                className={`p-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${state.selectedBrushId === def.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                title={def.name}
              >
                <BrushPreview className="w-12 h-12 text-white" shape={def.shape} />
              </button>
            ))}
          </div>
        </div>

        {/* Tools Section */}
        <div className="flex items-center space-x-4 pr-2 border-r border-gray-600">
            <div className="flex flex-col items-center">
                <label htmlFor="strength-slider" className="text-xs font-bold mb-1">Strength</label>
                <div className="flex items-center space-x-2">
                    <input
                        id="strength-slider"
                        type="range"
                        min="0.05"
                        max="1.0"
                        step="0.05"
                        value={state.brushStrength}
                        onChange={(e) => dispatch({ type: 'SET_BRUSH_STRENGTH', payload: parseFloat(e.target.value) })}
                        className="w-24 md:w-32"
                        title={`Brush Strength: ${Math.round(state.brushStrength * 100)}%`}
                    />
                    <span className="text-sm font-mono w-10 text-center">{Math.round(state.brushStrength * 100)}%</span>
                </div>
            </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center space-x-2">
           <button onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors" title="Settings">
                <SettingsIcon className="w-6 h-6" />
           </button>
           <button onClick={() => dispatch({ type: 'TOGGLE_HELP' })} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors" title="Help">
                <HelpIcon className="w-6 h-6" />
           </button>
        </div>
      </div>
      
      {/* Modals */}
      <SettingsPanel isOpen={state.isSettingsOpen} onClose={() => dispatch({ type: 'TOGGLE_SETTINGS', payload: false })} state={state} dispatch={dispatch} />
      <HelpPanel isOpen={state.isHelpOpen} onClose={() => dispatch({ type: 'TOGGLE_HELP', payload: false })} />
      <ConfirmationDialog 
        isOpen={state.pendingGridSize !== null && state.pendingGridSize !== state.gridDivisions}
        onConfirm={() => dispatch({ type: 'CONFIRM_GRID_RESIZE' })}
        onCancel={() => dispatch({ type: 'CANCEL_GRID_RESIZE' })}
      />
    </>
  );
};

export default Toolbar;
