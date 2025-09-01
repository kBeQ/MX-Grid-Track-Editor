/// <reference types="@react-three/fiber" />
import React from 'react';
import { Grid as DreiGrid } from '@react-three/drei';
import type { GridPoint } from '../types';

interface GridProps {
  size: number;
  divisions: number;
  onCellClick: (point: GridPoint, shiftKey: boolean) => void;
}

const Grid: React.FC<GridProps> = ({ size, divisions, onCellClick }) => {
  const cellSize = size / divisions;

  const handleClick = (event: any) => {
    event.stopPropagation();
    const { point, shiftKey } = event;
    
    const gridX = Math.floor((point.x + size / 2) / cellSize);
    const gridZ = Math.floor((point.z + size / 2) / cellSize);

    if (gridX >= 0 && gridX < divisions && gridZ >= 0 && gridZ < divisions) {
      onCellClick([gridX, gridZ], shiftKey);
    }
  };

  return (
    <>
      <DreiGrid
        key={divisions} // Force re-creation when divisions change
        position={[0, 0.1, 0]} // Slightly above terrain to avoid z-fighting
        args={[size, size]}
        cellSize={cellSize}
        cellThickness={1}
        cellColor="#888888"
        // Make sections same as cells for a uniform grid
        sectionSize={cellSize}
        sectionThickness={1}
        sectionColor="#888888"
        fadeDistance={150}
        fadeStrength={1}
        infiniteGrid={false}
      />
      <mesh
        rotation-x={-Math.PI / 2}
        onClick={handleClick}
        visible={false} // This mesh is only for raycasting
      >
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial />
      </mesh>
    </>
  );
};

export default Grid;