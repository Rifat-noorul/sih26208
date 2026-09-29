import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

/**
 * Cinematic Camera Controller
 * Lerps camera position and target vector smoothly based on introPhase state:
 * - 'SCOUT_FOCUS': Camera [3.5, 11.2, 5.8], lookAt [0, 9.5, 2.5]
 * - 'ENEMY_FOCUS': Camera [vX + 6.0, 3.2, 17.5], lookAt [vX, 1.5, 12.0]
 * - 'DONE' / default: Camera [0, 17, 27], lookAt [0, 5, 9]
 */
export default function CinematicCamera() {
  const introPhase = useGameStore((state) => state.introPhase);
  const lookAtTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 5, 9));

  useFrame(({ camera }) => {
    if (introPhase === 'DONE') return;

    const vanguardGroup = (window as any).__vanguardRef?.current;
    const vX = vanguardGroup ? vanguardGroup.position.x : 14;

    const targetPos = new THREE.Vector3(0, 17, 27);
    const targetLookAt = new THREE.Vector3(0, 5, 9);

    if (introPhase === 'SCOUT_FOCUS') {
      targetPos.set(3.5, 11.2, 5.8);
      targetLookAt.set(0, 9.5, 2.5);
    } else if (introPhase === 'ENEMY_FOCUS') {
      targetPos.set(vX + 6.0, 3.2, 17.5);
      targetLookAt.set(vX, 1.5, 12.0);
    }

    // Lerp camera position
    camera.position.lerp(targetPos, 0.06);

    // Lerp lookAt target vector smoothly
    lookAtTargetRef.current.lerp(targetLookAt, 0.06);
    camera.lookAt(lookAtTargetRef.current);
  });

  return null;
}
