import type { Deformation, DeformationDef } from '../types';

// NOTE: The icon component is now defined directly in App.tsx to reduce file count.
// We are casting it to any here to avoid a complex type import.
const BrushPreview = (() => null) as any;

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
const raiseCell = generateFlatShape(BRUSH_CELLS_1x1, 0.5);
const lowerCell = generateFlatShape(BRUSH_CELLS_1x1, -0.5);

// 3x3 Cell Brushes (using 4x4 vertex matrices)
const softHill = generateSoftShape(BRUSH_CELLS_3x3, 2.0);
const linearRamp = generateLinearRamp(BRUSH_CELLS_3x3, 1.5);
const ridge = generateRidge(BRUSH_CELLS_3x3, 1.0);


export const DEFORMATIONS: DeformationDef[] = [
  { id: 'raise', name: 'Raise Cell', shape: raiseCell, size: [BRUSH_CELLS_1x1, BRUSH_CELLS_1x1], icon: BrushPreview },
  { id: 'lower', name: 'Lower Cell', shape: lowerCell, size: [BRUSH_CELLS_1x1, BRUSH_CELLS_1x1], icon: BrushPreview },
  { id: 'softHill', name: 'Soft Hill', shape: softHill, size: [BRUSH_CELLS_3x3, BRUSH_CELLS_3x3], icon: BrushPreview },
  { id: 'ridge', name: 'Ridge', shape: ridge, size: [BRUSH_CELLS_3x3, BRUSH_CELLS_3x3], icon: BrushPreview },
  { id: 'linearRamp', name: 'Linear Ramp', shape: linearRamp, size: [BRUSH_CELLS_3x3, BRUSH_CELLS_3x3], icon: BrushPreview },
];