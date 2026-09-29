import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { translations } from '../utils/i18n';
import Minimap from './Minimap';
import MobileControls from './MobileControls';
import LanguageSelector from './LanguageSelector';
import ObjectivePrompt from './ObjectivePrompt';
import {
  Eye,
  EyeOff,
  RotateCcw,
  ChevronRight,
  Trophy,
  Shield,
  Compass,
  Zap,
  PackageCheck,
  Clock,
} from 'lucide-react';

/**
 * Tactical HUD & Multi-Wave Ambush Victory Overlay
 * - Top Left: Operation Title & Wave Counter
 * - Top Center: Integrated Operational Timer
 * - Top Right: Stones Counter, Scout Stealth Meter, Language Selector & Tactical Minimap
 * - Bottom Center: Contextual Objective Prompt Banner (single dynamic prompt)
 * - Mobile Touch Controls Overlay
 * - Victory & Failure Modals
 */
export default function HUD() {
  const detectionLevel = useGameStore((state) => state.detectionLevel);
  const isPlayerCrouched = useGameStore((state) => state.isPlayerCrouched);
  const missionSuccess = useGameStore((state) => state.missionSuccess);
  const isFailed = useGameStore((state) => state.isFailed);
  const gameState = useGameStore((state) => state.gameState);
  const resetGame = useGameStore((state) => state.resetGame);
  const bouldersLeft = useGameStore((state) => state.bouldersLeft);
  const carryingStone = useGameStore((state) => state.carryingStone);
  const stonesInPile = useGameStore((state) => state.stonesInPile);
  const currentWave = useGameStore((state) => state.currentWave);
  const totalWaves = useGameStore((state) => state.totalWaves);
  const ambushMessage = useGameStore((state) => state.ambushMessage);
  const bannerText = useGameStore((state) => state.bannerText);
  const language = useGameStore((state) => state.language);
  const waveTimer = useGameStore((state) => state.waveTimer);
  const setWaveTimer = useGameStore((state) => state.setWaveTimer);

  const t = translations[language] || translations.en;

  // Countdown timer logic for active ambush wave
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

  return (
    <div className="hud-layer">
      {/* 1. TOP BAR */}
      <div className="hud-top-bar">
        {/* TOP LEFT: TITLE & WAVE COUNTER */}
        <div className="dispatch-mini-title">
          <div className="mini-badge">
            {t.wave} {currentWave} / {totalWaves}
          </div>
          <h2>GANIMI KAVA — UMBERKHIND</h2>
        </div>

        {/* TOP CENTER: TIMER & STEP-BY-STEP OBJECTIVE BANNER */}
        <div className="hud-top-center-container">
          <div className={`hud-timer-chip ${waveTimer <= 15 ? 'timer-low-alert' : ''}`}>
            <Clock size={15} className="text-amber-400" />
            <span>⏱ {waveTimer}s</span>
          </div>
          <ObjectivePrompt />
        </div>

        {/* TOP RIGHT: STONES, STEALTH METER, LANGUAGE SELECTOR */}
        <div className="hud-top-right-group">
          {/* Stones Remaining Counter */}
          <div className="hud-stones-badge">
            <PackageCheck size={14} className="text-amber-400" />
            <span>{t.stones}: {stonesInPile}</span>
          </div>

          {/* Scout Stealth Meter */}
          <div className="ridge-stealth-meter-wrapper">
            <div className="ridge-meter-header">
              <span className="meter-label-text">
                SCOUT: {isPlayerCrouched ? `● ${t.scoutHidden}` : `○ ${t.scoutExposed}`}
              </span>
              <span className="meter-pct">{Math.round(detectionLevel)}%</span>
            </div>
            <div className="ridge-svg-box">
              <svg className="ridge-svg" viewBox="0 0 160 16" preserveAspectRatio="none">
                <rect width="100%" height="100%" fill="#1c1917" rx="3" />
                <rect width={`${(detectionLevel / 100) * 160}`} height="100%" fill="#dc2626" rx="3" />
              </svg>
            </div>
          </div>

          {/* Compact Language Selector (🌐 EN) */}
          <LanguageSelector />
        </div>
      </div>

      {/* TOP RIGHT TACTICAL MINIMAP */}
      <Minimap />

      {/* MOBILE JOYSTICK & TOUCH CONTROLS */}
      <MobileControls />

      {/* ALERT MESSAGE BANNER (Occasional DHOOM or Miss alerts) */}
      {(bannerText || ambushMessage) && (
        <div className="hud-alert-banner">
          {bannerText || ambushMessage}
        </div>
      )}



      {/* 2. BOTTOM CONTROLS STRIP */}
      <div className="hud-bottom-bar">
        <div className="carved-wood-strip">
          {/* [C] Stealth Stance */}
          <div className={`strip-chip ${isPlayerCrouched ? 'chip-stealth-active' : ''}`}>
            <kbd>C</kbd>
            {isPlayerCrouched ? <EyeOff size={15} /> : <Eye size={15} />}
            <span>{isPlayerCrouched ? t.scoutHidden : t.scoutExposed}</span>
          </div>

          {/* [WASD] Navigation */}
          <div className="strip-chip">
            <kbd>WASD</kbd>
            <Compass size={15} />
            <span>Navigation</span>
          </div>

          {/* [E] Action Key */}
          <div
            className={`strip-chip ${carryingStone ? 'chip-trigger-active' : ''}`}
            onClick={() => window.dispatchEvent(new CustomEvent('trigger-rock-release'))}
            style={{ cursor: 'pointer' }}
          >
            <kbd>E</kbd>
            <Zap size={15} />
            <span>
              {carryingStone ? `${t.carryingStone} [E]` : t.carryingNone}
            </span>
          </div>
        </div>
      </div>

      {/* 3. VICTORY MODAL */}
      {(missionSuccess || gameState === 'VICTORY') && (
        <div className="modal-backdrop">
          <div className="parchment-modal">
            <div className="modal-header-badge">
              <Trophy size={18} />
              <span>AMBUSH CLIMAX COMPLETE</span>
            </div>

            <h2 className="parchment-title">
              {t.victory}
            </h2>

            <div className="debrief-section historical-debrief">
              <div className="section-title">
                <Shield size={16} />
                <span>COMIC CAPTION & VICTORY LORE</span>
              </div>
              <p className="caption-lore">
                “The gorge is sealed! All 5 imperial vanguard columns are completely crushed under Sahyadri basalt. <strong>Victory without shedding Maratha blood!</strong>”
              </p>
            </div>

            <div className="stats-amber-box">
              <div className="stat-pill">
                <span className="pill-label">{t.wave}</span>
                <span className="pill-val">{currentWave} / {totalWaves}</span>
              </div>
              <div className="stat-pill">
                <span className="pill-label">{t.stones} Left</span>
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

      {/* 4. FAILURE MODAL */}
      {(isFailed || gameState === 'FAILED') && !missionSuccess && gameState !== 'VICTORY' && (
        <div className="modal-backdrop">
          <div className="failure-modal">
            <div className="failure-icon-ring">
              <Eye size={36} className="eye-alert-icon" />
            </div>
            <h2>{t.failed}</h2>
            <p className="failure-desc">
              {bouldersLeft === 0
                ? 'All 7 boulders were exhausted before completing all 5 vanguard waves.'
                : 'The imperial vanguard detected your scout position before the rockslide could be sprung.'}
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
}
