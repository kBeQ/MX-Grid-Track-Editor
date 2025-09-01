/// <reference types="@react-three/fiber" />
import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { DeformationDef, GridPoint } from '../types';

interface GhostProps {
  position: GridPoint;
  rotation: number;
  deformation: DeformationDef;
  size: number;
  divisions: number;
}

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


const Ghost: React.FC<GhostProps> = ({ position, rotation, deformation, size, divisions }) => {
  const cellSize = size / divisions;

  const { geometry, meshPosition } = useMemo(() => {
    let shape = deformation.shape;
    let brushSize = deformation.size;

    for (let i = 0; i < rotation; i++) {
      shape = rotateMatrix(shape);
    }
    // After rotation, width and height might swap
    const shapeHeight = shape.length;
    if (shapeHeight === 0) return { geometry: new THREE.BufferGeometry(), meshPosition: new THREE.Vector3() };
    const shapeWidth = shape[0].length;
    
    const ghostWidth = shapeWidth * cellSize / (brushSize[0]);
    const ghostHeight = shapeHeight * cellSize / (brushSize[1]);

    const ghostGeom = new THREE.PlaneGeometry(ghostWidth, ghostHeight, shapeWidth - 1, shapeHeight - 1);
    
    const positions = ghostGeom.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const zIndex = Math.floor(i / shapeWidth);
      const xIndex = i % shapeWidth;

      if (shape[zIndex] && shape[zIndex][xIndex] !== undefined) {
        // CRITICAL FIX: Set the Z value for height, same as in the Terrain component.
        positions.setZ(i, shape[zIndex][xIndex]);
      }
    }

    positions.needsUpdate = true;
    ghostGeom.computeVertexNormals();

    const x = (position[0] + 0.5) * cellSize - size / 2;
    const z = (position[1] + 0.5) * cellSize - size / 2;
    
    const mPos = new THREE.Vector3(x, 0.16, z);

    return { geometry: ghostGeom, meshPosition: mPos };

  }, [deformation, rotation, position, cellSize, size]);

  return (
    <mesh position={meshPosition} geometry={geometry} rotation-x={-Math.PI / 2}>
      <meshStandardMaterial color="lime" emissive="lime" emissiveIntensity={0.2} transparent opacity={0.5} wireframe />
    </mesh>
  );
};

export default Ghost;