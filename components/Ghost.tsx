/// <reference types="@react-three/fiber" />
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { DeformationDef, GridPoint } from '../types';
import { rotateMatrix, applyHeightmapToGeometry, upsampleMatrix } from '../lib/utils';

interface GhostProps {
  clickedCell: GridPoint;
  rotation: number;
  deformation: DeformationDef;
  worldSize: number;
  divisions: number;
  resolutionMultiplier: number;
}

const Ghost: React.FC<GhostProps> = ({ clickedCell, rotation, deformation, worldSize, divisions, resolutionMultiplier }) => {
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

    // Create a high-resolution geometry for the ghost preview.
    const segmentsX = cellWidth * resolutionMultiplier;
    const segmentsZ = cellHeight * resolutionMultiplier;
    const ghostGeom = new THREE.PlaneGeometry(ghostWidth, ghostHeight, segmentsX, segmentsZ);
    
    // Upsample the brush shape to match the new high-resolution geometry.
    const highResShape = upsampleMatrix(shape, resolutionMultiplier);
    
    // Apply the detailed deformation shape to the ghost's geometry.
    applyHeightmapToGeometry(ghostGeom, highResShape);

    // Calculate the position of the ghost mesh.
    // It should be centered over the affected cells.
    const startGridX = clickedCell[0] - Math.floor(cellWidth / 2);
    const startGridZ = clickedCell[1] - Math.floor(cellHeight / 2);
    
    const centerWorldX = (startGridX + cellWidth / 2) * cellSize - worldSize / 2;
    const centerWorldZ = (startGridZ + cellHeight / 2) * cellSize - worldSize / 2;
    
    const mPos = new THREE.Vector3(centerWorldX, 0.16, centerWorldZ);

    return { geometry: ghostGeom, meshPosition: mPos };

  }, [deformation, rotation, clickedCell, cellSize, worldSize, resolutionMultiplier]);

  return (
    <mesh position={meshPosition} geometry={geometry} rotation-x={-Math.PI / 2}>
      <meshStandardMaterial color="lime" emissive="lime" emissiveIntensity={0.2} transparent opacity={0.5} wireframe />
    </mesh>
  );
};

export default Ghost;