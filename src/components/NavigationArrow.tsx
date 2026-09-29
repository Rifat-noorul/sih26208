import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

/**
 * Clean 3D Tactical Navigation Pointer Arrow
 * Points cleanly from the Scout toward the current active target (Stone Supply vs Throw Point)
 * Automatically hides when Scout reaches the Throw Point.
 */
export default function NavigationArrow() {
  const arrowGroupRef = useRef<THREE.Group>(null);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const carryingStone = useGameStore((state) => state.carryingStone);

  const stoneSupplyPos = useMemo(() => new THREE.Vector3(-6.0, 9.1, 1.2), []);
  const throwPointPos = useMemo(() => new THREE.Vector3(0.0, 9.1, 1.2), []);

  const targetPos = carryingStone ? throwPointPos : stoneSupplyPos;
  const distToThrow = playerPosition.distanceTo(throwPointPos);
  const isAtThrowPoint = distToThrow <= 2.8;

  // Create clean, slim 3D arrow geometry
  const arrowShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.5);
    shape.lineTo(-0.18, 0.0);
    shape.lineTo(-0.06, 0.0);
    shape.lineTo(-0.06, -0.4);
    shape.lineTo(0.06, -0.4);
    shape.lineTo(0.06, 0.0);
    shape.lineTo(0.18, 0.0);
    shape.closePath();
    return shape;
  }, []);

  useFrame((_, delta) => {
    if (!arrowGroupRef.current) return;

    // Position arrow 2.0 units above Scout's head
    arrowGroupRef.current.position.set(
      playerPosition.x,
      playerPosition.y + 2.0,
      playerPosition.z
    );

    // Calculate direction vector to target
    const dx = targetPos.x - playerPosition.x;
    const dz = targetPos.z - playerPosition.z;
    const angle = Math.atan2(dx, dz);

    // Lerp Y rotation smoothly
    let diff = angle - arrowGroupRef.current.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    arrowGroupRef.current.rotation.y += diff * Math.min(1.0, delta * 12);

    // Subtle vertical floating motion
    arrowGroupRef.current.position.y += Math.sin(Date.now() * 0.004) * 0.05;
  });

  // Hide arrow completely when Scout reaches throw point with a stone
  if (carryingStone && isAtThrowPoint) return null;

  return (
    <group ref={arrowGroupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <shapeGeometry args={[arrowShape]} />
        <meshStandardMaterial
          color={carryingStone ? '#f59e0b' : '#3b82f6'}
          emissive={carryingStone ? '#d97706' : '#1d4ed8'}
          emissiveIntensity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
