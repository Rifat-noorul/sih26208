import { create } from 'zustand';
import * as THREE from 'three';

export type GameAmbushState = 'READY' | 'PLAYING' | 'ROLLING' | 'HIT' | 'MISSED' | 'VICTORY' | 'FAILED';
export type IntroPhase = 'STORY_PAGE_1' | 'STORY_PAGE_2' | 'SCOUT_FOCUS' | 'ENEMY_FOCUS' | 'MISSION_DISPATCH' | 'DONE';

interface GameState {
  introPhase: IntroPhase;
  setIntroPhase: (phase: IntroPhase) => void;
  isBriefingOpen: boolean;
  setIsBriefingOpen: (open: boolean) => void;
  isSpotted: boolean;
  setIsSpotted: (spotted: boolean) => void;
  detectionLevel: number; // 0 to 100%
  setDetectionLevel: (level: number) => void;
  playerPosition: THREE.Vector3;
  setPlayerPosition: (pos: THREE.Vector3) => void;
  isPlayerCrouched: boolean;
  setIsPlayerCrouched: (crouched: boolean) => void;
  sentryPosition: THREE.Vector3;
  setSentryPosition: (pos: THREE.Vector3) => void;
  isSentryNeutralized: boolean;
  setIsSentryNeutralized: (neutralized: boolean) => void;
  vanguardNeutralized: boolean;
  setVanguardNeutralized: (neutralized: boolean) => void;
  isCameraPanning: boolean;
  setIsCameraPanning: (panning: boolean) => void;
  showDhoomEffect: boolean;
  setShowDhoomEffect: (show: boolean) => void;
  missionSuccess: boolean;
  setMissionSuccess: (success: boolean) => void;
  isFailed: boolean;
  setIsFailed: (failed: boolean) => void;
  isTrapReleased: boolean;
  setIsTrapReleased: (released: boolean) => void;
  showOnomatopoeia: boolean;
  setShowOnomatopoeia: (show: boolean) => void;

  // Boulder & Carrying State
  bouldersLeft: number;
  setBouldersLeft: (val: number | ((prev: number) => number)) => void;
  decrementBoulder: () => void;
  carryingStone: boolean;
  isCarryingStone: boolean;
  setCarryingStone: (carrying: boolean) => void;
  isChuteArmed: boolean;
  setIsChuteArmed: (armed: boolean) => void;
  stonesInPile: number;
  setStonesInPile: (val: number | ((prev: number) => number)) => void;

  currentWave: number;
  totalWaves: number;
  setCurrentWave: (val: number | ((prev: number) => number)) => void;
  nextWave: () => void;
  gameState: GameAmbushState;
  setGameState: (gState: GameAmbushState) => void;
  bannerText: string;
  setBannerText: (text: string) => void;
  ambushMessage: string;
  setAmbushMessage: (msg: string) => void;
  // Language & Timer
  language: 'en' | 'hi' | 'ta' | 'mr';
  setLanguage: (lang: 'en' | 'hi' | 'ta' | 'mr') => void;
  waveTimer: number;
  setWaveTimer: (val: number | ((prev: number) => number)) => void;

