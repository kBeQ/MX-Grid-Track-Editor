/// <reference types="@react-three/fiber" />
import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface TerrainProps {
  size?: number;
  segments?: number;
  heightData: number[][];
}

const Terrain: React.FC<TerrainProps> = ({ size = 100, segments = 100, heightData }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  const geometry = useMemo(() => new THREE.PlaneGeometry(size, size, segments, segments), [size, segments]);

  useEffect(() => {
    if (!meshRef.current || !heightData) return;

    const geom = meshRef.current.geometry;
    const positions = geom.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      // The geometry is created on the XY plane. The vertex indices map to a grid.
      // We are modifying the Y value, which becomes height after the mesh is rotated.
      const zIndex = Math.floor(i / (segments + 1));
      const xIndex = i % (segments + 1);

      if (heightData[zIndex] && heightData[zIndex][xIndex] !== undefined) {
        positions.setY(i, heightData[zIndex][xIndex]);
      }
    }

    positions.needsUpdate = true;
    geom.computeVertexNormals(); // Recalculate normals for correct lighting
  }, [heightData, segments]);

  return (
    <mesh ref={meshRef} geometry={geometry} rotation-x={-Math.PI / 2} receiveShadow castShadow>
      <meshStandardMaterial color="#228B22" roughness={0.7} metalness={0.1} />
    </mesh>
  );
};

export default Terrain;
