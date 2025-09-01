import type { Deformation, DeformationDef } from '../types';

const hill: Deformation = [
  [0, 1, 1, 0],
  [1, 2, 2, 1],
  [1, 2, 2, 1],
  [0, 1, 1, 0],
];

const ramp: Deformation = [
  [1, 2, 3, 4],
  [1, 2, 3, 4],
  [1, 2, 3, 4],
  [1, 2, 3, 4],
];

const pit: Deformation = [
  [0, -1, -1, 0],
  [-1, -2, -2, -1],
  [-1, -2, -2, -1],
  [0, -1, -1, 0],
];


export const DEFORMATIONS: DeformationDef[] = [
  { id: 'hill', name: 'Hill', shape: hill },
  { id: 'ramp', name: 'Ramp', shape: ramp },
  { id: 'pit', name: 'Pit', shape: pit },
];
