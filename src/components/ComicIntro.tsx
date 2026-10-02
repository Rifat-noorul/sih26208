import { useEffect, useCallback } from 'react';
import { useGameStore, type IntroPhase } from '../store/gameStore';
import { Flame, Shield, Compass, ChevronRight } from 'lucide-react';

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
        <div className="dispatch-backdrop" onClick={(e) => e.stopPropagation()}>
          <div className="basalt-panel">
            <div className="parchment-container">
              <div className="rajmudra-seal">
                <div className="seal-ring">
                  <span className="seal-text-top">प्रतिपच्चंद्रलेखेव</span>
                  <span className="seal-center-text">शिवस्यैषा मुद्रा</span>
                  <span className="seal-text-bot">वर्धिष्णुर्विश्ववंदिता</span>
                </div>
              </div>

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

              <section className="briefing-section situation-section">
                <h3 className="section-label">
                  <Compass size={14} />
                  <span>MISSION SITUATION</span>
                </h3>
                <p className="situation-text">
                  The Mughal vanguard is entering the narrow Umberkhind pass. Use the surrounding terrain to your advantage and prepare the ambush.
                </p>
              </section>

              <section className="briefing-section intel-section">
                <h3 className="section-label">
                  <Shield size={14} />
                  <span>INTELLIGENCE</span>
                </h3>
                <div className="intel-cards-grid">
                  <div className="intel-card">
                    <div className="intel-card-header">
                      <span className="intel-title">TARGET</span>
                    </div>
                    <div className="intel-value">Mughal Vanguard</div>
                  </div>
                  <div className="intel-card">
                    <div className="intel-card-header">
                      <span className="intel-title">TERRAIN</span>
                    </div>
                    <div className="intel-value">Narrow mountain pass</div>
                  </div>
                  <div className="intel-card">
                    <div className="intel-card-header">
                      <span className="intel-title">TACTIC</span>
                    </div>
                    <div className="intel-value">Use elevation and falling boulders</div>
                  </div>
                </div>
              </section>

              <section className="briefing-section objective-section">
                <h3 className="section-label objective-label">
                  <span>TACTICAL OBJECTIVE</span>
                </h3>
                <div className="objective-hero-box">
                  <div className="objective-headline">USE THE TERRAIN.</div>
                  <div className="objective-subline">
                    TRIGGER THE ROCKSLIDE WHEN THE VANGUARD ENTERS THE CHOKE POINT.
                  </div>
                </div>
              </section>

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

              <div className="dispatch-footer">
                <button
                  className="dispatch-launch-btn"
                  onClick={() => {
                    setIntroPhase('DONE');
                    setIsBriefingOpen(false);
                  }}
                >
                  <span>DEPLOY SCOUT</span>
                  <ChevronRight size={18} />
                </button>
                <span className="key-shortcut-hint">ENTER / NEXT</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
