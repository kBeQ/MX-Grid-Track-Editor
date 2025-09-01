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


const Ghost: React.FC<GhostProps> = ({ position, rotation, deformation, size, divisions }) => {
  const cellSize = size / divisions;

  const { geometry, meshPosition } = useMemo(() => {
    let shape = deformation.shape;
    for (let i = 0; i < rotation; i++) {
      shape = rotateMatrix(shape);
    }
    
    const shapeHeight = shape.length;
    if (shapeHeight === 0) return { geometry: new THREE.BufferGeometry(), meshPosition: new THREE.Vector3() };
    const shapeWidth = shape[0].length;

    const ghostGeom = new THREE.PlaneGeometry(shapeWidth * cellSize, shapeHeight * cellSize, shapeWidth, shapeHeight);
    
    const positions = ghostGeom.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const zIndex = Math.floor(i / (shapeWidth + 1));
      const xIndex = i % (shapeWidth + 1);

      if (shape[zIndex] && shape[zIndex][xIndex] !== undefined) {
        positions.setY(i, shape[zIndex][xIndex]);
      }
    }
    positions.needsUpdate = true;
    ghostGeom.computeVertexNormals();

    const x = position[0] * cellSize - size / 2 + (shapeWidth * cellSize) / 2;
    const z = position[1] * cellSize - size / 2 + (shapeHeight * cellSize) / 2;
    
    const mPos = new THREE.Vector3(x, 0.16, z); // Slightly above grid to prevent z-fighting

    return { geometry: ghostGeom, meshPosition: mPos };

  }, [deformation, rotation, position, cellSize, size]);

  return (
    <mesh position={meshPosition} geometry={geometry} rotation-x={-Math.PI / 2}>
      <meshStandardMaterial color="lime" emissive="lime" emissiveIntensity={0.2} transparent opacity={0.5} wireframe />
    </mesh>
  );
};

export default Ghost;
