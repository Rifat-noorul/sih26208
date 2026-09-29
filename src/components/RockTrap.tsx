import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

useGLTF.preload('/models/rock.glb');

/*
|--------------------------------------------------------------------------
| ROCK START & END CONSTANTS
|--------------------------------------------------------------------------
*/
const INITIAL_ROCK_POS: [number, number, number] = [0, 9.4, 2.5];
const ROCK_END_Y = 1.2;
const ROCK_END_Z = 8.5;
const DROP_DURATION = 0.45;

export const RockTrap: React.FC = () => {
  const { scene: rockModel } = useGLTF('/models/rock.glb');
  const rockGroupRef = useRef<THREE.Group>(null);

  const [showTrapRock, setShowTrapRock] = useState(false);
  const dropProgressRef = useRef(0);
  const isDroppingRef = useRef(false);
  const targetHitRef = useRef(false);
  const [, setIsDropping] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const rockInstance = useMemo(() => rockModel.clone(), [rockModel]);

  /*
  |--------------------------------------------------------------------------
  | STORE
  |--------------------------------------------------------------------------
  */
  const {
    bouldersLeft,
    setCarryingStone,
    gameState,
    setGameState,
    setBannerText,
    decrementBoulder,
    setIsSentryNeutralized,
    setVanguardNeutralized,
    setMissionSuccess,
    setIsFailed,
    setScreenShake,
    isBriefingOpen,
    setIsBriefingOpen,
  } = useGameStore();

  /*
  |--------------------------------------------------------------------------
  | CLEAR TIMERS
  |--------------------------------------------------------------------------
  */
  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => {
      clearTimeout(timer);
    });
    timersRef.current = [];
  }, []);

  /*
  |--------------------------------------------------------------------------
  | RESET ROCK
  |--------------------------------------------------------------------------
  */
  const resetRock = useCallback(() => {
    dropProgressRef.current = 0;
    isDroppingRef.current = false;
    targetHitRef.current = false;
    setIsDropping(false);
    setShowTrapRock(false);

    if (rockGroupRef.current) {
      rockGroupRef.current.position.set(
        INITIAL_ROCK_POS[0],
        INITIAL_ROCK_POS[1],
        INITIAL_ROCK_POS[2]
      );
      rockGroupRef.current.rotation.set(0, 0, 0);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | RELEASE BOULDER
  |--------------------------------------------------------------------------
  */
  const releaseRock = useCallback(() => {
    if (isBriefingOpen) {
      setIsBriefingOpen(false);
    }

    const playerPos = useGameStore.getState().playerPosition;
    const isCarrying = useGameStore.getState().carryingStone;

    // Check distance to Throwing Ridge Zone [0, 9.1, 1.2]
    const throwZoneCenter = new THREE.Vector3(0, 9.1, 1.2);
    const distToThrowZone = playerPos.distanceTo(throwZoneCenter);
    const inThrowZone = distToThrowZone <= 2.8;

    if (!isCarrying) {
      setBannerText('⚠️ GO TO STONE PILE TO FETCH A BOULDER FIRST! [WASD]');
      return;
    }

    if (!inThrowZone) {
      setBannerText('⚠️ MOVE TO THROWING RIDGE TO RELEASE BOULDER! [WASD]');
      return;
    }

    if (isDroppingRef.current || bouldersLeft <= 0) {
      return;
    }

    if (
      gameState === 'HIT' ||
      gameState === 'VICTORY' ||
      gameState === 'FAILED'
    ) {
      return;
    }

    /*
     * Read boolean exposed by VanguardColumn (3D Box3 intersection result).
     */
    const isTargetHit = Boolean((window as any).__vanguardInStrikeZone);
    targetHitRef.current = isTargetHit;

    dropProgressRef.current = 0;
    isDroppingRef.current = true;
    setIsDropping(true);
    setShowTrapRock(true);

    // Consume EXACTLY 1 boulder and clear carrying state
    decrementBoulder();
    setCarryingStone(false);
  }, [
    isBriefingOpen,
    setIsBriefingOpen,
    bouldersLeft,
    gameState,
    decrementBoulder,
    setCarryingStone,
    setBannerText,
  ]);

  /*
  |--------------------------------------------------------------------------
  | ANIMATE ROCK DROP & PROCESS WAVE PROGRESSION
  |--------------------------------------------------------------------------
  */
  useFrame((_, delta) => {
    const rock = rockGroupRef.current;
    if (!rock || !isDroppingRef.current) return;

    dropProgressRef.current += delta / DROP_DURATION;
    const t = Math.min(dropProgressRef.current, 1);

    rock.position.x = INITIAL_ROCK_POS[0];
    rock.position.y = THREE.MathUtils.lerp(INITIAL_ROCK_POS[1], ROCK_END_Y, t);
    rock.position.z = THREE.MathUtils.lerp(INITIAL_ROCK_POS[2], ROCK_END_Z, t);

    rock.rotation.x += delta * 14;
    rock.rotation.z += delta * 5;

    if (t < 1) return;

    isDroppingRef.current = false;
    setIsDropping(false);

    /*
     |--------------------------------------------------------------------------
     | HIT REGISTRATION
     |--------------------------------------------------------------------------
     */
    if (targetHitRef.current) {
      (window as any).__vanguardHit = true;
      setGameState('HIT');

      const wave = useGameStore.getState().currentWave;
      const total = useGameStore.getState().totalWaves;

      setBannerText(`💥 DHOOM!! WAVE ${wave}/${total} CLEARED!`);

      if (setIsSentryNeutralized) setIsSentryNeutralized(true);
      if (setVanguardNeutralized) setVanguardNeutralized(true);
      if (setScreenShake) setScreenShake(true, 0.5);

      const shakeTimer = setTimeout(() => {
        if (setScreenShake) setScreenShake(false);
      }, 600);
      timersRef.current.push(shakeTimer);

      const waveTimer = setTimeout(() => {
        if (wave >= total) {
          setGameState('VICTORY');
          if (setMissionSuccess) setMissionSuccess(true);
        } else {
          useGameStore.getState().nextWave();
          (window as any).__vanguardHit = false;
          (window as any).__vanguardInStrikeZone = false;
          resetRock();
          setGameState('READY');
        }
      }, 2000);
      timersRef.current.push(waveTimer);

      return;
    }

    /*
     |--------------------------------------------------------------------------
     | MISS REGISTRATION
     |--------------------------------------------------------------------------
     */
    const remaining = useGameStore.getState().bouldersLeft;

    if (remaining <= 0) {
      setGameState('FAILED');
      if (setIsFailed) setIsFailed(true);
      setBannerText('AMBUSH FAILED — OUT OF BOULDERS!');
      return;
    }

    setGameState('MISSED');
    setBannerText(
      `MISSED! Remaining ${remaining} stone${remaining > 1 ? 's' : ''} — fetch next boulder!`
    );

    const resetTimer = setTimeout(() => {
      resetRock();
      setGameState('READY');
    }, 1200);
    timersRef.current.push(resetTimer);
  });

  /*
  |--------------------------------------------------------------------------
  | KEYBOARD / EXTERNAL TRIGGER
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    (window as any).__releaseRock = releaseRock;

    const handleCustomRelease = () => {
      releaseRock();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'e') {
        event.preventDefault();
        releaseRock();
      }
    };

    window.addEventListener('trigger-rock-release', handleCustomRelease);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      delete (window as any).__releaseRock;
      window.removeEventListener('trigger-rock-release', handleCustomRelease);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [releaseRock]);

  /*
  |--------------------------------------------------------------------------
  | READY RESET
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (gameState === 'READY') {
      resetRock();
      (window as any).__vanguardHit = false;
    }
  }, [gameState, resetRock]);

  /*
  |--------------------------------------------------------------------------
  | CLEANUP
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const introPhase = useGameStore((state) => state.introPhase);
  const carryingStone = useGameStore((state) => state.carryingStone);
  const isCarryingStoneStore = useGameStore((state) => state.isCarryingStone);
  const isCarryingStone = Boolean(isCarryingStoneStore || carryingStone);
  const isChuteArmedStore = useGameStore((state) => state.isChuteArmed);
  const playerPos = useGameStore((state) => state.playerPosition);
  
  const distToThrowZone = playerPos.distanceTo(new THREE.Vector3(0, 9.1, 1.2));
  const isChuteArmed = Boolean(isChuteArmedStore || (isCarryingStone && distToThrowZone <= 2.8));

  const showBadges = introPhase === 'DONE' && (gameState === 'PLAYING' || gameState === 'READY' || gameState === 'ROLLING');

  return (
    <>
      <group ref={rockGroupRef} position={INITIAL_ROCK_POS} visible={showTrapRock}>
        <primitive
          object={rockInstance}
          scale={[0.18, 0.18, 0.18]}
          castShadow
          receiveShadow
        />
      </group>

      {showBadges && gameState === 'PLAYING' && !isChuteArmed && !isCarryingStone && (
        <Html position={[-7.5, 11.5, 2.5]} center>
          <div style={{ background: '#f59e0b', color: '#000', fontWeight: 900, padding: '4px 10px', borderRadius: 4, border: '2px solid #000' }}>🔻 1. GET BOULDER</div>
        </Html>
      )}

      {showBadges && gameState === 'PLAYING' && isCarryingStone && (
        <Html position={[0, 11.5, 2.5]} center>
          <div style={{ background: '#22c55e', color: '#000', fontWeight: 900, padding: '4px 10px', borderRadius: 4, border: '2px solid #000' }}>🔻 2. ARMED HERE</div>
        </Html>
      )}
    </>
  );
};

export default RockTrap;