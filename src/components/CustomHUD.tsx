import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import * as THREE from 'three';
import {
  Trophy,
  Shield,
  ChevronRight,
  Eye,
  RotateCcw,
} from 'lucide-react';

/**
 * CustomHUD Component
 * Tactical HUD overlay matching custom sketch layout:
 * 1. Top-Left: Wave & Timer info box + (EN/MR) circle language toggle
 * 2. Top-Center: Wide step-by-step objective banner
 * 3. Top-Right: Square Radar map viewport + 2 status pill tags
 * 4. Bottom-Left: Vertical stacked controls table
 * 5. Bottom-Right: Interactive D-Pad directional controls
 * 6. Victory & Failure debrief modals
 */
export const CustomHUD: React.FC = () => {
  const currentWave = useGameStore((state) => state.currentWave);
  const totalWaves = useGameStore((state) => state.totalWaves);
  const waveTimer = useGameStore((state) => state.waveTimer);
  const setWaveTimer = useGameStore((state) => state.setWaveTimer);
  const language = useGameStore((state) => state.language);
  const setLanguage = useGameStore((state) => state.setLanguage);

  const playerPosition = useGameStore((state) => state.playerPosition);
  const isPlayerCrouched = useGameStore((state) => state.isPlayerCrouched);
  const setIsPlayerCrouched = useGameStore((state) => state.setIsPlayerCrouched);
  const carryingStone = useGameStore((state) => state.carryingStone);
  const isCarryingStoneStore = useGameStore((state) => state.isCarryingStone);
  const isCarryingStone = Boolean(isCarryingStoneStore || carryingStone);

  const isChuteArmedStore = useGameStore((state) => state.isChuteArmed);
  const setIsChuteArmed = useGameStore((state) => state.setIsChuteArmed);

  const stonesInPile = useGameStore((state) => state.stonesInPile);
  const bouldersLeft = useGameStore((state) => state.bouldersLeft);
  const gameState = useGameStore((state) => state.gameState);
  const missionSuccess = useGameStore((state) => state.missionSuccess);
  const isFailed = useGameStore((state) => state.isFailed);
  const resetGame = useGameStore((state) => state.resetGame);

  const [vanguardX, setVanguardX] = useState(25);

  // Poll Vanguard X position for radar
  useEffect(() => {
    const interval = setInterval(() => {
      const vPos = (window as any).__vanguardRef?.current?.position?.x;
      if (typeof vPos === 'number') {
        setVanguardX(vPos);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer logic for active wave
  useEffect(() => {
    if (gameState !== 'READY' && gameState !== 'ROLLING') return;

    const interval = setInterval(() => {
      setWaveTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          useGameStore.getState().setGameState('FAILED');
          useGameStore.getState().setIsFailed(true);
          useGameStore.getState().setBannerText("TIME'S UP — VANGUARD ESCAPED THE DEFILE!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, setWaveTimer]);

  // Determine chute armed state dynamically
  const throwPointPos = useMemo(() => new THREE.Vector3(0.0, 9.1, 1.2), []);
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

  // Active step text logic
  let stepText = "STEP 1: GO TO CACHE (LEFT) TO PICK UP BOULDER";
  if (isChuteArmed) {
    stepText = "STEP 3: DROP [E] ON ADVANCING VANGUARD";
  } else if (isCarryingStone) {
    stepText = "STEP 2: HAUL BOULDER TO DROP CHUTE (CENTER)";
  } else {
    stepText = "STEP 1: GO TO CACHE (LEFT) TO PICK UP BOULDER";
  }

  // Radar coordinate mappings (-25 to +25 -> 0 to 140)
  const mapX = (worldX: number) => Math.max(10, Math.min(130, ((worldX + 25) / 50) * 120 + 10));
  const mapY = (worldZ: number) => Math.max(10, Math.min(130, ((worldZ + 25) / 50) * 120 + 10));

  // D-Pad Event Handlers
  const handleDpadPress = (code: string, key: string) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code, key, bubbles: true }));
  };

  const handleDpadRelease = (code: string, key: string) => {
    window.dispatchEvent(new KeyboardEvent('keyup', { code, key, bubbles: true }));
  };

  return (
    <div className="custom-hud-overlay">
      {/* 1 & 2. TOP-LEFT PANEL & LANGUAGE SWITCH */}
      <div className="custom-hud-top-left">
        <div className="custom-hud-info-box">
          <div className="info-row wave-row">WAVE {currentWave}/{totalWaves}</div>
          <div className="info-row time-row">TIME: {waveTimer}s</div>
        </div>
        <button
          className="custom-lang-circle-btn"
          onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
          title="Toggle EN / MR"
        >
          ({language === 'mr' ? 'MR' : 'EN'})
        </button>
      </div>

      {/* 3. TOP-CENTER STEPS BAR */}
      <div className="custom-hud-top-center">
        <div className="custom-step-banner">
          {stepText}
        </div>
      </div>

      {/* 4. TOP-RIGHT RADAR MAP & STATUS TAGS */}
      <div className="custom-hud-top-right">
        <div className="custom-radar-viewport">
          <svg width="100%" height="100%" viewBox="0 0 140 140">
            <defs>
              <pattern id="radarGridCustom" width="14" height="14" patternUnits="userSpaceOnUse">
                <path d="M 14 0 L 0 0 0 14" fill="none" stroke="rgba(217, 119, 6, 0.18)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="#0d1114" />
            <rect width="100%" height="100%" fill="url(#radarGridCustom)" />

            {/* Cliff Rampart Line */}
            <line x1="8" y1={mapY(1.2)} x2="132" y2={mapY(1.2)} stroke="#d97706" strokeDasharray="2,2" strokeWidth="1" opacity="0.4" />
            {/* Canyon Road Line */}
            <line x1="8" y1={mapY(6.8)} x2="132" y2={mapY(6.8)} stroke="#ef4444" strokeDasharray="2,2" strokeWidth="1" opacity="0.3" />

            {/* Target Strike Zone */}
            <circle cx={mapX(0.0)} cy={mapY(6.8)} r="14" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />

            {/* Chute Marker */}
            <circle cx={mapX(0.0)} cy={mapY(1.2)} r="4" fill="rgba(245, 158, 11, 0.3)" stroke="#f59e0b" strokeWidth="1.2" />

            {/* Stone Cache Marker */}
            <circle cx={mapX(-6.0)} cy={mapY(1.2)} r="4" fill="#d97706" />

            {/* Marching Vanguard Dot */}
            <g transform={`translate(${mapX(vanguardX)}, ${mapY(6.8)})`}>
              <circle r="5" fill="#dc2626" />
              <circle r="8" fill="none" stroke="#ef4444" strokeWidth="1">
                <animate attributeName="r" values="5;9;5" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite" />
              </circle>
            </g>

            {/* Scout Dot */}
            <g transform={`translate(${mapX(playerPosition.x)}, ${mapY(playerPosition.z)})`}>
              <circle r="4.5" fill="#10b981" />
              <circle r="7.5" fill="none" stroke="#34d399" strokeWidth="1.2" />
            </g>
          </svg>
        </div>

        {/* Status Pill Tags */}
        <div className="custom-status-pills">
          <div className="status-pill stone-pill">
            STONE: {stonesInPile} Left
          </div>
          <div className={`status-pill scout-pill ${isPlayerCrouched ? 'pill-concealed' : 'pill-exposed'}`}>
            SCOUT: {isPlayerCrouched ? 'CONCEALED' : 'EXPOSED'}
          </div>
        </div>
      </div>

      {/* 5. BOTTOM-LEFT CONTROLS CARD */}
      <div className="custom-hud-bottom-left">
        <div className="custom-controls-card">
          <div className="control-row">
            <kbd>WASD</kbd>
            <span>Traverse Bastion</span>
          </div>
          <div
            className={`control-row action-row ${isCarryingStone ? 'active-action' : ''}`}
            onClick={() => window.dispatchEvent(new CustomEvent('trigger-rock-release'))}
          >
            <kbd>E</kbd>
            <span>Drop Boulder</span>
          </div>
          <div
            className={`control-row action-row ${isPlayerCrouched ? 'active-stealth' : ''}`}
            onClick={() => setIsPlayerCrouched(!isPlayerCrouched)}
          >
            <kbd>C</kbd>
            <span>Toggle Stealth Stance</span>
          </div>
        </div>
      </div>

      {/* 6. BOTTOM-RIGHT D-PAD JOYSTICK */}
      <div className="custom-hud-bottom-right">
        <div className="custom-dpad-container">
          <button
            className="dpad-btn dpad-up"
            onMouseDown={() => handleDpadPress('KeyW', 'w')}
            onMouseUp={() => handleDpadRelease('KeyW', 'w')}
            onMouseLeave={() => handleDpadRelease('KeyW', 'w')}
            onTouchStart={(e) => { e.preventDefault(); handleDpadPress('KeyW', 'w'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleDpadRelease('KeyW', 'w'); }}
          >
            ▲
          </button>
          <div className="dpad-middle">
            <button
              className="dpad-btn dpad-left"
              onMouseDown={() => handleDpadPress('KeyA', 'a')}
              onMouseUp={() => handleDpadRelease('KeyA', 'a')}
              onMouseLeave={() => handleDpadRelease('KeyA', 'a')}
              onTouchStart={(e) => { e.preventDefault(); handleDpadPress('KeyA', 'a'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleDpadRelease('KeyA', 'a'); }}
            >
              ◀
            </button>
            <div className="dpad-center-hub" />
            <button
              className="dpad-btn dpad-right"
              onMouseDown={() => handleDpadPress('KeyD', 'd')}
              onMouseUp={() => handleDpadRelease('KeyD', 'd')}
              onMouseLeave={() => handleDpadRelease('KeyD', 'd')}
              onTouchStart={(e) => { e.preventDefault(); handleDpadPress('KeyD', 'd'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleDpadRelease('KeyD', 'd'); }}
            >
              ▶
            </button>
          </div>
          <button
            className="dpad-btn dpad-down"
            onMouseDown={() => handleDpadPress('KeyS', 's')}
            onMouseUp={() => handleDpadRelease('KeyS', 's')}
            onMouseLeave={() => handleDpadRelease('KeyS', 's')}
            onTouchStart={(e) => { e.preventDefault(); handleDpadPress('KeyS', 's'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleDpadRelease('KeyS', 's'); }}
          >
            ▼
          </button>
        </div>
      </div>

      {/* VICTORY MODAL */}
      {(missionSuccess || gameState === 'VICTORY') && (
        <div className="modal-backdrop">
          <div className="parchment-modal">
            <div className="modal-header-badge">
              <Trophy size={18} />
              <span>AMBUSH CLIMAX COMPLETE</span>
            </div>
            <h2 className="parchment-title">VICTORY OVER MUGHAL VANGUARD</h2>
            <div className="debrief-section historical-debrief">
              <div className="section-title">
                <Shield size={16} />
                <span>VICTORY DEBRIEF</span>
              </div>
              <p className="caption-lore">
                “The gorge is sealed! All 5 imperial vanguard columns are completely crushed under Sahyadri basalt. <strong>Victory without shedding Maratha blood!</strong>”
              </p>
            </div>

            <div className="stats-amber-box">
              <div className="stat-pill">
                <span className="pill-label">Wave</span>
                <span className="pill-val">{currentWave} / {totalWaves}</span>
              </div>
              <div className="stat-pill">
                <span className="pill-label">Stones Left</span>
                <span className="pill-val">{bouldersLeft} / 7</span>
              </div>
              <div className="stat-pill">
                <span className="pill-label">Defile Status</span>
                <span className="pill-val">Blocked</span>
              </div>
            </div>

            <button className="campaign-btn" onClick={resetGame}>
              <span>PROCEED TO MISSION 2: NIGHT ESCALADE OF KONDHANA ▶</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* FAILURE MODAL */}
      {(isFailed || gameState === 'FAILED') && !missionSuccess && gameState !== 'VICTORY' && (
        <div className="modal-backdrop">
          <div className="failure-modal">
            <div className="failure-icon-ring">
              <Eye size={36} className="eye-alert-icon" />
            </div>
            <h2>MISSION FAILED</h2>
            <p className="failure-desc">
              {bouldersLeft === 0
                ? 'All 7 boulders were exhausted before completing all 5 vanguard waves.'
                : 'The imperial vanguard escaped or detected your position.'}
            </p>

            <button className="retry-btn" onClick={resetGame}>
              <RotateCcw size={18} />
              <span>RETRY MISSION</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomHUD;