  screenShake: boolean;
  screenShakeIntensity: number;
  setScreenShake: (shake: boolean, intensity?: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  introPhase: 'STORY_PAGE_1',
  setIntroPhase: (phase) => set({ introPhase: phase }),
  isBriefingOpen: true, // Opens on game start
  setIsBriefingOpen: (open) => set({ isBriefingOpen: open, ...(open ? {} : { gameState: 'PLAYING' }) }),
  isSpotted: false,
  setIsSpotted: (spotted) => set({ isSpotted: spotted }),
  detectionLevel: 0,
  setDetectionLevel: (level) => set({ detectionLevel: Math.max(0, Math.min(100, level)) }),
  playerPosition: new THREE.Vector3(-1.8, 9.1, 1.2),
  setPlayerPosition: (pos) => set({ playerPosition: pos.clone() }),
  isPlayerCrouched: false,
  setIsPlayerCrouched: (crouched) => set({ isPlayerCrouched: crouched }),
  sentryPosition: new THREE.Vector3(30, 0.2, 15.0),
  setSentryPosition: (pos) => set({ sentryPosition: pos.clone() }),
  isSentryNeutralized: false,
  setIsSentryNeutralized: (neutralized) => set({ isSentryNeutralized: neutralized }),
  vanguardNeutralized: false,
  setVanguardNeutralized: (neutralized) => set({ vanguardNeutralized: neutralized }),
  isCameraPanning: false,
  setIsCameraPanning: (panning) => set({ isCameraPanning: panning }),
  showDhoomEffect: false,
  setShowDhoomEffect: (show) => set({ showDhoomEffect: show }),
  missionSuccess: false,
  setMissionSuccess: (success) => set({ missionSuccess: success }),
  isFailed: false,
  setIsFailed: (failed) => set({ isFailed: failed }),
  isTrapReleased: false,
  setIsTrapReleased: (released) => set({ isTrapReleased: released }),
  showOnomatopoeia: false,
  setShowOnomatopoeia: (show) => set({ showOnomatopoeia: show }),

  // Boulder & Carrying State
  bouldersLeft: 7,
  setBouldersLeft: (val) =>
    set((state) => ({
      bouldersLeft: typeof val === 'function' ? val(state.bouldersLeft) : val,
    })),
  decrementBoulder: () => set((state) => ({ bouldersLeft: Math.max(0, state.bouldersLeft - 1) })),
  carryingStone: false,
  isCarryingStone: false,
  setCarryingStone: (carrying) =>
    set({
      carryingStone: carrying,
      isCarryingStone: carrying,
      ...(carrying ? {} : { isChuteArmed: false }),
    }),
  isChuteArmed: false,
  setIsChuteArmed: (armed) => set({ isChuteArmed: armed }),
  stonesInPile: 7,
  setStonesInPile: (val) =>
    set((state) => ({
      stonesInPile: typeof val === 'function' ? val(state.stonesInPile) : val,
    })),

  currentWave: 1,
  totalWaves: 5,
  setCurrentWave: (val) =>
    set((state) => ({
      currentWave: typeof val === 'function' ? val(state.currentWave) : val,
    })),
  nextWave: () =>
    set((state) => ({
      currentWave: Math.min(state.totalWaves, state.currentWave + 1),
    })),
  gameState: 'READY',
  setGameState: (gState) => set({ gameState: gState }),
  bannerText: '',
  setBannerText: (text) => set({ bannerText: text, ambushMessage: text }),
  ambushMessage: '',
  setAmbushMessage: (msg) => set({ ambushMessage: msg, bannerText: msg }),
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  waveTimer: 60,
  setWaveTimer: (val) =>
    set((state) => ({
      waveTimer: typeof val === 'function' ? val(state.waveTimer) : val,
    })),
  screenShake: false,
  screenShakeIntensity: 0.15,
  setScreenShake: (shake, intensity = 0.15) =>
    set({ screenShake: shake, screenShakeIntensity: intensity }),
  resetGame: () =>
    set({
      introPhase: 'DONE',
      isBriefingOpen: false,
      isSpotted: false,
      detectionLevel: 0,
      isSentryNeutralized: false,
      vanguardNeutralized: false,
      isCameraPanning: false,
      showDhoomEffect: false,
      missionSuccess: false,
      isFailed: false,
      isTrapReleased: false,
      showOnomatopoeia: false,
      bouldersLeft: 7,
      carryingStone: false,
      isCarryingStone: false,
      isChuteArmed: false,
      stonesInPile: 7,
      currentWave: 1,
      totalWaves: 5,
      gameState: 'PLAYING',
      bannerText: '',
      ambushMessage: '',
      screenShake: false,
      waveTimer: 60,
      playerPosition: new THREE.Vector3(-1.8, 9.1, 1.2),
      sentryPosition: new THREE.Vector3(30, 0.2, 15.0),
    }),
}));
