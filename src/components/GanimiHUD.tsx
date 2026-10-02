import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  Trophy,
  Shield,
  Eye,
  RotateCcw,
  ChevronRight,
  Crosshair,
  Package,
  Compass,
} from 'lucide-react';
import MobileControls from './MobileControls';

export const GanimiHUD: React.FC = () => {
  const currentWave = useGameStore((state) => state.currentWave);
  const totalWaves = useGameStore((state) => state.totalWaves);
  const waveTimer = useGameStore((state) => state.waveTimer);
  const setWaveTimer = useGameStore((state) => state.setWaveTimer);
  const stonesInPile = useGameStore((state) => state.stonesInPile);
  const bouldersLeft = useGameStore((state) => state.bouldersLeft);
  const carryingStone = useGameStore((state) => state.carryingStone);
  const isCarryingStoneStore = useGameStore((state) => state.isCarryingStone);
  const isCarryingStone = Boolean(isCarryingStoneStore || carryingStone);

  const gameState = useGameStore((state) => state.gameState);
  const missionSuccess = useGameStore((state) => state.missionSuccess);
  const isFailed = useGameStore((state) => state.isFailed);
  const resetGame = useGameStore((state) => state.resetGame);

  const [isAiming, setIsAiming] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isRadarOpen, setIsRadarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || ('ontouchstart' in window && window.innerWidth <= 1024);
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Countdown timer logic for active wave
  useEffect(() => {
    if (gameState !== 'READY' && gameState !== 'ROLLING' && gameState !== 'PLAYING') return;

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

  const handleThrow = () => {
    window.dispatchEvent(new CustomEvent('trigger-rock-release'));
  };

  const handleToggleAim = () => {
    setIsAiming((prev) => !prev);
    window.dispatchEvent(new CustomEvent('toggle-aim-reticle'));
  };

  return (
    <div className={`ganimi-hud-overlay ${isAiming ? 'aim-active' : ''} ${isMobile ? 'is-mobile-hud' : ''}`}>
      {/* Center Aim Crosshair Overlay if Aiming */}
      {isAiming && (
        <div className="aim-crosshair-screen">
          <Crosshair size={48} className="aim-crosshair-icon" />
        </div>
      )}

      {/* ================= MOBILE HUD LAYOUT ================= */}
      {isMobile ? (
        <>
          {/* Top Bar for Mobile */}
          <div className="mobile-top-bar-container">
            <div className="mobile-top-left">
              <span className="mobile-wave-badge">WAVE {currentWave}/{totalWaves}</span>
              <span className="mobile-title-badge">GANIMI KAVA</span>
            </div>

            <div className="mobile-top-right">
              <div className={`mobile-hud-pill ${waveTimer <= 15 ? 'timer-alert' : ''}`}>
                <span>⏱️ {waveTimer}s</span>
              </div>
              <div className="mobile-hud-pill">
                <span>🪨 {stonesInPile}/7</span>
              </div>
              <button
                className="mobile-radar-toggle-btn"
                onClick={() => setIsRadarOpen((prev) => !prev)}
                title="Toggle Radar Legend"
              >
                <Compass size={16} />
              </button>
            </div>
          </div>

          {/* Floating Compact Objective Guide on Mobile */}
          {gameState === 'PLAYING' && (
            <div className="mobile-compact-objective">
              {isCarryingStone ? '↓ RETURN TO THROW POINT' : '↓ GET BOULDER'}
            </div>
          )}

          {/* Collapsible Radar Overlay Drawer on Mobile */}
          {isRadarOpen && (
            <div className="mobile-radar-drawer" onClick={() => setIsRadarOpen(false)}>
              <div className="legend-title">TACTICAL RADAR LEGEND</div>
              <div className="legend-grid">
                <div className="legend-item"><span className="legend-dot dot-scout" /> Scout</div>
                <div className="legend-item"><span className="legend-dot dot-stone" /> Stone Supply</div>
                <div className="legend-item"><span className="legend-dot dot-throw" /> Throw Point</div>
                <div className="legend-item"><span className="legend-dot dot-vanguard" /> Vanguard</div>
                <div className="legend-item"><span className="legend-dot dot-ambush" /> Ambush Zone</div>
                <div className="legend-item"><span className="legend-dot dot-fort" /> Fort</div>
              </div>
            </div>
          )}

          {/* Mobile Virtual Joystick & Touch Action Controls */}
          <MobileControls isMobileLayout={true} />
        </>
      ) : (
        /* ================= DESKTOP HUD LAYOUT (PRESERVED) ================= */
        <>
          {/* TOP BAR */}
          <div className="ganimi-top-bar">
            <div className="ganimi-top-left-group">
              <div className="wave-gold-header">
                <span className="wave-gold-label">WAVE</span>
                <span className="wave-gold-value">{currentWave} / {totalWaves}</span>
              </div>
              <div className="title-pill">
                <span className="title-pill-text">GANIMI KAVA — UMBERKHIND</span>
              </div>
            </div>

            <div className="ganimi-top-right-group">
              <div className={`countdown-pill ${waveTimer <= 15 ? 'timer-alert' : ''}`}>
                <span className="timer-icon">⏱️</span>
                <span className="timer-value">{waveTimer}s</span>
              </div>

              <div className="stones-card">
                <Package size={16} className="stones-card-icon" />
                <span className="stones-card-text">
                  STONES: <strong className="stones-gold-count">{stonesInPile}/7</strong>
                </span>
              </div>

              <div className="scout-status-card">
                <span className="live-dot" />
                <span className="scout-status-label">SCOUT:</span>
                <span className="scout-carrying-label">
                  CARRYING: <strong className={isCarryingStone ? 'carrying-active' : 'carrying-none'}>
                    {isCarryingStone ? 'BOULDER' : 'NONE'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM-LEFT */}
          <div className="ganimi-bottom-left">
            <div className="tactical-navigation-card">
              <div className="nav-top-row">
                <div className="compass-dial">
                  <svg viewBox="0 0 70 70" className="compass-svg">
                    <circle cx="35" cy="35" r="32" fill="#0f1418" stroke="#d97706" strokeWidth="1.5" />
                    <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(217, 119, 6, 0.25)" strokeDasharray="2 2" />
                    <text x="35" y="13" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="900">N</text>
                    <text x="35" y="63" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="700">S</text>
                    <text x="60" y="38" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="700">E</text>
                    <text x="10" y="38" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="700">W</text>
                    <g transform="translate(35, 35)">
                      <polygon points="0,0 -4,-18 0,-24 4,-18" fill="#ef4444" />
                      <polygon points="0,0 -4,18 0,24 4,18" fill="#f8fafc" opacity="0.9" />
                      <circle cx="0" cy="0" r="3" fill="#d97706" />
                    </g>
                  </svg>
                </div>

                <div className="radar-legend-box">
                  <div className="legend-title">TACTICAL RADAR LEGEND</div>
                  <div className="legend-grid">
                    <div className="legend-item"><span className="legend-dot dot-scout" /><span>Scout</span></div>
                    <div className="legend-item"><span className="legend-dot dot-stone" /><span>Stone Supply</span></div>
                    <div className="legend-item"><span className="legend-dot dot-throw" /><span>Throw Point</span></div>
                    <div className="legend-item"><span className="legend-dot dot-vanguard" /><span>Vanguard</span></div>
                    <div className="legend-item"><span className="legend-dot dot-ambush" /><span>Ambush Zone</span></div>
                    <div className="legend-item"><span className="legend-dot dot-fort" /><span>Fort</span></div>
                  </div>
                </div>
              </div>

              <div className="keycaps-pill">
                <div className="keycap-group">
                  <kbd>W</kbd><kbd>S</kbd><kbd>D</kbd><kbd>A</kbd>
                  <span className="keycap-action-label">Move</span>
                </div>
                <span className="keycap-divider">|</span>
                <div className="keycap-group">
                  <kbd className="keycap-accent">E</kbd>
                  <span className="keycap-action-label">Action</span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM-RIGHT */}
          <div className="ganimi-bottom-right">
            <button
              className={`aim-reticle-btn ${isAiming ? 'active' : ''}`}
              onClick={handleToggleAim}
              title="Toggle Aiming Reticle Mode"
            >
              <Crosshair size={22} />
            </button>

            <button
              className={`circular-action-btn ${isCarryingStone ? 'carrying-rock' : ''}`}
              onClick={handleThrow}
              title="Release Boulder"
            >
              <span className="gold-ring-glow" />
              <div className="action-btn-content">
                <span className="action-key">E</span>
                <span className="action-sublabel">THROW</span>
              </div>
            </button>
          </div>
        </>
      )}

      {/* ================= VICTORY MODAL ================= */}
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

      {/* ================= FAILURE MODAL ================= */}
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

export default GanimiHUD;
