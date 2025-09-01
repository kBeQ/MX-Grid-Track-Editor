/// <reference types="@react-three/fiber" />
import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface TerrainProps {
  size?: number;
  segments: number; // No longer optional, must match grid divisions
  heightData: number[][];
}

const Terrain: React.FC<TerrainProps> = ({ size = 100, segments, heightData }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  // The geometry is now directly tied to the number of segments (grid divisions)
  const geometry = useMemo(() => new THREE.PlaneGeometry(size, size, segments, segments), [size, segments]);

  useEffect(() => {
    if (!meshRef.current || !heightData || heightData.length === 0) return;

    const geom = meshRef.current.geometry;
    const positions = geom.attributes.position;
    
    // The vertex count should match the heightData dimensions
    if (positions.count !== (segments + 1) * (segments + 1)) {
        return; // Mismatch, wait for re-render
    }

    for (let i = 0; i < positions.count; i++) {
      // The vertex indices map directly to our heightData grid.
      // PlaneGeometry vertices are ordered row by row from top(-z) to bottom(+z)
      const zIndex = Math.floor(i / (segments + 1));
      const xIndex = i % (segments + 1);

      if (heightData[zIndex] && heightData[zIndex][xIndex] !== undefined) {
         // Set the Y value (which becomes height after rotation) from our heightmap
        positions.setY(i, heightData[zIndex][xIndex]);
      }
    }

    positions.needsUpdate = true;
    geom.computeVertexNormals(); // Recalculate normals for correct lighting
  }, [heightData, segments]);

  return (
    <mesh ref={meshRef} geometry={geometry} rotation-x={-Math.PI / 2} receiveShadow castShadow>
      <meshStandardMaterial color="#228B22" roughness={0.7} metalness={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
};

export default Terrain;