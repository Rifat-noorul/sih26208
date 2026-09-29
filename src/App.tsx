import { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import GanimiHUD from './components/GanimiHUD';
import ComicBriefing from './components/ComicBriefing';
import GameIntro from './components/GameIntro';
import ComicIntro from './components/ComicIntro';
import { useGameStore } from './store/gameStore';
import './App.css';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const isSpotted = useGameStore((state) => state.isSpotted);
  const isSentryNeutralized = useGameStore((state) => state.isSentryNeutralized);

  return (
    <div className={`app-container ${isSpotted && !isSentryNeutralized ? 'spotted-alarm' : ''}`}>
      {/* Historical Cinematic Entrance Screen */}
      {showIntro && (
        <GameIntro onComplete={() => setShowIntro(false)} />
      )}

      {/* 3D R3F Toon Environment */}
      <GameCanvas />

      {/* Amar Chitra Katha Multi-Page Comic Storytelling & Focus Overlay */}
      <ComicIntro />

      {/* Amar Chitra Katha Graphic Novel Briefing System */}
      <ComicBriefing />

      {/* Ganimi Tactical HUD 2D Overlay & Modals */}
      <GanimiHUD />
    </div>
  );
}
