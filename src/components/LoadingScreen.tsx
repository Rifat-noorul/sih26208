import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { Flame } from 'lucide-react';

interface LoadingScreenProps {
  onLoaded?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoaded }) => {
  const { active, progress, item } = useProgress();
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setDisplayedProgress((prev) => Math.max(prev, Math.round(progress)));
  }, [progress]);

  useEffect(() => {
    if (!active && progress >= 100) {
      const timer = setTimeout(() => {
        setIsFinished(true);
        if (onLoaded) onLoaded();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [active, progress, onLoaded]);

  if (isFinished && progress >= 100 && !active) return null;

  const getStatusText = () => {
    if (displayedProgress < 25) return 'Loading mountain terrain...';
    if (displayedProgress < 55) return 'Loading Sahyadri fortifications...';
    if (displayedProgress < 85) return 'Preparing tactical units...';
    return 'Finalizing battlefield environment...';
  };

  return (
    <div className={`ganimi-loading-screen ${progress >= 100 && !active ? 'fade-out' : ''}`}>
      <div className="loading-content-box">
        <div className="loading-badge">
          <Flame size={14} className="flame-icon" />
          <span>SAHYADRI TACTICAL DISPATCH</span>
        </div>

        <h1 className="loading-title">GANIMI KAVA</h1>
        <h2 className="loading-subtitle">AMBUSH AT UMBERKHIND</h2>

        <div className="loading-status-box">
          <div className="status-label">{getStatusText()}</div>
          {item && <div className="asset-detail">{item.split('/').pop()}</div>}
        </div>

        {/* Progress Bar Track */}
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(100, Math.max(6, displayedProgress))}%` }}
          />
        </div>

        <div className="progress-percentage-row">
          <span className="loading-prep-text">PREPARING BATTLEFIELD...</span>
          <span className="percentage-number">{displayedProgress}%</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
