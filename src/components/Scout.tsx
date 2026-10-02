import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

useGLTF.preload('/models/scout.glb');
useGLTF.preload('/models/rock.glb');

export interface ScoutProps {
  onStanceChange?: (isCrouched: boolean) => void;
  controlsRef?: React.RefObject<any>;
}

/**
 * Helper to generate a procedural 512x512 Maratha Mavlā warrior texture map
 */
function createScoutWarriorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#42382c';
    ctx.fillRect(0, 0, 512, 512);

    const patchColors = ['#2c3224', '#382e21', '#1f1a14', '#4e4133'];
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const w = 20 + Math.random() * 60;
      const h = 20 + Math.random() * 60;
      ctx.fillStyle = patchColors[Math.floor(Math.random() * patchColors.length)];
      ctx.globalAlpha = 0.4 + Math.random() * 0.4;
      ctx.fillRect(x, y, w, h);
    }

    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#c85a17';
    ctx.fillRect(0, 200, 512, 80);

    ctx.fillStyle = '#d96b24';
    ctx.fillRect(0, 210, 512, 12);
    ctx.fillRect(0, 258, 512, 12);

    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#24180f';
    ctx.fillRect(0, 180, 512, 16);
    ctx.fillRect(0, 284, 512, 16);

    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? '#3a3f45' : '#1a1d20';
      ctx.fillRect(x, y, 2, 2);
    }

    ctx.globalAlpha = 1.0;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.needsUpdate = true;
  return texture;
}

