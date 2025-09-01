export type GridPoint = [number, number];
export type Deformation = number[][];

export interface DeformationDef {
  id: string;
  name: string;
  shape: Deformation;
}
