/// <reference types="@react-three/fiber" />
import React, { useState, useCallback, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Terrain from './Terrain';
import Grid from './Grid';
import Ghost from './Ghost';
import type { DeformationDef, GridPoint } from '../types';
import { rotateMatrix, upsampleMatrix } from '../lib/utils';

// This multiplier increases the terrain's vertex density for smoother sculpting.
// A value of 4 means a 20x20 grid becomes a high-resolution 80x80 mesh.
const TERRAIN_RESOLUTION_MULTIPLIER = 4;

const Scene: React.FC<{
  gridDivisions: number;
  selectedDeformation: DeformationDef | null;
  onDeform: () => void;
}> = ({ gridDivisions, selectedDeformation, onDeform }) => {
  const GRID_SIZE = 100;
  // The render mesh has a higher resolution than the interaction grid.
  const renderSegments = gridDivisions * TERRAIN_RESOLUTION_MULTIPLIER;

  // Height data is sized to the high-resolution vertex grid.
  const [heightData, setHeightData] = useState<number[][]>(() =>
    Array(renderSegments + 1).fill(0).map(() => Array(renderSegments + 1).fill(0))
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
    
    onDeform(); 

    let shape = selectedDeformation.shape;
    for (let i = 0; i < ghost.rotation; i++) {
      shape = rotateMatrix(shape);
    }
    
    // Upsample the brush shape for a high-resolution application.
    const highResShape = upsampleMatrix(shape, TERRAIN_RESOLUTION_MULTIPLIER);
    
    const brushVertexHeight = highResShape.length;
    const brushVertexWidth = highResShape[0]?.length || 0;
    
    // Get the original low-res cell dimensions of the brush.
    const brushCellWidth = (selectedDeformation.shape[0]?.length || 1) - 1;
    const brushCellHeight = (selectedDeformation.shape.length || 1) - 1;

    // Calculate the top-left vertex of the brush on the INTERACTION grid.
    const startCellX = gridPoint[0] - Math.floor(brushCellWidth / 2);
    const startCellZ = gridPoint[1] - Math.floor(brushCellHeight / 2);

    // Convert to the top-left vertex on the high-resolution RENDER grid.
    const startVertexX = startCellX * TERRAIN_RESOLUTION_MULTIPLIER;
    const startVertexZ = startCellZ * TERRAIN_RESOLUTION_MULTIPLIER;

    setHeightData(prev => {
        const newData = prev.map(row => [...row]);
        for(let z = 0; z < brushVertexHeight; z++) {
          for (let x = 0; x < brushVertexWidth; x++) {
            const mapX = startVertexX + x;
            const mapZ = startVertexZ + z;

            if (mapZ >= 0 && mapZ <= renderSegments && mapX >= 0 && mapX <= renderSegments) {
              newData[mapZ][mapX] += highResShape[z][x];
            }
          }
        }
        return newData;
    });
  }, [selectedDeformation, ghost, onDeform, renderSegments]);
  
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

      <Terrain size={GRID_SIZE} segments={renderSegments} heightData={heightData} />
      <Grid 
        size={GRID_SIZE} 
        divisions={gridDivisions} 
        onCellClick={applyDeformation}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      />
      {ghost && selectedDeformation && (
        <Ghost
          clickedCell={ghost.position}
          rotation={ghost.rotation}
          deformation={selectedDeformation}
          worldSize={GRID_SIZE}
          divisions={gridDivisions}
          resolutionMultiplier={TERRAIN_RESOLUTION_MULTIPLIER}
        />
      )}


      <fog attach="fog" args={['#272730', 100, 300]} />
      <color attach="background" args={['#272730']} />
    </>
  );
};

export default Scene;