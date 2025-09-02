import type { FC } from 'react';

export type GridPoint = [number, number];
// A deformation is a 2D array of height values, representing a vertex heightmap.
export type Deformation = number[][];

export type SculptMode = 'raise' | 'lower';

export interface BrushDef {
  id: string;
  name: string;
  // A function that generates the brush shape based on a desired vertex dimension.
  // e.g., a vertexSize of 4 would generate a 4x4 vertex matrix for a 3x3 cell brush.
  shape: (vertexSize: number) => Deformation;
}