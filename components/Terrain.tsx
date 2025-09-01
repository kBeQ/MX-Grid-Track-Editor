/// <reference types="@react-three/fiber" />
import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { applyHeightmapToGeometry } from '../lib/utils';

interface TerrainProps {
  size?: number;
  segments: number;
  heightData: number[][];
}

const Terrain: React.FC<TerrainProps> = ({ size = 100, segments, heightData }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  const geometry = useMemo(() => new THREE.PlaneGeometry(size, size, segments, segments), [size, segments]);

  useEffect(() => {
    if (!meshRef.current?.geometry || !heightData || heightData.length === 0) return;
    
    // Use the centralized utility to apply the height data to the geometry
    applyHeightmapToGeometry(meshRef.current.geometry, heightData);

  }, [heightData]);

  return (
    <mesh ref={meshRef} geometry={geometry} rotation-x={-Math.PI / 2} receiveShadow castShadow>
      <meshStandardMaterial 
        color="#228B22" 
        roughness={0.7} 
        metalness={0.1} 
        side={THREE.DoubleSide} 
        transparent 
        opacity={0.9} 
      />
    </mesh>
  );
};

export default Terrain;