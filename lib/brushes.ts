import type { Deformation, BrushDef } from '../types';

// A brush that affects a 1x1 cell area needs a 2x2 vertex matrix.
const BRUSH_CELLS_1x1 = 2; 
// A brush that affects a 3x3 cell area needs a 4x4 vertex matrix.
const BRUSH_CELLS_3x3 = 4;

const generateFlatShape = (size: number, peak: number): Deformation => {
  return Array(size).fill(0).map(() => Array(size).fill(peak));
};

const generateSoftShape = (size: number, peak: number): Deformation => {
  const shape = Array(size).fill(0).map(() => Array(size).fill(0));
  const center = (size - 1) / 2;
  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) {
      const distX = x - center;
      const distZ = z - center;
      const dist = Math.sqrt(distX * distX + distZ * distZ);
      const maxDist = Math.sqrt(2 * center * center);
      let height = 0;
      if (dist <= maxDist) {
        // Cosine falloff for a smooth dome shape
        height = (Math.cos((dist / maxDist) * Math.PI) + 1) / 2 * peak;
      }
      shape[z][x] = height;
    }
  }
  return shape;
};

const generateLinearRamp = (size: number, peak: number): Deformation => {
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
    const shape = Array(size).fill(0).map(() => Array(size).fill(0));
    const center = (size - 1) / 2;
    for (let x = 0; x < size; x++) {
        const dist = Math.abs(x - center);
        const maxDist = center;
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

// 1x1 Cell Brushes (using 2x2 vertex matrices)
const raiseCell = generateFlatShape(BRUSH_CELLS_1x1, 1.0); // Base height is 1, strength will modify

// 3x3 Cell Brushes (using 4x4 vertex matrices)
const softHill = generateSoftShape(BRUSH_CELLS_3x3, 2.0);
const linearRamp = generateLinearRamp(BRUSH_CELLS_3x3, 1.5);
const ridge = generateRidge(BRUSH_CELLS_3x3, 1.0);
const softValley = generateSoftShape(BRUSH_CELLS_3x3, -2.0);


export const BRUSHES: BrushDef[] = [
  { id: 'raise', name: 'Raise Cell', shape: raiseCell },
  { id: 'softHill', name: 'Soft Hill', shape: softHill },
  { id: 'ridge', name: 'Ridge', shape: ridge },
  { id: 'linearRamp', name: 'Linear Ramp', shape: linearRamp },
  { id: 'softValley', name: 'Soft Valley', shape: softValley },
];
