import type { Deformation, DeformationDef } from '../types';
import { BrushPreview } from './BrushIcons';

const BRUSH_SIZE = 3;

const generateSoftShape = (size: number, peak: number, inverted = false): Deformation => {
  const shape = Array(size).fill(0).map(() => Array(size).fill(0));
  const center = Math.floor(size / 2);
  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) {
      const distX = x - center;
      const distZ = z - center;
      const dist = Math.sqrt(distX * distX + distZ * distZ);
      let height = 0;
      if (dist <= center) {
        // Cosine falloff for a smooth curve
        height = (Math.cos((dist / center) * Math.PI) + 1) / 2 * peak;
      }
      shape[z][x] = inverted ? -height : height;
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
    const center = Math.floor(size / 2);
    for (let x = 0; x < size; x++) {
        const dist = Math.abs(x - center);
        let height = 0;
        if (dist <= center) {
            height = (Math.cos((dist / center) * Math.PI) + 1) / 2 * peak;
        }
        for (let z = 0; z < size; z++) {
            shape[z][x] = height;
        }
    }
    return shape;
}

const softHill = generateSoftShape(BRUSH_SIZE, 1.0);
const linearRamp = generateLinearRamp(BRUSH_SIZE, 1.5);
const ridge = generateRidge(BRUSH_SIZE, 0.75);
const softPit = generateSoftShape(BRUSH_SIZE, 1.0, true);

export const DEFORMATIONS: DeformationDef[] = [
  { id: 'softHill', name: 'Soft Hill', shape: softHill, size: [BRUSH_SIZE, BRUSH_SIZE], icon: BrushPreview },
  { id: 'linearRamp', name: 'Linear Ramp', shape: linearRamp, size: [BRUSH_SIZE, BRUSH_SIZE], icon: BrushPreview },
  { id: 'ridge', name: 'Ridge', shape: ridge, size: [BRUSH_SIZE, BRUSH_SIZE], icon: BrushPreview },
  { id: 'softPit', name: 'Soft Pit', shape: softPit, size: [BRUSH_SIZE, BRUSH_SIZE], icon: BrushPreview },
];