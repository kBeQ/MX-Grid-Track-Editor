/// <reference types="@react-three/fiber" />
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { BrushDef, GridPoint, SculptMode } from '../types';
import { rotateMatrix, applyHeightmapToGeometry } from '../lib/utils';

interface GhostProps {
  clickedCell: GridPoint;
  rotation: number;
  deformation: BrushDef;
  worldSize: number;
  divisions: number;
  resolutionMultiplier: number;
  sculptMode: SculptMode;
  brushStrength: number;
  brushSize: number;
}

const Ghost: React.FC<GhostProps> = ({ clickedCell, rotation, deformation, worldSize, divisions, resolutionMultiplier, sculptMode, brushStrength, brushSize }) => {
  const cellSize = worldSize / divisions;

  const { geometry, meshPosition } = useMemo(() => {
    // Brush size in grid cells
    const brushCellWidth = brushSize;
    const brushCellHeight = brushSize; // Assuming square brushes

    // Vertex dimensions for the high-res shape and geometry
    const segmentsX = brushCellWidth * resolutionMultiplier;
    const segmentsZ = brushCellHeight * resolutionMultiplier;
    const shapeVertexSize = segmentsX + 1; // Assuming square

    // Generate the brush shape at the final resolution.
    let highResShape = deformation.shape(shapeVertexSize);
    for (let i = 0; i < rotation; i++) {
        highResShape = rotateMatrix(highResShape);
    }
    
    // The geometry for the ghost preview
    const ghostWorldWidth = brushCellWidth * cellSize;
    const ghostWorldHeight = brushCellHeight * cellSize;
    const ghostGeom = new THREE.PlaneGeometry(ghostWorldWidth, ghostWorldHeight, segmentsX, segmentsZ);
    
    // Apply strength and mode to the ghost preview shape
    const strength = sculptMode === 'lower' ? -brushStrength : brushStrength;
    const finalShape = highResShape.map(row => row.map(h => h * strength * 2));
    
    applyHeightmapToGeometry(ghostGeom, finalShape);

    // Calculate world position for the ghost mesh (center of the brush area)
    const startGridX = clickedCell[0] - Math.floor(brushCellWidth / 2);
    const startGridZ = clickedCell[1] - Math.floor(brushCellHeight / 2);
    
    const centerWorldX = (startGridX + brushCellWidth / 2) * cellSize - worldSize / 2;
    const centerWorldZ = (startGridZ + brushCellHeight / 2) * cellSize - worldSize / 2;
    
    const mPos = new THREE.Vector3(centerWorldX, 0.16, centerWorldZ);

    return { geometry: ghostGeom, meshPosition: mPos };

  }, [deformation, rotation, clickedCell, cellSize, worldSize, resolutionMultiplier, sculptMode, brushStrength, brushSize]);
  
  const materialColor = sculptMode === 'raise' ? '#4ade80' : '#f87171'; // Tailwind green-400 / red-400

  return (
    <mesh position={meshPosition} geometry={geometry} rotation-x={-Math.PI / 2}>
      <meshStandardMaterial 
        color={materialColor} 
        emissive={materialColor} 
        emissiveIntensity={0.3} 
        transparent 
        opacity={0.5} 
        wireframe 
      />
    </mesh>
  );
};

export default Ghost;