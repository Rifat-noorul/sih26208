import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { translations } from '../utils/i18n';
import { MapPin } from 'lucide-react';

/**
 * Compact Military Tactical Minimap
 * 2D Fixed North-Oriented Radar Card
 */
export default function Minimap() {
  const playerPosition = useGameStore((state) => state.playerPosition);
  const language = useGameStore((state) => state.language);
  const t = translations[language] || translations.en;

  const [vanguardX, setVanguardX] = useState(25);

  useEffect(() => {
    const interval = setInterval(() => {
      const vPos = (window as any).__vanguardRef?.current?.position?.x;
      if (typeof vPos === 'number') {
        setVanguardX(vPos);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Map world coordinates (-25 to +25) to minimap canvas (0 to 140)
  const mapX = (worldX: number) => Math.max(8, Math.min(132, ((worldX + 25) / 50) * 124 + 8));
  const mapY = (worldZ: number) => Math.max(8, Math.min(112, ((worldZ + 25) / 50) * 104 + 8));

  const scoutPx = mapX(playerPosition.x);
  const scoutPy = mapY(playerPosition.z);

  const stonePx = mapX(-6.0);
  const stonePy = mapY(1.2);

  const throwPx = mapX(0.0);
  const throwPy = mapY(1.2);

  const ambushPx = mapX(0.0);
  const ambushPy = mapY(6.8);

  const vanguardPx = mapX(vanguardX);
  const vanguardPy = mapY(6.8);

  const fortPx = mapX(5.0);
  const fortPy = mapY(-20.0);

  return (
    <div className="minimap-container">
      <div className="minimap-header">
        <div className="minimap-title-flex">
          <MapPin size={11} className="text-amber-500" />
          <span>{t.minimapTitle}</span>
        </div>
        <span className="north-indicator">N ▲</span>
      </div>

      <div className="minimap-canvas">
        <svg width="100%" height="100%" viewBox="0 0 140 120">
          <defs>
            <pattern id="radarGrid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(217, 119, 6, 0.12)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#radarGrid)" />

          {/* Sahyadri Rampart Line */}
          <line x1="8" y1={mapY(1.2)} x2="132" y2={mapY(1.2)} stroke="#d97706" strokeDasharray="2,2" strokeWidth="1" opacity="0.4" />

          {/* Valley Road Trail */}
          <line x1="8" y1={mapY(6.8)} x2="132" y2={mapY(6.8)} stroke="#ef4444" strokeDasharray="2,2" strokeWidth="1" opacity="0.3" />

          {/* 🏰 Fort */}
          <g transform={`translate(${fortPx - 7}, ${fortPy - 6})`}>
            <rect width="14" height="10" fill="#78350f" stroke="#d97706" strokeWidth="1" rx="1.5" opacity="0.8" />
            <text x="7" y="8" fontSize="6.5" fill="#fbbf24" textAnchor="middle" fontWeight="bold">🏰</text>
          </g>

          {/* ⭕ Ambush Zone */}
          <circle cx={ambushPx} cy={ambushPy} r="12" fill="rgba(239, 68, 68, 0.12)" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />

          {/* 🎯 Throw Point */}
          <circle cx={throwPx} cy={throwPy} r="4" fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" strokeWidth="1.2" />
          <circle cx={throwPx} cy={throwPy} r="1" fill="#fbbf24" />

          {/* 🪨 Stone Supply */}
          <g transform={`translate(${stonePx}, ${stonePy})`}>
            <circle r="3.5" fill="#d97706" />
            <text x="0" y="2.5" fontSize="5" fill="#ffffff" textAnchor="middle" fontWeight="bold">🪨</text>
          </g>

          {/* 🔴 Vanguard */}
          <g transform={`translate(${vanguardPx}, ${vanguardPy})`}>
            <circle r="5" fill="#dc2626" opacity="0.9" />
            <circle r="8" fill="none" stroke="#ef4444" strokeWidth="1">
              <animate attributeName="r" values="5;9;5" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <text x="0" y="2.5" fontSize="5" fill="#ffffff" textAnchor="middle">🔴</text>
          </g>

          {/* 🟢 Scout */}
          <g transform={`translate(${scoutPx}, ${scoutPy})`}>
            <circle r="4" fill="#10b981" />
            <circle r="7" fill="none" stroke="#34d399" strokeWidth="1.2" />
          </g>
        </svg>

        <div className="minimap-legend">
          <span className="legend-item"><span className="dot dot-scout"></span> {t.scoutLabel}</span>
          <span className="legend-item"><span className="dot dot-vanguard"></span> {t.vanguardLabel}</span>
        </div>
      </div>
    </div>
  );
}
