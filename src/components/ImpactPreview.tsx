import { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

/**
 * 3D Tactical Aim Pointer & Ground Impact Circle Preview
 * Activates only when Scout is standing at Throw Point carrying a stone.
 */
export default function ImpactPreview() {
  const playerPosition = useGameStore((state) => state.playerPosition);
  const carryingStone = useGameStore((state) => state.carryingStone);

  const throwPointPos = useMemo(() => new THREE.Vector3(0.0, 9.1, 1.2), []);
  const distToThrow = playerPosition.distanceTo(throwPointPos);
  const isAtThrowPoint = distToThrow <= 2.8;

  // Real-time Vanguard Box3 collision check
  const isTargetHit = Boolean((window as any).__vanguardInStrikeZone);

  // Parabolic Trajectory Line Points matching RockTrap trajectory (from [0, 9.4, 2.5] to [0, 0.25, 6.8])
  const trajectoryPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const count = 16;
    const start = new THREE.Vector3(0.0, 9.4, 2.5);
    const end = new THREE.Vector3(0.0, 0.25, 6.8);

    for (let i = 0; i <= count; i++) {
      const p = i / count;
      const x = THREE.MathUtils.lerp(start.x, end.x, p);
      const z = THREE.MathUtils.lerp(start.z, end.z, p);
      const y = THREE.MathUtils.lerp(start.y, end.y, p) + Math.sin(p * Math.PI) * 1.2;
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  }, []);

  const lineMesh = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(trajectoryPoints);
    const mat = new THREE.LineDashedMaterial({
      color: isTargetHit ? '#10b981' : '#f59e0b',
      dashSize: 0.3,
      gapSize: 0.15,
    });
    const line = new THREE.Line(geom, mat);
    line.computeLineDistances();
    return line;
  }, [trajectoryPoints, isTargetHit]);

  if (!carryingStone || !isAtThrowPoint) return null;

  return (
    <group>
      {/* Slim 3D Trajectory Aim Line */}
      <primitive object={lineMesh} />

      {/* Predicted Ground Impact Circle Ring on Valley Floor [0, 0.25, 6.8] */}
      <group position={[0, 0.25, 6.8]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[2.2, 2.8, 32]} />
          <meshStandardMaterial
            color={isTargetHit ? '#10b981' : '#f59e0b'}
            emissive={isTargetHit ? '#059669' : '#d97706'}
            emissiveIntensity={isTargetHit ? 1.6 : 0.8}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.2, 32]} />
          <meshBasicMaterial
            color={isTargetHit ? '#10b981' : '#d97706'}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}
