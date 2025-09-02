/// <reference types="@react-three/fiber" />
import React, { useState, useCallback, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Terrain from './Terrain';
import Grid from './Grid';
import Ghost from './Ghost';
import type { BrushDef, GridPoint, SculptMode } from '../types';
import { rotateMatrix, upsampleMatrix } from '../lib/utils';

// This multiplier increases the terrain's vertex density for smoother sculpting.
const TERRAIN_RESOLUTION_MULTIPLIER = 4;

interface SceneProps {
  gridDivisions: number;
  selectedBrush: BrushDef | null;
  brushStrength: number;
  onDeform: () => void;
}

const Scene: React.FC<SceneProps> = ({ gridDivisions, selectedBrush, brushStrength, onDeform }) => {
  const GRID_SIZE = 100;
  const renderSegments = gridDivisions * TERRAIN_RESOLUTION_MULTIPLIER;

  const [heightData, setHeightData] = useState<number[][]>(() =>
    Array(renderSegments + 1).fill(0).map(() => Array(renderSegments + 1).fill(0))
  );

  const [ghost, setGhost] = useState<{ position: GridPoint; rotation: number, mode: SculptMode } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') {
        setGhost(prev => prev ? { ...prev, rotation: (prev.rotation + 1) % 4 } : null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const applyDeformation = useCallback((gridPoint: GridPoint, event: any) => {
    if (!selectedBrush || !ghost) return;
    
    onDeform(); 

    const mode: SculptMode = event.shiftKey ? 'lower' : 'raise';
    const strength = mode === 'lower' ? -brushStrength : brushStrength;

    let shape = selectedBrush.shape;
    for (let i = 0; i < ghost.rotation; i++) {
      shape = rotateMatrix(shape);
    }
    
    const highResShape = upsampleMatrix(shape, TERRAIN_RESOLUTION_MULTIPLIER);
    
    const brushVertexHeight = highResShape.length;
    const brushVertexWidth = highResShape[0]?.length || 0;
    
    const brushCellWidth = (selectedBrush.shape[0]?.length || 1) - 1;
    const brushCellHeight = (selectedBrush.shape.length || 1) - 1;

    const startCellX = gridPoint[0] - Math.floor(brushCellWidth / 2);
    const startCellZ = gridPoint[1] - Math.floor(brushCellHeight / 2);

    const startVertexX = startCellX * TERRAIN_RESOLUTION_MULTIPLIER;
    const startVertexZ = startCellZ * TERRAIN_RESOLUTION_MULTIPLIER;

    setHeightData(prev => {
        const newData = prev.map(row => [...row]);
        for(let z = 0; z < brushVertexHeight; z++) {
          for (let x = 0; x < brushVertexWidth; x++) {
            const mapX = startVertexX + x;
            const mapZ = startVertexZ + z;

            if (mapZ >= 0 && mapZ <= renderSegments && mapX >= 0 && mapX <= renderSegments) {
              newData[mapZ][mapX] += highResShape[z][x] * strength * 2; // Strength multiplier
            }
          }
        }
        return newData;
    });
  }, [selectedBrush, ghost, onDeform, renderSegments, brushStrength]);
  
  const handlePointerMove = useCallback((point: GridPoint, event: any) => {
    const mode: SculptMode = event.shiftKey ? 'lower' : 'raise';
    setGhost(prev => ({
      position: point,
      rotation: prev?.rotation ?? 0,
      mode: mode,
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
      {ghost && selectedBrush && (
        <Ghost
          clickedCell={ghost.position}
          rotation={ghost.rotation}
          deformation={selectedBrush}
          worldSize={GRID_SIZE}
          divisions={gridDivisions}
          resolutionMultiplier={TERRAIN_RESOLUTION_MULTIPLIER}
          sculptMode={ghost.mode}
          brushStrength={brushStrength}
        />
      )}


      <fog attach="fog" args={['#272730', 100, 300]} />
      <color attach="background" args={['#272730']} />
    </>
  );
};

export default Scene;
