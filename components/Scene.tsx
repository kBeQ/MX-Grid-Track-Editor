/// <reference types="@react-three/fiber" />
import React, { useState, useCallback, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Terrain from './Terrain';
import Grid from './Grid';
import Ghost from './Ghost';
import type { DeformationDef, GridPoint } from '../types';

// Helper function to rotate a 2D array (the deformation shape)
const rotateMatrix = (matrix: number[][]): number[][] => {
  const n = matrix.length;
  if (n === 0) return [];
  const m = matrix[0].length;
  const result = Array(m).fill(0).map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      result[j][n - 1 - i] = matrix[i][j];
    }
  }
  return result;
};

const Scene: React.FC<{
  gridDivisions: number;
  selectedDeformation: DeformationDef | null;
  onDeform: () => void;
}> = ({ gridDivisions, selectedDeformation, onDeform }) => {
  const GRID_SIZE = 100;

  // Height data is now sized to the vertex grid, not the cell grid.
  const [heightData, setHeightData] = useState<number[][]>(() =>
    Array(gridDivisions + 1).fill(0).map(() => Array(gridDivisions + 1).fill(0))
  );

  const [ghost, setGhost] = useState<{ position: GridPoint; rotation: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') {
        setGhost(prev => prev ? { ...prev, rotation: (prev.rotation + 1) % 4 } : null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const applyDeformation = useCallback((gridPoint: GridPoint) => {
    if (!selectedDeformation || !ghost) return;
    
    onDeform(); // Notify app that a modification has been made

    let shape = selectedDeformation.shape;
    for (let i = 0; i < ghost.rotation; i++) {
      shape = rotateMatrix(shape);
    }
    
    const brushHeight = shape.length;
    const brushWidth = shape[0]?.length || 0;
    
    // Calculate the top-left corner of the brush on the heightmap (vertex grid)
    const startX = gridPoint[0] - Math.floor(brushWidth / 2);
    const startZ = gridPoint[1] - Math.floor(brushHeight / 2);

    setHeightData(prev => {
        const newData = prev.map(row => [...row]);
        for(let z = 0; z < brushHeight; z++) {
          for (let x = 0; x < brushWidth; x++) {
            const mapX = startX + x;
            const mapZ = startZ + z;

            // Check bounds against the vertex grid dimensions
            if (mapZ >= 0 && mapZ <= gridDivisions && mapX >= 0 && mapX <= gridDivisions) {
              newData[mapZ][mapX] += shape[z][x];
            }
          }
        }
        return newData;
    });
  }, [selectedDeformation, ghost, gridDivisions, onDeform]);
  
  const handlePointerMove = useCallback((point: GridPoint) => {
    setGhost(prev => ({
      position: point,
      rotation: prev?.rotation ?? 0,
    }));
  }, []);

  const handlePointerOut = useCallback(() => {
    setGhost(null);
  }, []);


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

      {/* Terrain now gets segments matching gridDivisions */}
      <Terrain size={GRID_SIZE} segments={gridDivisions} heightData={heightData} />
      <Grid 
        size={GRID_SIZE} 
        divisions={gridDivisions} 
        onCellClick={applyDeformation}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      />
      {ghost && selectedDeformation && (
        <Ghost
          position={ghost.position}
          rotation={ghost.rotation}
          deformation={selectedDeformation}
          size={GRID_SIZE}
          divisions={gridDivisions}
        />
      )}


      <fog attach="fog" args={['#272730', 100, 300]} />
      <color attach="background" args={['#272730']} />
    </>
  );
};

export default Scene;