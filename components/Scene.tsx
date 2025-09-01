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
}> = ({ gridDivisions, selectedDeformation }) => {
  const GRID_SIZE = 100;
  const TERRAIN_SEGMENTS = 100;

  const [heightData, setHeightData] = useState<number[][]>(() =>
    Array(TERRAIN_SEGMENTS + 1).fill(0).map(() => Array(TERRAIN_SEGMENTS + 1).fill(0))
  );

  const [ghost, setGhost] = useState<{ position: GridPoint; rotation: number } | null>(null);

  // Handle brush rotation via 'R' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') {
        setGhost(prev => prev ? { ...prev, rotation: (prev.rotation + 1) % 4 } : null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Applies the selected deformation to the terrain height map
  const applyDeformation = useCallback((gridPoint: GridPoint) => {
    if (!selectedDeformation || !ghost) return;
    
    let shape = selectedDeformation.shape;
    for (let i = 0; i < ghost.rotation; i++) {
      shape = rotateMatrix(shape);
    }
    
    // Scale from interaction grid coords to terrain vertex coords
    const scaleFactor = TERRAIN_SEGMENTS / gridDivisions;
    const terrainX = Math.floor(gridPoint[0] * scaleFactor);
    const terrainZ = Math.floor(gridPoint[1] * scaleFactor);
    
    const shapeHeight = shape.length;
    const shapeWidth = shape[0].length;
    
    setHeightData(prev => {
      const newData = prev.map(row => [...row]);
      for (let i = 0; i < shapeHeight; i++) {
        for (let j = 0; j < shapeWidth; j++) {
          const targetZ = terrainZ + i;
          const targetX = terrainX + j;
          if (targetZ >= 0 && targetZ <= TERRAIN_SEGMENTS && targetX >= 0 && targetX <= TERRAIN_SEGMENTS) {
            newData[targetZ][targetX] += shape[i][j];
          }
        }
      }
      return newData;
    });
  }, [selectedDeformation, ghost, gridDivisions]);
  
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

      <Terrain size={GRID_SIZE} segments={TERRAIN_SEGMENTS} heightData={heightData} />
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
