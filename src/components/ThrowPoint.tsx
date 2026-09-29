import { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

interface ThrowPointProps {
  position?: [number, number, number];
}

/**
 * Polished Ground Ring Marker for Fixed Throw Point [0, 9.1, 1.2]
 * Features a subtle animated pulse ring and crosshair
 */
export default function ThrowPoint({ position = [0, 9.1, 1.2] }: ThrowPointProps) {
  const playerPosition = useGameStore((state) => state.playerPosition);
  const carryingStone = useGameStore((state) => state.carryingStone);

  const throwPointCenter = useMemo(() => new THREE.Vector3(...position), [position]);
  const distToScout = playerPosition.distanceTo(throwPointCenter);
  const isInside = distToScout <= 2.8;

  const isTargetHit = Boolean((window as any).__vanguardInStrikeZone);

  return (
    <group position={position}>
      {/* Ground Ring Marker */}
      <group position={[0, 0.02, 0]}>
        {/* Outer Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[2.2, 2.6, 32]} />
          <meshStandardMaterial
            color={isInside ? (carryingStone ? (isTargetHit ? '#10b981' : '#f59e0b') : '#78350f') : '#d97706'}
            emissive={isInside ? (carryingStone ? (isTargetHit ? '#059669' : '#d97706') : '#451a03') : '#78350f'}
            emissiveIntensity={isInside ? 1.4 : 0.6}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Pulsing Inner Circle */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.2, 32]} />
          <meshBasicMaterial
            color={isInside ? (carryingStone ? (isTargetHit ? '#10b981' : '#f59e0b') : '#451a03') : '#78350f'}
            transparent
            opacity={isInside ? 0.3 : 0.15}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Center Crosshair Dot */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 16]} />
          <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
