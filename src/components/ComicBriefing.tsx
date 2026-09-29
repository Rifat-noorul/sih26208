import { useGameStore } from '../store/gameStore';
import { Compass, Flame, Shield, Scroll } from 'lucide-react';

/**
 * 17th-Century Maratha Tactical Field Dispatch Briefing System (Inked Comic UI)
 * - Basalt Slate (#111417) & Weathered Parchment Scroll (#f4efe2) container
 * - Panel 1: Topographic Route Sketch with elevation contours, red march vectors & Vermilion Rajmudra Seal (12° rotated)
 * - Panel 2: Split Directives: Left Harkara Intel Dispatch (Modi Script style) & Right Tactical Doctrine (Ink Panel)
 * - Cinematic Launch Button: Deep Vermilion (#8b1e1e) & Gold Foil (#d97706) border 'DEPLOY SCOUT TO RIDGE [ ENTER ] ➔'
 */
export default function ComicBriefing() {
  const isBriefingOpen = useGameStore((state) => state.isBriefingOpen);
  const setIsBriefingOpen = useGameStore((state) => state.setIsBriefingOpen);

  if (!isBriefingOpen) return null;

  return (
    <div className="dispatch-backdrop">
      {/* Basalt Slate Outer Panel (#111417) */}
      <div className="basalt-panel">
        {/* Weathered Parchment Inner Container (#f4efe2) */}
        <div className="parchment-container">
          {/* Authentic Vermilion Seal Stamp (Rajmudra Circle rotated 12°) */}
          <div className="rajmudra-seal">
            <div className="seal-ring">
              <span className="seal-text-top">प्रतिपच्चंद्रलेखेव</span>
              <span className="seal-center-symbol">ॐ</span>
              <span className="seal-text-bot">शाहसूनोः शिवस्यैषा</span>
            </div>
          </div>

          {/* Dispatch Header */}
          <header className="dispatch-header">
            <div className="dispatch-tag-row">
              <span className="dispatch-badge">
                <Flame size={14} />
                <span>SAHYADRI FIELD DISPATCH • 1661 CE</span>
              </span>
              <span className="location-tag">UMBERKHIND PASS</span>
            </div>
            <h1 className="dispatch-title">AMBUSH THE VANGUARD</h1>
          </header>

          {/* PANEL 1: Topographic Route Sketch (Top) */}
          <div className="topo-panel">
            <div className="topo-map-visual">
              {/* SVG Inked Topographic Contour Curves & Dotted Red March Vectors */}
              <svg className="topo-svg" viewBox="0 0 600 120" preserveAspectRatio="none">
                {/* Elevation Contours */}
                <path d="M0,20 Q150,5 300,30 T600,10" fill="none" stroke="#78350f" strokeWidth="1.5" strokeDasharray="4 2" />
                <path d="M0,45 Q200,25 400,55 T600,35" fill="none" stroke="#78350f" strokeWidth="1.2" opacity="0.6" />
                <path d="M0,100 Q180,115 350,95 T600,110" fill="none" stroke="#78350f" strokeWidth="1.5" strokeDasharray="4 2" />

                {/* High Ridge Contour Labels */}
                <text x="20" y="25" fill="#78350f" fontSize="10" fontWeight="bold">HIGH RIDGE (y = 12m)</text>
                <text x="20" y="105" fill="#78350f" fontSize="10" fontWeight="bold">BASALT WALLS</text>

                {/* Red March Vectors showing 20,000-man imperial column */}
                <path d="M30,70 L550,70" fill="none" stroke="#dc2626" strokeWidth="3" strokeDasharray="8 6" />
                <polygon points="545,64 560,70 545,76" fill="#dc2626" />
                <text x="240" y="62" fill="#b91c1c" fontSize="11" fontWeight="bold" letterSpacing="1">VANGUARD MARCH VECTOR (20,000 TROOPS)</text>
              </svg>

              {/* Choke-point Target Marker */}
              <div className="chokepoint-marker">
                <Compass size={14} className="compass-icon" />
                <span>ROCKSLIDE CHOKE-POINT</span>
              </div>
            </div>

            <div className="topo-caption">
              <span>TOPOGRAPHIC SURVEY:</span> 20,000 imperial troops under Kartalab Khan are entering the 8-pace defile choke-point.
            </div>
          </div>

          {/* PANEL 2: Split Tactical Directives (Middle) */}
          <div className="split-directives-row">
            {/* Left Slice: The Intel Dispatch (Modi Script style Harkara letter) */}
            <div className="directive-slice slice-intel">
              <div className="slice-header">
                <Scroll size={14} />
                <span>HARKARA INTEL DISPATCH</span>
              </div>
              <p className="modi-text">
                “Bahirji reports: The Mughal vanguard is flanked by sheer basalt walls. Narrow defile width: 8 paces. Heavy artillery cannot turn. <strong>Perfect point for Ganimi Kava.</strong>”
              </p>
            </div>

            {/* Right Slice: Tactical Doctrine (High contrast dark ink panel) */}
            <div className="directive-slice slice-doctrine">
              <div className="slice-header doctrine-header">
                <Shield size={14} />
                <span>TACTICAL DOCTRINE</span>
              </div>
              <div className="doctrine-body">
                <h4>NO DIRECT MELEE</h4>
                <p>
                  Trigger the boulder chute <kbd>[E]</kbd> from high ground. <strong>Use gravity, not steel.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Cinematic Launch Button (Bottom) */}
          <button
            className="dispatch-launch-btn"
            onClick={() => setIsBriefingOpen(false)}
          >
            <span>DEPLOY SCOUT TO RIDGE [ ENTER ] ➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}
