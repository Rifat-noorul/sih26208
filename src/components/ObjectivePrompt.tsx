import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import * as THREE from 'three';

/**
 * Top-Center Step-by-Step Objective Banner
 * Renders a prominent, pulsing amber/gold objective card under the HUD timer:
 * - STEP 1: RUN LEFT TO PICK UP A BOULDER (if !isChuteArmed && !isCarryingStone)
 * - STEP 2: CARRY THE BOULDER TO THE CLIFF LEDGE [CENTER] (if isCarryingStone && !isChuteArmed)
 * - STEP 3: LOOK AT CANYON ROAD BELOW — PRESS [E] WHEN TROOPS PASS UNDER! (if isChuteArmed)
 */
export default function ObjectivePrompt() {
  const playerPosition = useGameStore((state) => state.playerPosition);
  const carryingStone = useGameStore((state) => state.carryingStone);
  const isCarryingStoneStore = useGameStore((state) => state.isCarryingStone);
  const isCarryingStone = Boolean(isCarryingStoneStore || carryingStone);
  const isChuteArmedStore = useGameStore((state) => state.isChuteArmed);
  const setIsChuteArmed = useGameStore((state) => state.setIsChuteArmed);
  const gameState = useGameStore((state) => state.gameState);

  const throwPointPos = new THREE.Vector3(0.0, 9.1, 1.2);
  const distToThrow = playerPosition.distanceTo(throwPointPos);
  const isAtThrowPoint = distToThrow <= 2.8;

  const isChuteArmed = Boolean(isChuteArmedStore || (isCarryingStone && isAtThrowPoint));

  useEffect(() => {
    if (isCarryingStone && isAtThrowPoint) {
      if (!isChuteArmedStore) setIsChuteArmed(true);
    } else {
      if (isChuteArmedStore) setIsChuteArmed(false);
    }
  }, [isCarryingStone, isAtThrowPoint, isChuteArmedStore, setIsChuteArmed]);

  if (gameState === 'HIT' || gameState === 'VICTORY' || gameState === 'FAILED') {
    return null;
  }

  let displayText = "👉 STEP 1: RUN LEFT TO PICK UP A BOULDER";
  if (isChuteArmed) {
    displayText = "🎯 STEP 3: LOOK AT CANYON ROAD BELOW — PRESS [E] WHEN TROOPS PASS UNDER!";
  } else if (isCarryingStone) {
    displayText = "👉 STEP 2: CARRY THE BOULDER TO THE CLIFF LEDGE [CENTER]";
  } else {
    displayText = "👉 STEP 1: RUN LEFT TO PICK UP A BOULDER";
  }

  return (
    <div className="top-objective-banner">
      {displayText}
    </div>
  );
}

