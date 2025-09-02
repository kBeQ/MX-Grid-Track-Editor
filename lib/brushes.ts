import type { Deformation, BrushDef } from '../types';

const generateFlatShape = (size: number, peak: number): Deformation => {
  if (size < 2) size = 2;
  return Array(size).fill(0).map(() => Array(size).fill(peak));
};

const generateSoftShape = (size: number, peak: number): Deformation => {
  if (size < 1) return [];
  if (size === 1) return [[peak]];

  const shape: Deformation = Array(size).fill(0).map(() => Array(size).fill(0));
  const center = (size - 1) / 2;
  const maxDist = center; // Use radius to the edge for a true circular brush

  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) {
      const distX = x - center;
      const distZ = z - center;
      const dist = Math.sqrt(distX * distX + distZ * distZ);

      if (dist <= maxDist) {
        // Cosine falloff for a smooth dome shape
        const height = (Math.cos((dist / maxDist) * Math.PI) + 1) / 2 * peak;
        shape[z][x] = height;
      }
    }
  }
  return shape;
};

const generateLinearRamp = (size: number, peak: number): Deformation => {
  if (size < 2) size = 2;
  const shape = Array(size).fill(0).map(() => Array(size).fill(0));
   for (let z = 0; z < size; z++) {
    const height = (z / (size - 1)) * peak;
    for (let x = 0; x < size; x++) {
      shape[z][x] = height;
    }
  }
  return shape;
};

const generateRidge = (size: number, peak: number): Deformation => {
    if (size < 2) size = 2;
    const shape = Array(size).fill(0).map(() => Array(size).fill(0));
    const center = (size - 1) / 2;
    const maxDist = center;
    for (let x = 0; x < size; x++) {
        const dist = Math.abs(x - center);
        let height = 0;
        if (dist <= maxDist) {
            height = (Math.cos((dist / maxDist) * Math.PI) + 1) / 2 * peak;
        }
        for (let z = 0; z < size; z++) {
            shape[z][x] = height;
        }
    }
    return shape;
}

export const BRUSHES: BrushDef[] = [
  { id: 'raise', name: 'Raise Cell', shape: (size) => generateFlatShape(size, 1.0) },
  { id: 'softHill', name: 'Soft Hill', shape: (size) => generateSoftShape(size, 2.0) },
  { id: 'ridge', name: 'Ridge', shape: (size) => generateRidge(size, 1.0) },
  { id: 'linearRamp', name: 'Linear Ramp', shape: (size) => generateLinearRamp(size, 1.5) },
  { id: 'softValley', name: 'Soft Valley', shape: (size) => generateSoftShape(size, -2.0) },
];