import { useEffect, useState, useCallback } from 'react';

interface GameIntroProps {
  onComplete: () => void;
}

export default function GameIntro({ onComplete }: GameIntroProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleFinish = useCallback(() => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 600);
  }, [isFadingOut, onComplete]);

  useEffect(() => {
    // Auto complete sequence after 5.2 seconds
    const timer = setTimeout(() => {
      handleFinish();
    }, 5200);

    // Allow Space, Enter, Escape, or 'E' key to skip intro
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Enter' ||
        e.key === ' ' ||
        e.key === 'Escape' ||
        e.key.toLowerCase() === 'e'
      ) {
        handleFinish();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleFinish]);

  return (
    <div
      className={`intro-overlay ${isFadingOut ? 'intro-fade-out' : ''}`}
      onClick={handleFinish}
    >
      {/* Background Cinematic Hero Image with Slow Parallax Zoom */}
      <div className="intro-image-wrapper">
        <img
          src="/models/shivaji.jpg"
          alt="Chhatrapati Shivaji Maharaj"
          className="intro-hero-img"
        />
        {/* Dark Film Grain & Atmosphere Overlays */}
        <div className="intro-grain-overlay" />
        <div className="intro-vignette-overlay" />
        <div className="intro-warm-overlay" />
      </div>

      {/* Historical Cinematic Typography */}
      <div className="intro-typography-box">
        <div className="intro-year-badge">1661 CE • SAHYADRI DEFILE</div>
        <h1 className="intro-main-title">GANIMI KAVA</h1>
        <div className="intro-subtitle-divider">
          <span className="intro-gold-line" />
          <h2 className="intro-subtitle">OPERATION UMBERKHIND</h2>
          <span className="intro-gold-line" />
        </div>
      </div>

      {/* Skip Hint */}
      <div className="intro-skip-hint">
        <span>PRESS ENTER OR CLICK TO START ➔</span>
      </div>
    </div>
  );
}
