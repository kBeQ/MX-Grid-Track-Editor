/// <reference types="@react-three/fiber" />
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

interface TerrainProps {
  size?: number;
  segments?: number;
}

const Terrain: React.FC<TerrainProps> = ({ size = 100, segments = 100 }) => {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    const noise2D = createNoise2D();
    const positions = geo.attributes.position;
    const colors = [];

    const maxHeight = 8;
    const waterLevel = -2;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      const n1 = noise2D(x / 50, y / 50);
      const n2 = noise2D(x / 25, y / 25) * 0.5;
      const n3 = noise2D(x / 12.5, y / 12.5) * 0.25;

      const height = (n1 + n2 + n3) * maxHeight;
      positions.setZ(i, height);
      
      const color = new THREE.Color();
      if (height < waterLevel) {
        color.set("#4682B4"); // SteelBlue for water
      } else if (height < 0) {
        color.set("#F0E68C"); // Khaki for sand
      } else if (height < 5) {
        color.set("#228B22"); // ForestGreen for grass
      } else {
        color.set("#8B4513"); // SaddleBrown for rock
      }
      colors.push(color.r, color.g, color.b);
    }
    
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [size, segments]);

  return (
    <mesh geometry={geometry} rotation-x={-Math.PI / 2} receiveShadow castShadow>
      <meshStandardMaterial vertexColors={true} roughness={0.7} metalness={0.1} />
    </mesh>
  );
};

export default Terrain;