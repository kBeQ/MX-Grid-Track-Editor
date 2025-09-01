/// <reference types="@react-three/fiber" />
import React, { useMemo } from 'react';
import * as THREE from 'three';

interface TerrainProps {
  size?: number;
  segments?: number;
}

const Terrain: React.FC<TerrainProps> = ({ size = 100, segments = 100 }) => {
  const geometry = useMemo(() => new THREE.PlaneGeometry(size, size, segments, segments), [size, segments]);

  return (
    <mesh geometry={geometry} rotation-x={-Math.PI / 2} receiveShadow castShadow>
      <meshStandardMaterial color="#228B22" roughness={0.7} metalness={0.1} />
    </mesh>
  );
};

export default Terrain;