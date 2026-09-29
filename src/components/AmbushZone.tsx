import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AmbushZoneProps {
  position: [number, number, number];
  size: [number, number, number];
  debug?: boolean;
}

const AmbushZone: React.FC<AmbushZoneProps> = ({
  position,
  size,
  debug = false,
}) => {
  const zoneRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const zone = {
      position: new THREE.Vector3(position[0], position[1], position[2]),
      size: new THREE.Vector3(size[0], size[1], size[2]),
    };

    (window as any).__ambushZone = zone;

    return () => {
      delete (window as any).__ambushZone;
    };
  }, [position, size]);

  return (
    <mesh ref={zoneRef} position={position} visible={debug}>
      <boxGeometry args={size} />
      <meshBasicMaterial transparent opacity={0.25} wireframe />
    </mesh>
  );
};

export default AmbushZone;