export default function Scout({ onStanceChange, controlsRef }: ScoutProps) {
  const meshRef = useRef<THREE.Group>(null);
  const scoutGroupRef = useRef<THREE.Group>(null);
  const rockAttachRef = useRef<THREE.Group>(null);

  const scoutGltf = useGLTF('/models/scout.glb');
  const rockGltf = useGLTF('/models/rock.glb');

  const scoutTexture = useMemo(() => createScoutWarriorTexture(), []);

  // Deep clone rock scene for carrying attachment
  const rockInstance = useMemo(() => rockGltf.scene.clone(true), [rockGltf.scene]);

  const { scoutScene, baseScale } = useMemo(() => {
    const clone = scoutGltf.scene.clone();

    const meshNodes: THREE.Mesh[] = [];
    clone.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        meshNodes.push(node as THREE.Mesh);
      }
    });

    let categorizedCount = 0;

    meshNodes.forEach((mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const meshName = (mesh.name || '').toLowerCase();
      const matName = Array.isArray(mesh.material)
        ? mesh.material.map((m) => (m.name || '').toLowerCase()).join(' ')
        : (mesh.material?.name || '').toLowerCase();
      const name = `${meshName} ${matName}`;

      const processMaterial = (mat: THREE.Material) => {
        const stdMat = mat.clone() as THREE.MeshStandardMaterial;

        if (name.includes('helmet') || name.includes('metal') || name.includes('armor') || name.includes('blade') || name.includes('weapon') || name.includes('steel') || name.includes('iron')) {
          stdMat.color.set('#3a3f45');
          stdMat.metalness = 0.82;
          stdMat.roughness = 0.35;
          categorizedCount++;
        } else if (name.includes('sash') || name.includes('pagri') || name.includes('turban') || name.includes('flag') || name.includes('accent') || name.includes('orange') || name.includes('saffron')) {
          stdMat.color.set('#c85a17');
          stdMat.roughness = 0.85;
          stdMat.metalness = 0.05;
          categorizedCount++;
        } else if (name.includes('belt') || name.includes('strap') || name.includes('boot') || name.includes('shoe') || name.includes('leather')) {
          stdMat.color.set('#24180f');
          stdMat.roughness = 0.7;
          stdMat.metalness = 0.1;
          categorizedCount++;
        } else if (name.includes('skin') || name.includes('face') || name.includes('hand') || name.includes('head') || name.includes('body')) {
          stdMat.color.set('#9e7552');
          stdMat.roughness = 0.65;
          categorizedCount++;
        } else if (name.includes('cloth') || name.includes('tunic') || name.includes('kurta') || name.includes('pant') || name.includes('fabric')) {
          stdMat.color.set('#42382c');
          stdMat.roughness = 0.9;
          stdMat.metalness = 0.05;
          categorizedCount++;
        }
        return stdMat;
      };

      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(processMaterial);
        } else {
          mesh.material = processMaterial(mesh.material);
        }
      }
    });

    if (meshNodes.length <= 1 || categorizedCount === 0) {
      meshNodes.forEach((mesh) => {
        mesh.material = new THREE.MeshStandardMaterial({
          map: scoutTexture,
          roughness: 0.78,
          metalness: 0.25,
        });
      });
    }

    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const scaleFactor = 1.8 / Math.max(size.y, 0.001);

    return { scoutScene: clone, baseScale: scaleFactor };
  }, [scoutGltf.scene, scoutTexture]);

  // Zustand Store
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const setIsPlayerCrouched = useGameStore((state) => state.setIsPlayerCrouched);
  const isCameraPanning = useGameStore((state) => state.isCameraPanning);
  const isBriefingOpen = useGameStore((state) => state.isBriefingOpen);
  const carryingStone = useGameStore((state) => state.carryingStone);
  const isCarryingStoneStore = useGameStore((state) => state.isCarryingStone);
  const isCarryingStone = Boolean(isCarryingStoneStore || carryingStone);
  const gameState = useGameStore((state) => state.gameState);

  const surfaceY = 9.1;

  const positionRef = useRef<THREE.Vector3>(new THREE.Vector3(-1.8, surfaceY, 1.2));
  const rotationRef = useRef<number>(0);
  const targetRotationRef = useRef<number>(0);

  const [isCrouched, setIsCrouched] = useState(false);
  const isCrouchedRef = useRef(false);
  const currentScaleYRef = useRef(baseScale);

  const keysRef = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBriefingOpen) return;

      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keysRef.current.w = true;
      if (code === 'KeyA' || code === 'ArrowLeft') keysRef.current.a = true;
      if (code === 'KeyS' || code === 'ArrowDown') keysRef.current.s = true;
      if (code === 'KeyD' || code === 'ArrowRight') keysRef.current.d = true;

      if (code === 'KeyC' && !e.repeat) {
        setIsCrouched((prev) => {
          const next = !prev;
          isCrouchedRef.current = next;
          setIsPlayerCrouched(next);
          if (onStanceChange) onStanceChange(next);
          return next;
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keysRef.current.w = false;
      if (code === 'KeyA' || code === 'ArrowLeft') keysRef.current.a = false;
      if (code === 'KeyS' || code === 'ArrowDown') keysRef.current.s = false;
      if (code === 'KeyD' || code === 'ArrowRight') keysRef.current.d = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isBriefingOpen, onStanceChange, setIsPlayerCrouched]);

  // Ensure rockInstance meshes cast and receive shadows
  useEffect(() => {
    if (rockInstance) {
      rockInstance.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [rockInstance]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (rockAttachRef.current && isCarryingStone) {
      const baseHeadY = isCrouchedRef.current ? 1.4 : 1.95;
      rockAttachRef.current.position.y = baseHeadY + Math.sin(state.clock.elapsedTime * 6) * 0.04;
    }

    if (!isBriefingOpen) {
      const speedMultiplier = isCrouchedRef.current ? 0.07 : 0.15;
      const moveDistance = speedMultiplier * (delta * 60);

      let dx = 0;
      let dz = 0;

      if (keysRef.current.w) dz -= 1;
      if (keysRef.current.s) dz += 1;
      if (keysRef.current.a) dx -= 1;
      if (keysRef.current.d) dx += 1;

      const isMoving = dx !== 0 || dz !== 0;

      if (isMoving) {
        const length = Math.hypot(dx, dz);
        dx /= length;
        dz /= length;

        targetRotationRef.current = Math.atan2(dx, dz);

        const newX = THREE.MathUtils.clamp(
          positionRef.current.x + dx * moveDistance,
          -8.0,
          8.0
        );
        const newZ = THREE.MathUtils.clamp(
          positionRef.current.z + dz * moveDistance,
          0.2,
          2.2
        );

        positionRef.current.x = newX;
        positionRef.current.z = newZ;
      }
    }

    positionRef.current.y = surfaceY;
    setPlayerPosition(positionRef.current);

    let rotDiff = targetRotationRef.current - rotationRef.current;
    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
    rotationRef.current += rotDiff * Math.min(1.0, delta * 12);

    const targetScaleY = isCrouchedRef.current ? baseScale * 0.7 : baseScale;
    currentScaleYRef.current = THREE.MathUtils.lerp(
      currentScaleYRef.current,
      targetScaleY,
      delta * 10
    );

    meshRef.current.position.set(
      positionRef.current.x,
      positionRef.current.y,
      positionRef.current.z
    );
    meshRef.current.rotation.y = rotationRef.current;

    if (scoutGroupRef.current) {
      scoutGroupRef.current.scale.set(baseScale, currentScaleYRef.current, baseScale);
    }

    if (!isCameraPanning && controlsRef && controlsRef.current) {
      const scoutTarget = new THREE.Vector3(
        positionRef.current.x,
        positionRef.current.y + 1.0,
        positionRef.current.z
      );
      controlsRef.current.target.lerp(scoutTarget, 0.1);
    }
  });

  return (
    <group ref={meshRef}>
      {/* Subtle 👤 YOU Tag (only during PLAYING when !isCarryingStone) */}
      {gameState === 'PLAYING' && !isCarryingStone && (
        <Html position={[0, 2.2, 0]} center>
          <div
            style={{
              background: '#10b981',
              color: '#000',
              fontWeight: 900,
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: 4,
              border: '1.5px solid #000',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            👤 YOU
          </div>
        </Html>
      )}

      {/* Scout 3D GLTF Model */}
      <group ref={scoutGroupRef} scale={[baseScale, baseScale, baseScale]}>
        <primitive object={scoutScene} />
      </group>

      {/* 3D Overhead Rock Model visibly carried on top of Scout's head when isCarryingStone is true */}
      {isCarryingStone && (
        <group ref={rockAttachRef} position={[0, 1.95, 0]}>
          <primitive
            object={rockInstance}
            scale={[0.18, 0.18, 0.18]}
            castShadow
            receiveShadow
          />
        </group>
      )}

      {/* Ground Ring Indicator Under Scout's Feet */}
      <group position={[0, 0.02, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[0.45, 0.75, 32]} />
          <meshStandardMaterial
            color={isCarryingStone ? '#d97706' : isCrouched ? '#10b981' : '#f59e0b'}
            emissive={isCarryingStone ? '#b45309' : isCrouched ? '#059669' : '#d97706'}
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}
