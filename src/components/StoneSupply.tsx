import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

useGLTF.preload('/models/rock.glb');

interface StoneSupplyProps {
  position?: [number, number, number];
}

/**
 * 7-Stone Visual Supply Pile & Automatic Collection Zone
 * Positioned on the cliff rampart at [-6.0, 9.1, 1.2]
 */
export default function StoneSupply({ position = [-6.0, 9.1, 1.2] }: StoneSupplyProps) {
  const { scene: rockModel } = useGLTF('/models/rock.glb');
  const stonesInPile = useGameStore((state) => state.stonesInPile);
  const setCarryingStone = useGameStore((state) => state.setCarryingStone);
  const setStonesInPile = useGameStore((state) => state.setStonesInPile);
  const setBannerText = useGameStore((state) => state.setBannerText);

  // Pre-generate 7 visual offsets for the stone pile stack
  const rockPileOffsets: [number, number, number][] = useMemo(() => [
    [0.0, 0.0, 0.0],
    [0.5, 0.0, 0.3],
    [-0.4, 0.0, 0.4],
    [0.2, 0.0, -0.4],
    [-0.3, 0.0, -0.3],
    [0.1, 0.3, 0.1],
    [-0.1, 0.3, -0.1],
  ], []);

  // Pre-clone rock instances
  const rockInstances = useMemo(() => {
    return rockPileOffsets.map(() => rockModel.clone());
  }, [rockModel, rockPileOffsets]);

  const supplyCenter = useMemo(() => new THREE.Vector3(...position), [position]);

  // Frame loop checking player distance to stone supply
  useFrame(() => {
    const playerPos = useGameStore.getState().playerPosition;
    const distance = playerPos.distanceTo(supplyCenter);

    if (distance <= 2.2) {
      const isCarrying = useGameStore.getState().carryingStone;
      const pileCount = useGameStore.getState().stonesInPile;

      if (!isCarrying && pileCount > 0) {
        setCarryingStone(true);
        setStonesInPile((prev) => prev - 1);
        setBannerText('🪨 BOULDER PICKED UP! RETURN TO THROWING RIDGE [WASD]');
      }
    }
  });

  return (
    <group position={position}>
      {/* Visual Stone Stack (renders only available stones in pile) */}
      {rockPileOffsets.map((offset, idx) => {
        if (idx >= stonesInPile) return null;
        return (
          <primitive
            key={`supply-rock-${idx}`}
            object={rockInstances[idx]}
            position={offset}
            scale={[0.14, 0.14, 0.14]}
            castShadow
            receiveShadow
          />
        );
      })}

      {/* Ground Amber Beacon Ring for Stone Collection Zone */}
      <group position={[0, 0.02, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[1.2, 1.6, 32]} />
          <meshStandardMaterial
            color={stonesInPile > 0 ? '#d97706' : '#78350f'}
            emissive={stonesInPile > 0 ? '#b45309' : '#451a03'}
            emissiveIntensity={0.9}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.2, 32]} />
          <meshBasicMaterial
            color={stonesInPile > 0 ? '#d97706' : '#451a03'}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}
