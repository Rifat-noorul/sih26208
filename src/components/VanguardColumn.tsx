import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

useGLTF.preload('/models/warrior.glb');

/*
|--------------------------------------------------------------------------
| 10-MAN WEDGE FORMATION OFFSETS
|--------------------------------------------------------------------------
*/
const TROOP_OFFSETS: [number, number, number][] = [
  // Rank 1
  [0.0, 0, 0.0],
  // Rank 2
  [2.2, 0, -1.0],
  [2.2, 0, 1.0],
  // Rank 3
  [4.4, 0, -1.8],
  [4.4, 0, 0.0],
  [4.4, 0, 1.8],
  // Rank 4
  [6.6, 0, -2.6],
  [6.6, 0, -0.9],
  [6.6, 0, 0.9],
  [6.6, 0, 2.6],
];

/*
|--------------------------------------------------------------------------
| FALLBACK STRIKE ZONE BOUNDS
|--------------------------------------------------------------------------
*/
const STRIKE_ZONE_CENTER = new THREE.Vector3(0, 3, 6.8);
const STRIKE_ZONE_SIZE = new THREE.Vector3(8.5, 5, 7);

export default function VanguardColumn() {
  const formationRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/warrior.glb');
  const gameState = useGameStore((state) => state.gameState);

  /*
  |--------------------------------------------------------------------------
  | EXPOSE VANGUARD STATE
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    (window as any).__vanguardRef = formationRef;
    (window as any).__vanguardHit = false;

    return () => {
      delete (window as any).__vanguardRef;
      delete (window as any).__vanguardHit;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | RESET FORMATION FOR NEW WAVE / GAME RESET
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (gameState === 'READY') {
      if (formationRef.current) {
        formationRef.current.position.set(14, 3, 6.8);
      }
      (window as any).__vanguardHit = false;
      (window as any).__vanguardInStrikeZone = false;
    }
  }, [gameState]);

  /*
  |--------------------------------------------------------------------------
  | SCATTER POSITIONS AFTER HIT
  |--------------------------------------------------------------------------
  */
  const scatterOffsets = useMemo(() => {
    return Array.from({ length: 10 }, () => ({
      x: (Math.random() - 0.5) * 3,
      z: (Math.random() - 0.5) * 2,
      rotZ: Math.PI / 2 + (Math.random() - 0.5) * 0.5,
    }));
  }, []);

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE WARRIOR MODEL
  |--------------------------------------------------------------------------
  */
  const { normalizedModel, baseScale } = useMemo(() => {
    const clone = scene.clone();
    clone.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const height = size.y > 0 ? size.y : 1;
    const scaleFactor = 1.8 / height;

    clone.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((material) => {
            const cloned = material.clone();
            const mat = cloned as THREE.MeshStandardMaterial;
            mat.roughness = 0.8;
            mat.metalness = 0.15;
            return mat;
          });
        } else {
          const cloned = mesh.material.clone();
          const mat = cloned as THREE.MeshStandardMaterial;
          mat.roughness = 0.8;
          mat.metalness = 0.15;
          mesh.material = mat;
        }
      }
    });

    return { normalizedModel: clone, baseScale: scaleFactor };
  }, [scene]);

  /*
  |--------------------------------------------------------------------------
  | CREATE 10 INSTANCES
  |--------------------------------------------------------------------------
  */
  const troopInstances = useMemo(() => {
    return TROOP_OFFSETS.map(() => normalizedModel.clone());
  }, [normalizedModel]);

  /*
  |--------------------------------------------------------------------------
  | CHECK WHETHER VANGUARD IS INSIDE THE FIXED STRIKE ZONE
  |--------------------------------------------------------------------------
  */
  const checkStrikeZone = () => {
    const formation = formationRef.current;
    if (!formation) return false;

    // Read configured AmbushZone from window or fallback to default
    const ambushZone = (window as any).__ambushZone;
    const zoneCenter = ambushZone?.position ?? STRIKE_ZONE_CENTER;
    const zoneSize = ambushZone?.size ?? STRIKE_ZONE_SIZE;

    const zoneMin = new THREE.Vector3(
      zoneCenter.x - zoneSize.x / 2,
      zoneCenter.y - zoneSize.y / 2,
      zoneCenter.z - zoneSize.z / 2
    );

    const zoneMax = new THREE.Vector3(
      zoneCenter.x + zoneSize.x / 2,
      zoneCenter.y + zoneSize.y / 2,
      zoneCenter.z + zoneSize.z / 2
    );

    const zoneBox = new THREE.Box3(zoneMin, zoneMax);

    /*
     * Calculate actual world bounding box of the entire 10-man formation.
     */
    formation.updateWorldMatrix(true, true);
    const formationBox = new THREE.Box3().setFromObject(formation);

    return zoneBox.intersectsBox(formationBox);
  };

  /*
  |--------------------------------------------------------------------------
  | CONTINUOUS MARCHING
  |--------------------------------------------------------------------------
  */
  useFrame((_, delta) => {
    const formation = formationRef.current;
    if (!formation) return;

    /*
     * Stop after successful hit.
     */
    if (
      gameState === 'HIT' ||
      gameState === 'VICTORY' ||
      Boolean((window as any).__vanguardHit)
    ) {
      return;
    }

    /*
     * March toward -X.
     */
    formation.position.x -= delta * 3.2;

    /*
     * Loop back.
     */
    if (formation.position.x < -30) {
      formation.position.x = 28;
    }

    /*
     * Continuously expose whether the formation is currently inside ambush zone.
     */
    const inside = checkStrikeZone();
    (window as any).__vanguardInStrikeZone = inside;
  });

  /*
  |--------------------------------------------------------------------------
  | HIT STATE
  |--------------------------------------------------------------------------
  */
  const isHit =
    gameState === 'HIT' ||
    gameState === 'VICTORY' ||
    Boolean((window as any).__vanguardHit);

  return (
    <group ref={formationRef} position={[14, 3, 6.8]}>
      {gameState === 'PLAYING' && !isHit && (
        <Html position={[3.5, 4.0, 0]} center>
          <div style={{ background: '#dc2626', color: '#fff', fontWeight: 900, fontSize: '11px', padding: '3px 8px', borderRadius: 3, border: '1px solid #fff', whiteSpace: 'nowrap' }}>🎯 MUGHAL VANGUARD (TARGET)</div>
        </Html>
      )}
      {TROOP_OFFSETS.map((offset, index) => {
        const scatter = scatterOffsets[index];

        const x = isHit ? offset[0] + scatter.x : offset[0];
        const z = isHit ? offset[2] + scatter.z : offset[2];
        const rotationZ = isHit ? scatter.rotZ : 0;

        return (
          <group
            key={`vanguard-${index}`}
            position={[x, 0, z]}
            rotation={[0, -Math.PI / 2, rotationZ]}
          >
            <primitive
              object={troopInstances[index]}
              scale={[baseScale, baseScale, baseScale]}
            />
          </group>
        );
      })}
    </group>
  );
}

export { VanguardColumn };