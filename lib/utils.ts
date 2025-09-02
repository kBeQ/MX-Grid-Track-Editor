import * as THREE from 'three';
import type { Deformation } from '../types';

/**
 * Rotates a 2D matrix (deformation shape) by 90 degrees clockwise.
 */
export const rotateMatrix = (matrix: Deformation): Deformation => {
  const n = matrix.length;
  if (n === 0) return [];
  const m = matrix[0].length;
  const result: Deformation = Array(m).fill(0).map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      result[j][n - 1 - i] = matrix[i][j];
    }
  }
  return result;
};

/**
 * Applies a 2D heightmap to a THREE.PlaneGeometry's vertices.
 * The heightmap dimensions must match the geometry's vertex grid.
 * Modifies the geometry in place.
 */
export const applyHeightmapToGeometry = (geometry: THREE.BufferGeometry, heightmap: Deformation): void => {
  const positions = geometry.attributes.position;
  const height = heightmap.length;
  if (height === 0) return;
  const width = heightmap[0].length;

  if (positions.count !== width * height) {
    // This can happen briefly during a re-render; it's not a critical error.
    return;
  }

  for (let i = 0; i < positions.count; i++) {
    // PlaneGeometry vertices are ordered row-by-row.
    const zIndex = Math.floor(i / width);
    const xIndex = i % width;

    if (heightmap[zIndex] && heightmap[zIndex][xIndex] !== undefined) {
      // Modify the Z-coordinate in the geometry's local space.
      // For a plane rotated -90deg on X, this corresponds to world Y (height).
      positions.setZ(i, heightmap[zIndex][xIndex]);
    }
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
};
