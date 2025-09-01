import type { FC } from 'react';

export type GridPoint = [number, number];
// A deformation is a 2D array of height values, representing a vertex heightmap.
export type Deformation = number[][];

export interface DeformationDef {
  id: string;
  name: string;
  shape: Deformation; // The vertex heightmap for the brush.
  // The dimensions of the vertex heightmap matrix.
  // A (N+1)x(N+1) shape corresponds to an NxN grid of cells.
  size: [number, number]; 
  icon: FC<{ className?: string; shape: Deformation }>;
}