import { useEffect, useCallback } from 'react';
import { useGameStore, type IntroPhase } from '../store/gameStore';
import { Flame, Shield, Compass, Scroll, ChevronRight } from 'lucide-react';

const PHASES: IntroPhase[] = [
  'STORY_PAGE_1',
  'STORY_PAGE_2',
  'SCOUT_FOCUS',
  'ENEMY_FOCUS',
  'MISSION_DISPATCH',
  'DONE',
];

export default function ComicIntro() {
  const introPhase = useGameStore((state) => state.introPhase);
  const setIntroPhase = useGameStore((state) => state.setIntroPhase);
  const setIsBriefingOpen = useGameStore((state) => state.setIsBriefingOpen);

  const advancePhase = useCallback(() => {
    const currentIndex = PHASES.indexOf(introPhase);
    if (currentIndex >= 0 && currentIndex < PHASES.length - 1) {
      const next = PHASES[currentIndex + 1];
      setIntroPhase(next);
      if (next === 'DONE') {
        setIsBriefingOpen(false);
      }
    }
  }, [introPhase, setIntroPhase, setIsBriefingOpen]);

  useEffect(() => {
    if (introPhase === 'DONE') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Enter' ||
        e.key === ' ' ||
        e.key === 'Escape' ||
        e.key.toLowerCase() === 'e'
      ) {
        advancePhase();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [introPhase, advancePhase]);

  if (introPhase === 'DONE') return null;

  const slide = introPhase === 'STORY_PAGE_1' ? 0 : introPhase === 'STORY_PAGE_2' ? 1 : -1;

  return (
    <div className="comic-intro-overlay" onClick={advancePhase}>
      {/* PAGE 1: KARTALAB KHAN'S INVASION */}
      {introPhase === 'STORY_PAGE_1' && (
        <div
          className="comic-page-panel"
          style={{
            backgroundImage: `url(${slide === 0 ? '/models/bg1.jpg' : '/models/bg2.jpg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="comic-image-container">
            <img
              src="/models/bg1.jpg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/models/shivaji.jpg';
              }}
              alt="Kartalab Khan's Imperial Army"
              className="comic-panel-img"
            />
            <div className="comic-vignette" />
          </div>

          <div className="comic-caption-box top-left">
            <span className="caption-badge">JANUARY 1661 CE</span>
            <p>
              Kartalab Khan commands a 20,000-strong imperial army, marching into the treacherous Sahyadri mountain pass...
            </p>
          </div>

          <div className="comic-caption-box bottom-right">
            <p>
              Their objective: Crush Swarajya. But to reach Konkan, they must enter the narrow <strong>Umberkhind Defile</strong>.
            </p>
            <span className="advance-hint">CLICK OR PRESS ENTER TO CONTINUE ➔</span>
          </div>
        </div>
      )}

      {/* PAGE 2: THE GANIMI KAVA TRAP */}
      {introPhase === 'STORY_PAGE_2' && (
        <div
          className="comic-page-panel"
          style={{
            backgroundImage: `url(${slide === 0 ? '/models/bg1.jpg' : '/models/bg2.jpg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="comic-image-container">
            <img
              src="/models/bg2.jpg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/models/shivaji.jpg';
              }}
              alt="The Ganimi Kava Trap"
              className="comic-panel-img"
            />
            <div className="comic-vignette" />
          </div>

          <div className="comic-caption-box top-right">
            <span className="caption-badge">GANIMI KAVA STRATAGEM</span>
            <p>
              Chhatrapati Shivaji Maharaj lures the entire 20,000 army into an 8-pace canyon where heavy cavalry and cannons are useless!
            </p>
          </div>

          <div className="comic-caption-box bottom-left">
            <p>
              High above on the basalt ramparts, Maratha scouts hold kinetic rockslide chutes...
            </p>
            <span className="advance-hint">CLICK OR PRESS ENTER TO CONTINUE ➔</span>
          </div>
        </div>
      )}

      {/* PAGE 3: 3D SCOUT FOCUS BANNER */}
      {introPhase === 'SCOUT_FOCUS' && (
        <div className="cinematic-focus-overlay">
          <div className="cinematic-letterbox-top" />
          <div className="cinematic-letterbox-bottom">
            <div className="exposition-banner banner-scout">
              <span className="banner-icon">🎯</span>
              <div className="banner-text">
                <h3>SCOUT RIDGE POSITION</h3>
                <p>High rampart above Umberkhind pass. Kinetic rockslide chute is armed and ready.</p>
              </div>
              <span className="banner-advance">NEXT ➔</span>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 4: 3D ENEMY FOCUS BANNER */}
      {introPhase === 'ENEMY_FOCUS' && (
        <div className="cinematic-focus-overlay">
          <div className="cinematic-letterbox-top" />
          <div className="cinematic-letterbox-bottom">
            <div className="exposition-banner banner-enemy">
              <span className="banner-icon">⚔️</span>
              <div className="banner-text">
                <h3>IMPERIAL VANGUARD CONVOY</h3>
                <p>20,000 troops marching into the narrow 8-pace defile. Prepare kinetic release.</p>
              </div>
              <span className="banner-advance">NEXT ➔</span>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 5: SAHYADRI FIELD DISPATCH MISSION CARD */}
      {introPhase === 'MISSION_DISPATCH' && (
        <div className="dispatch-backdrop">
          <div className="basalt-panel">
            <div className="parchment-container">
              <div className="rajmudra-seal">
                <div className="seal-ring">
                  <span className="seal-text-top">प्रतिपच्चंद्रलेखेव</span>
                  <span className="seal-center-symbol">ॐ</span>
                  <span className="seal-text-bot">शाहसूनोः शिवस्यैषा</span>
                </div>
              </div>

              <header className="dispatch-header">
                <div className="dispatch-tag-row">
                  <span className="dispatch-badge">
                    <Flame size={14} />
                    <span>SAHYADRI FIELD DISPATCH • 1661 CE</span>
                  </span>
                  <span className="location-tag">UMBERKHIND PASS</span>
                </div>
                <h1 className="dispatch-title">GANIMI KAVA — AMBUSH THE VANGUARD</h1>
              </header>

              <div className="topo-panel">
                <div className="topo-map-visual">
                  <svg className="topo-svg" viewBox="0 0 600 120" preserveAspectRatio="none">
                    <path d="M0,20 Q150,5 300,30 T600,10" fill="none" stroke="#78350f" strokeWidth="1.5" strokeDasharray="4 2" />
                    <path d="M0,45 Q200,25 400,55 T600,35" fill="none" stroke="#78350f" strokeWidth="1.2" opacity="0.6" />
                    <path d="M0,100 Q180,115 350,95 T600,110" fill="none" stroke="#78350f" strokeWidth="1.5" strokeDasharray="4 2" />
                    <text x="20" y="25" fill="#78350f" fontSize="10" fontWeight="bold">HIGH RIDGE (y = 12m)</text>
                    <text x="20" y="105" fill="#78350f" fontSize="10" fontWeight="bold">BASALT WALLS</text>
                    <path d="M30,70 L550,70" fill="none" stroke="#dc2626" strokeWidth="3" strokeDasharray="8 6" />
                    <polygon points="545,64 560,70 545,76" fill="#dc2626" />
                    <text x="240" y="62" fill="#b91c1c" fontSize="11" fontWeight="bold" letterSpacing="1">VANGUARD MARCH VECTOR (5 WAVES)</text>
                  </svg>

                  <div className="chokepoint-marker">
                    <Compass size={14} className="compass-icon" />
                    <span>ROCKSLIDE CHOKE-POINT</span>
                  </div>
                </div>

                <div className="topo-caption">
                  <span>TACTICAL DIRECTIVE:</span> Wipe out 5 Imperial Vanguard waves using 7 shared boulders.
                </div>
              </div>

              <div className="split-directives-row">
                <div className="directive-slice slice-intel">
                  <div className="slice-header">
                    <Scroll size={14} />
                    <span>HARKARA INTEL DISPATCH</span>
                  </div>
                  <p className="modi-text">
                    “Bahirji reports: Narrow defile width: 8 paces. Heavy artillery cannot turn. <strong>Perfect point for Ganimi Kava.</strong>”
                  </p>
                </div>

                <div className="directive-slice slice-doctrine">
                  <div className="slice-header doctrine-header">
                    <Shield size={14} />
                    <span>TACTICAL DOCTRINE</span>
                  </div>
                  <div className="doctrine-body">
                    <h4>NO DIRECT MELEE</h4>
                    <p>
                      Trigger boulder chute <kbd>[E]</kbd> when troops enter the strike zone. <strong>Use gravity, not steel.</strong>
                    </p>
                  </div>
                </div>
              </div>

              <button
                className="dispatch-launch-btn"
                onClick={() => {
                  setIntroPhase('DONE');
                  setIsBriefingOpen(false);
                }}
              >
                <span>DEPLOY SCOUT TO RIDGE [ ENTER ] ➔</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
