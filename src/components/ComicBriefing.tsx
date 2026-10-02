import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Flame, Shield, Compass, ArrowRight, Target, Mountain, Crosshair } from 'lucide-react';

/**
 * Historical Tactical Mission Briefing — Sahyadri Field Dispatch 1661 CE
 */
export default function ComicBriefing() {
  const isBriefingOpen = useGameStore((state) => state.isBriefingOpen);
  const setIsBriefingOpen = useGameStore((state) => state.setIsBriefingOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBriefingOpen && (e.key === 'Enter' || e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        setIsBriefingOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBriefingOpen, setIsBriefingOpen]);

  if (!isBriefingOpen) return null;

  return (
    <div className="dispatch-backdrop">
      {/* Basalt Slate Outer Panel (#111417) */}
      <div className="basalt-panel">
        {/* Weathered Parchment Inner Container (#f4efe2) */}
        <div className="parchment-container">
          {/* Authentic Maratha Military Seal Stamp (Rotated 12° stamp, NO OM) */}
          <div className="rajmudra-seal">
            <div className="seal-ring">
              <span className="seal-text-top">प्रतिपच्चंद्रलेखेव</span>
              <span className="seal-center-text">शिवस्यैषा मुद्रा</span>
              <span className="seal-text-bot">वर्धिष्णुर्विश्ववंदिता</span>
            </div>
          </div>

          {/* 1. TOP HEADER */}
          <header className="dispatch-header">
            <div className="dispatch-tag-row">
              <span className="dispatch-badge">
                <Flame size={13} />
                <span>SAHYADRI FIELD DISPATCH • 1661 CE</span>
              </span>
              <span className="location-tag">UMBERKHIND PASS</span>
            </div>
            <h1 className="dispatch-title">AMBUSH AT UMBERKHIND</h1>
          </header>

          {/* 2. MISSION SITUATION */}
          <section className="briefing-section situation-section">
            <h3 className="section-label">
              <Compass size={14} />
              <span>MISSION SITUATION</span>
            </h3>
            <p className="situation-text">
              The Mughal vanguard is entering the narrow Umberkhind pass. Use the surrounding terrain to your advantage and prepare the ambush.
            </p>
          </section>

          {/* 3. INTELLIGENCE (Compact Info Cards) */}
          <section className="briefing-section intel-section">
            <h3 className="section-label">
              <Shield size={14} />
              <span>INTELLIGENCE</span>
            </h3>
            <div className="intel-cards-grid">
              <div className="intel-card">
                <div className="intel-card-header">
                  <Target size={14} className="intel-icon target-icon" />
                  <span className="intel-title">TARGET</span>
                </div>
                <div className="intel-value">Mughal Vanguard</div>
              </div>

              <div className="intel-card">
                <div className="intel-card-header">
                  <Mountain size={14} className="intel-icon terrain-icon" />
                  <span className="intel-title">TERRAIN</span>
                </div>
                <div className="intel-value">Narrow mountain pass</div>
              </div>

              <div className="intel-card">
                <div className="intel-card-header">
                  <Crosshair size={14} className="intel-icon tactic-icon" />
                  <span className="intel-title">TACTIC</span>
                </div>
                <div className="intel-value">Use elevation and falling boulders</div>
              </div>
            </div>
          </section>

          {/* 4. TACTICAL OBJECTIVE (Most Visually Prominent Instruction) */}
          <section className="briefing-section objective-section">
            <h3 className="section-label objective-label">
              <Target size={15} />
              <span>TACTICAL OBJECTIVE</span>
            </h3>
            <div className="objective-hero-box">
              <div className="objective-headline">USE THE TERRAIN.</div>
              <div className="objective-subline">
                TRIGGER THE ROCKSLIDE WHEN THE VANGUARD ENTERS THE CHOKE POINT.
              </div>
            </div>
          </section>

          {/* 5. GAMEPLAY FLOW (Simple Horizontal Sequence) */}
          <section className="briefing-section flow-section">
            <h3 className="section-label">
              <span>GAMEPLAY FLOW</span>
            </h3>
            <div className="flow-sequence">
              <div className="flow-step">
                <span className="step-num">01</span>
                <span className="step-text">DEPLOY SCOUT</span>
              </div>
              <span className="flow-arrow">➔</span>

              <div className="flow-step">
                <span className="step-num">02</span>
                <span className="step-text">COLLECT BOULDER</span>
              </div>
              <span className="flow-arrow">➔</span>

              <div className="flow-step">
                <span className="step-num">03</span>
                <span className="step-text">RETURN TO THROW POINT</span>
              </div>
              <span className="flow-arrow">➔</span>

              <div className="flow-step">
                <span className="step-num">04</span>
                <span className="step-text">WAIT FOR VANGUARD</span>
              </div>
              <span className="flow-arrow">➔</span>

              <div className="flow-step highlight-step">
                <span className="step-num">05</span>
                <span className="step-text">TRIGGER AMBUSH</span>
              </div>
            </div>
          </section>

          {/* 6. BOTTOM ACTION (Primary CTA) */}
          <div className="dispatch-footer">
            <button
              className="dispatch-launch-btn"
              onClick={() => setIsBriefingOpen(false)}
            >
              <span>DEPLOY SCOUT</span>
              <ArrowRight size={18} />
            </button>
            <span className="key-shortcut-hint">ENTER / NEXT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
