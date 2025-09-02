import type { FC } from 'react';

export type GridPoint = [number, number];
// A deformation is a 2D array of height values, representing a vertex heightmap.
export type Deformation = number[][];

export type SculptMode = 'raise' | 'lower';

export interface BrushDef {
  id: string;
  name: string;
  shape: Deformation; // The vertex heightmap for the brush.
}
