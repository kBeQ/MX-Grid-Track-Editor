/// <reference types="@react-three/fiber" />
import React, { useState, useMemo, useCallback } from 'react';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Terrain from './Terrain';
import Grid from './Grid';
import type { GridPoint } from '../types';

// Custom hook logic for multi-selection
const useMultiSelection = () => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((point: GridPoint, isMultiSelect: boolean) => {
    const key = JSON.stringify(point);
    setSelected(prev => {
      // FIX: Explicitly type the new Set to Set<string> to avoid type inference to Set<unknown>.
      const newSelected = isMultiSelect ? new Set(prev) : new Set<string>();
      if (newSelected.has(key)) {
        if (isMultiSelect) newSelected.delete(key);
      } else {
        newSelected.add(key);
      }
      return newSelected;
    });
  }, []);

  const selectedPoints = useMemo(() => Array.from(selected, key => JSON.parse(key) as GridPoint), [selected]);

  return { selectedPoints, toggleSelection };
};

// Component to render highlights on selected grid cells
const SelectionHighlight: React.FC<{ points: GridPoint[]; size: number; divisions: number }> = ({ points, size, divisions }) => {
  const cellSize = size / divisions;
  
  return (
    <group>
      {points.map(point => {
        const key = JSON.stringify(point);
        const x = point[0] * cellSize - size / 2 + cellSize / 2;
        const z = point[1] * cellSize - size / 2 + cellSize / 2;
        
        return (
          <mesh key={key} position={[x, 0.15, z]} rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[cellSize, cellSize]} />
            <meshStandardMaterial color="orange" emissive="orange" emissiveIntensity={0.5} transparent opacity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
};


const Scene: React.FC = () => {
  const GRID_SIZE = 100;
  const GRID_DIVISIONS = 20;
  
  const { selectedPoints, toggleSelection } = useMultiSelection();

  const handleCellClick = useCallback((point: GridPoint, shiftKey: boolean) => {
    toggleSelection(point, shiftKey);
  }, [toggleSelection]);

  return (
    <>
      <OrbitControls 
        makeDefault 
        minDistance={10} 
        maxDistance={200}
        enableDamping
        dampingFactor={0.1}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN
        }}
        />

      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[100, 100, 50]} 
        intensity={1.8} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-GRID_SIZE/2}
        shadow-camera-right={GRID_SIZE/2}
        shadow-camera-top={GRID_SIZE/2}
        shadow-camera-bottom={-GRID_SIZE/2}
      />

      <Terrain size={GRID_SIZE} segments={GRID_SIZE} />
      <Grid size={GRID_SIZE} divisions={GRID_DIVISIONS} onCellClick={handleCellClick} />
      <SelectionHighlight points={selectedPoints} size={GRID_SIZE} divisions={GRID_DIVISIONS} />

      <fog attach="fog" args={['#272730', 100, 300]} />
      <color attach="background" args={['#272730']} />
    </>
  );
};

export default Scene;