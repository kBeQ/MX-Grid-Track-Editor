import type { Deformation, DeformationDef } from '../types';
import { BrushPreview } from './BrushIcons';

// 5x5 soft circular brush
const softHill: Deformation = [
  [0.0, 0.1, 0.2, 0.1, 0.0],
  [0.1, 0.4, 0.6, 0.4, 0.1],
  [0.2, 0.6, 1.0, 0.6, 0.2],
  [0.1, 0.4, 0.6, 0.4, 0.1],
  [0.0, 0.1, 0.2, 0.1, 0.0],
];

// 5x5 soft circular pit (inverted hill)
const softPit: Deformation = softHill.map(row => row.map(val => -val));

// 5x5 linear ramp
const linearRamp: Deformation = [
  [0.2, 0.2, 0.2, 0.2, 0.2],
  [0.4, 0.4, 0.4, 0.4, 0.4],
  [0.6, 0.6, 0.6, 0.6, 0.6],
  [0.8, 0.8, 0.8, 0.8, 0.8],
  [1.0, 1.0, 1.0, 1.0, 1.0],
];

// 5x5 ridge
const ridge: Deformation = [
    [0.1, 0.2, 0.3, 0.2, 0.1],
    [0.1, 0.2, 0.3, 0.2, 0.1],
    [0.1, 0.2, 0.3, 0.2, 0.1],
    [0.1, 0.2, 0.3, 0.2, 0.1],
    [0.1, 0.2, 0.3, 0.2, 0.1],
];


export const DEFORMATIONS: DeformationDef[] = [
  { id: 'softHill', name: 'Soft Hill', shape: softHill, size: [5, 5], icon: BrushPreview },
  { id: 'linearRamp', name: 'Linear Ramp', shape: linearRamp, size: [5, 5], icon: BrushPreview },
  { id: 'ridge', name: 'Ridge', shape: ridge, size: [5, 5], icon: BrushPreview },
  { id: 'softPit', name: 'Soft Pit', shape: softPit, size: [5, 5], icon: BrushPreview },
];