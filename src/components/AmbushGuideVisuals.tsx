import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

/**
 * AmbushGuideVisuals Component
 * Mounted inside <Canvas>
 * Features:
 * 1. World-anchored clean labels for "STONE SUPPLY", "THROW POINT", and "IMPACT AREA"
 * 2. State-based non-overlapping guidance system (GET BOULDER -> RETURN TO THROW POINT -> ARMED)
 * 3. Parabolic trajectory line & glowing red impact circle on the road
 */
export const AmbushGuideVisuals: React.FC = () => {
  const introPhase = useGameStore((state) => state.introPhase);
  const gameState = useGameStore((state) => state.gameState);

  const carryingStone = useGameStore((state) => state.carryingStone);
  const isCarryingStoneStore = useGameStore((state) => state.isCarryingStone);
  const isCarrying = Boolean(isCarryingStoneStore || carryingStone);

  const playerPosition = useGameStore((state) => state.playerPosition);
  const throwPointPos = useMemo(() => new THREE.Vector3(0.0, 9.1, 1.2), []);
  const distToThrow = playerPosition ? playerPosition.distanceTo(throwPointPos) : 99;
  const inThrowZone = distToThrow <= 2.8;

  const impactRingRef = useRef<THREE.Mesh>(null);
  const impactInnerRef = useRef<THREE.Mesh>(null);

  // Parabolic Trajectory Points from chute [0, 9.4, 2.5] to road [0, 0.25, 6.8]
  const parabolicPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    const steps = 24;
    const start = new THREE.Vector3(0.0, 9.4, 2.5);
    const end = new THREE.Vector3(0.0, 0.25, 6.8);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = THREE.MathUtils.lerp(start.x, end.x, t);
      const z = THREE.MathUtils.lerp(start.z, end.z, t);
      const y = THREE.MathUtils.lerp(start.y, end.y, t) + Math.sin(t * Math.PI) * 1.4;
      points.push([x, y, z]);
    }
    return points;
  }, []);

  const stoneSupplyGroupRef = useRef<THREE.Group>(null);
  const throwPointGroupRef = useRef<THREE.Group>(null);

  // Animate glowing red impact circle pulse & camera-up label positioning
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    if (impactRingRef.current) {
      const mat = impactRingRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 1.2 + Math.sin(t * 4) * 0.4;
      }
    }
    if (impactInnerRef.current) {
      const scale = 1.0 + Math.sin(t * 3) * 0.05;
      impactInnerRef.current.scale.set(scale, scale, scale);
    }

    // Extract Camera Up vector in world space for true camera-aligned world label positioning
    const cameraUp = new THREE.Vector3();
    cameraUp.setFromMatrixColumn(camera.matrixWorld, 1).normalize();

    if (stoneSupplyGroupRef.current) {
      const basePos = new THREE.Vector3(-6.0, 9.1, 1.2);
      stoneSupplyGroupRef.current.position.copy(basePos.addScaledVector(cameraUp, 1.8));
    }

    if (throwPointGroupRef.current) {
      const basePos = new THREE.Vector3(0.0, 9.1, 1.2);
      throwPointGroupRef.current.position.copy(basePos.addScaledVector(cameraUp, 1.8));
    }
  });

  if (introPhase !== 'DONE' || (gameState !== 'PLAYING' && gameState !== 'READY' && gameState !== 'ROLLING')) {
    return null;
  }

  return (
    <group>
      {/* 1. PRIMARY WORLD LABELS (Camera-Up Vector Anchored) */}

      {/* STONE SUPPLY LABEL */}
      <group ref={stoneSupplyGroupRef} position={[-6.0, 10.9, 1.2]}>
        <Html center distanceFactor={22} zIndexRange={[50, 0]}>
          <div className="inworld-guide-badge badge-stone-supply">
            <span className="badge-dot dot-blue" />
            <span className="badge-text">STONE SUPPLY ↓</span>
          </div>
        </Html>
      </group>

      {/* THROW POINT LABEL */}
      <group ref={throwPointGroupRef} position={[0.0, 10.9, 1.2]}>
        <Html center distanceFactor={22} zIndexRange={[50, 0]}>
          <div className="inworld-guide-badge badge-throw-point">
            <span className="badge-dot dot-yellow" />
            <span className="badge-text">THROW POINT ↓</span>
          </div>
        </Html>
      </group>

      {/* IMPACT AREA LABEL */}
      <Html position={[0.0, 1.5, 6.8]} center distanceFactor={22} zIndexRange={[40, 0]}>
        <div className="inworld-guide-badge badge-impact-area">
          <span className="badge-dot dot-red" />
          <span className="badge-text">IMPACT AREA</span>
        </div>
      </Html>

      {/* 2. STATE-BASED CONTEXTUAL GUIDANCE BADGES */}

      {/* STATE 1: Scout has no boulder -> GET BOULDER near Stone Supply */}
      {!isCarrying && (
        <Html position={[-6.0, 9.8, 1.2]} center distanceFactor={20} zIndexRange={[60, 0]}>
          <div className="inworld-subguide-badge badge-get-boulder">
            <span>GET BOULDER ↓</span>
          </div>
        </Html>
      )}

      {/* STATE 2: Scout is carrying boulder & not in throw zone -> RETURN TO THROW POINT */}
      {isCarrying && !inThrowZone && (
        <Html position={[-2.8, 9.8, 1.2]} center distanceFactor={20} zIndexRange={[60, 0]}>
          <div className="inworld-subguide-badge badge-return-throw">
            <span>RETURN TO THROW POINT ➔</span>
          </div>
        </Html>
      )}

      {/* STATE 3: Scout reached throw point -> Compact ARMED badge beside throw point (offset to right, X=1.8 so Scout at X=0 is 100% visible) */}
      {isCarrying && inThrowZone && (
        <Html position={[1.8, 9.5, 1.2]} center distanceFactor={18} zIndexRange={[70, 0]}>
          <div className="inworld-subguide-badge badge-armed-now">
            <span className="dot-green-pulse" />
            <span>ARMED</span>
          </div>
        </Html>
      )}

      {/* 3. DOTTED WHITE PARABOLIC TRAJECTORY LINE */}
      <Line
        points={parabolicPoints}
        color="#ffffff"
        lineWidth={2.5}
        dashed
        dashScale={8}
        dashSize={0.4}
        gapSize={0.25}
      />

      {/* 4. GLOWING RED IMPACT CIRCLE ON THE ROAD */}
      <group position={[0.0, 0.25, 6.8]}>
        <mesh ref={impactRingRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[2.5, 3.2, 36]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#dc2626"
            emissiveIntensity={1.4}
            transparent
            opacity={0.88}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh ref={impactInnerRef} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.5, 36]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={0.22}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.45, 16]} />
          <meshBasicMaterial color="#fef08a" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};

export default AmbushGuideVisuals;
