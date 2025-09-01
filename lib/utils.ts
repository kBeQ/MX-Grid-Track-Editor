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

/**
 * Upsamples a 2D matrix using bilinear interpolation to create a higher-resolution version.
 * This is used to create smooth brush shapes for a high-resolution terrain mesh.
 */
export const upsampleMatrix = (matrix: Deformation, factor: number): Deformation => {
  if (factor <= 1 || matrix.length === 0 || matrix[0].length === 0) {
    return matrix;
  }

  const oldRows = matrix.length;
  const oldCols = matrix[0].length;

  // Calculate new dimensions. E.g., a 2x2 matrix (1x1 cell) with factor 4 becomes a 5x5 matrix.
  const newRows = (oldRows - 1) * factor + 1;
  const newCols = (oldCols - 1) * factor + 1;

  const result: Deformation = Array(newRows).fill(0).map(() => Array(newCols).fill(0));

  // Reusable interpolation function
  const interpolate = (v11: number, v12: number, v21: number, v22: number, dx: number, dy: number) => {
      const w1 = (1 - dx) * v11 + dx * v21; // Interpolate along top edge
      const w2 = (1 - dx) * v12 + dx * v22; // Interpolate along bottom edge
      return (1 - dy) * w1 + dy * w2;      // Interpolate vertically
  };

  for (let r = 0; r < newRows; r++) {
    for (let c = 0; c < newCols; c++) {
      const oldR_frac = r / factor;
      const oldC_frac = c / factor;

      const r1 = Math.floor(oldR_frac);
      const c1 = Math.floor(oldC_frac);
      
      const r2 = Math.min(r1 + 1, oldRows - 1);
      const c2 = Math.min(c1 + 1, oldCols - 1);
      
      const dy = oldR_frac - r1;
      const dx = oldC_frac - c1;

      // Get the four corner values from the original, low-res matrix
      const v11 = matrix[r1][c1]; // Top-left
      const v12 = matrix[r2][c1]; // Bottom-left
      const v21 = matrix[r1][c2]; // Top-right
      const v22 = matrix[r2][c2]; // Bottom-right

      result[r][c] = interpolate(v11, v12, v21, v22, dx, dy);
    }
  }

  return result;
};
