import React, { useReducer, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';
import Toolbar from './components/Toolbar';
import { BRUSHES } from './lib/brushes';
import type { BrushDef } from './types';

// --- STATE MANAGEMENT (Reducer Pattern) ---

interface SculptState {
  gridDivisions: number;
  selectedBrushId: string;
  brushStrength: number; // 0.0 to 1.0
  isTerrainModified: boolean;
  isSettingsOpen: boolean;
  isHelpOpen: boolean;
  pendingGridSize: number | null; // For confirmation dialog
}

type SculptAction =
  | { type: 'SELECT_BRUSH'; payload: string }
  | { type: 'SET_BRUSH_STRENGTH'; payload: number }
  | { type: 'SET_MODIFIED'; payload: boolean }
  | { type: 'TOGGLE_SETTINGS'; payload?: boolean }
  | { type: 'TOGGLE_HELP'; payload?: boolean }
  | { type: 'REQUEST_GRID_RESIZE'; payload: number }
  | { type: 'CONFIRM_GRID_RESIZE' }
  | { type: 'CANCEL_GRID_RESIZE' }
  | { type: 'RESET_TERRAIN' };
  
const initialState: SculptState = {
  gridDivisions: 20,
  selectedBrushId: BRUSHES[0].id,
  brushStrength: 0.5,
  isTerrainModified: false,
  isSettingsOpen: false,
  isHelpOpen: false,
  pendingGridSize: null,
};

function reducer(state: SculptState, action: SculptAction): SculptState {
  switch (action.type) {
    case 'SELECT_BRUSH':
      return { ...state, selectedBrushId: action.payload };
    case 'SET_BRUSH_STRENGTH':
      return { ...state, brushStrength: action.payload };
    case 'SET_MODIFIED':
      return { ...state, isTerrainModified: action.payload };
    case 'TOGGLE_SETTINGS':
      return { ...state, isSettingsOpen: action.payload ?? !state.isSettingsOpen };
    case 'TOGGLE_HELP':
      return { ...state, isHelpOpen: action.payload ?? !state.isHelpOpen };
    case 'REQUEST_GRID_RESIZE':
      if (state.isTerrainModified && action.payload !== state.gridDivisions) {
        return { ...state, pendingGridSize: action.payload };
      }
      return { ...state, gridDivisions: action.payload, isSettingsOpen: false };
    case 'CONFIRM_GRID_RESIZE':
      if (state.pendingGridSize === null) return state;
      return {
        ...state,
        gridDivisions: state.pendingGridSize,
        pendingGridSize: null,
        isTerrainModified: false,
        isSettingsOpen: false,
      };
    case 'CANCEL_GRID_RESIZE':
      return { ...state, pendingGridSize: null };
    case 'RESET_TERRAIN':
      return {
        ...state,
        isTerrainModified: false,
        pendingGridSize: state.gridDivisions // Effectively re-triggers a reset
      };
    default:
      return state;
  }
}

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const selectedBrush = useMemo(
    () => BRUSHES.find(d => d.id === state.selectedBrushId) || null,
    [state.selectedBrushId]
  );
  
  // This effect handles the special case of resetting the terrain
  // by forcing a state change on gridDivisions, which triggers a scene remount.
  React.useEffect(() => {
    if (state.pendingGridSize === state.gridDivisions && !state.isTerrainModified) {
       dispatch({ type: 'CONFIRM_GRID_RESIZE' });
    }
  }, [state.pendingGridSize, state.gridDivisions, state.isTerrainModified]);

  return (
    <div className="w-screen h-screen bg-gray-800">
      <Toolbar state={state} dispatch={dispatch} />

      <Canvas shadows camera={{ position: [40, 40, 40], fov: 45 }}>
        <Scene 
          key={state.gridDivisions} // This is crucial to force a full re-mount of the scene on resize
          gridDivisions={state.gridDivisions} 
          selectedBrush={selectedBrush}
          brushStrength={state.brushStrength}
          onDeform={() => dispatch({ type: 'SET_MODIFIED', payload: true })}
        />
      </Canvas>
    </div>
  );
};

export default App;
