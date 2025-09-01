import type { FC } from 'react';

export type GridPoint = [number, number];
export type Deformation = number[][];

export interface DeformationDef {
  id: string;
  name: string;
  shape: Deformation;
  size: [number, number]; // [width, height] in grid cells
  icon: FC<{ className?: string; shape: Deformation }>;
}