/// <reference types="@react-three/fiber" />
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { BrushDef, GridPoint, SculptMode } from '../types';
import { rotateMatrix, applyHeightmapToGeometry, upsampleMatrix } from '../lib/utils';

interface GhostProps {
  clickedCell: GridPoint;
  rotation: number;
  deformation: BrushDef;
  worldSize: number;
  divisions: number;
  resolutionMultiplier: number;
  sculptMode: SculptMode;
  brushStrength: number;
}

const Ghost: React.FC<GhostProps> = ({ clickedCell, rotation, deformation, worldSize, divisions, resolutionMultiplier, sculptMode, brushStrength }) => {
  const cellSize = worldSize / divisions;

  const { geometry, meshPosition } = useMemo(() => {
    let shape = deformation.shape;
    for (let i = 0; i < rotation; i++) {
      shape = rotateMatrix(shape);
    }
    
    const shapeVertexHeight = shape.length;
    if (shapeVertexHeight === 0) return { geometry: new THREE.BufferGeometry(), meshPosition: new THREE.Vector3() };
    const shapeVertexWidth = shape[0].length;
    
    const cellWidth = shapeVertexWidth > 1 ? shapeVertexWidth - 1 : 1;
    const cellHeight = shapeVertexHeight > 1 ? shapeVertexHeight - 1 : 1;
    
    const ghostWidth = cellWidth * cellSize;
    const ghostHeight = cellHeight * cellSize;

    const segmentsX = cellWidth * resolutionMultiplier;
    const segmentsZ = cellHeight * resolutionMultiplier;
    const ghostGeom = new THREE.PlaneGeometry(ghostWidth, ghostHeight, segmentsX, segmentsZ);
    
    const highResShape = upsampleMatrix(shape, resolutionMultiplier);

    // Apply strength and mode to the ghost preview shape
    const strength = sculptMode === 'lower' ? -brushStrength : brushStrength;
    const finalShape = highResShape.map(row => row.map(h => h * strength * 2));
    
    applyHeightmapToGeometry(ghostGeom, finalShape);

    const startGridX = clickedCell[0] - Math.floor(cellWidth / 2);
    const startGridZ = clickedCell[1] - Math.floor(cellHeight / 2);
    
    const centerWorldX = (startGridX + cellWidth / 2) * cellSize - worldSize / 2;
    const centerWorldZ = (startGridZ + cellHeight / 2) * cellSize - worldSize / 2;
    
    const mPos = new THREE.Vector3(centerWorldX, 0.16, centerWorldZ);

    return { geometry: ghostGeom, meshPosition: mPos };

  }, [deformation, rotation, clickedCell, cellSize, worldSize, resolutionMultiplier, sculptMode, brushStrength]);
  
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
