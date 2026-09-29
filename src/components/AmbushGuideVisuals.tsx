import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

/**
 * AmbushGuideVisuals Component
 * Mounted inside <Canvas>
 * Features:
 * 1. Floating badges for "STONE SUPPLY", "THROW POINT", and "IMPACT AREA"
 * 2. Dotted white parabolic line from throw point chute down to impact area
 * 3. Glowing red impact circle on the road
 */
export const AmbushGuideVisuals: React.FC = () => {
  const introPhase = useGameStore((state) => state.introPhase);
  const gameState = useGameStore((state) => state.gameState);

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
      // Parabolic elevation arc
      const y = THREE.MathUtils.lerp(start.y, end.y, t) + Math.sin(t * Math.PI) * 1.4;
      points.push([x, y, z]);
    }
    return points;
  }, []);

  // Animate glowing red impact circle pulse
  useFrame(({ clock }) => {
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
  });

  if (introPhase !== 'DONE' || (gameState !== 'PLAYING' && gameState !== 'READY' && gameState !== 'ROLLING')) {
    return null;
  }

  return (
    <group>
      {/* 1. FLOATING IN-WORLD BADGES */}

      {/* STONE SUPPLY BADGE */}
      <Html position={[-6.0, 10.6, 1.2]} center distanceFactor={22}>
        <div className="inworld-guide-badge badge-stone-supply">
          <span className="badge-dot dot-blue" />
          <span className="badge-text">STONE SUPPLY</span>
        </div>
      </Html>

      {/* THROW POINT BADGE */}
      <Html position={[0.0, 10.6, 1.2]} center distanceFactor={22}>
        <div className="inworld-guide-badge badge-throw-point">
          <span className="badge-dot dot-yellow" />
          <span className="badge-text">THROW POINT</span>
        </div>
      </Html>

      {/* IMPACT AREA BADGE */}
      <Html position={[0.0, 1.6, 6.8]} center distanceFactor={22}>
        <div className="inworld-guide-badge badge-impact-area">
          <span className="badge-dot dot-red" />
          <span className="badge-text">IMPACT AREA</span>
        </div>
      </Html>

      {/* 2. DOTTED WHITE PARABOLIC LINE */}
      <Line
        points={parabolicPoints}
        color="#ffffff"
        lineWidth={2.5}
        dashed
        dashScale={8}
        dashSize={0.4}
        gapSize={0.25}
      />

      {/* 3. GLOWING RED IMPACT CIRCLE ON THE ROAD */}
      <group position={[0.0, 0.25, 6.8]}>
        {/* Outer Ring */}
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

        {/* Inner Pulsing Circle */}
        <mesh ref={impactInnerRef} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.5, 36]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={0.22}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Ground Target Crosshair accent */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.45, 16]} />
          <meshBasicMaterial color="#fef08a" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};

export default AmbushGuideVisuals;
