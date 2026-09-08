import { useState } from 'react';
import { engine } from '../../engine/singleton';
import { formatDuration, formatInt } from '../../engine/format';
import { useSnapshot } from '../hooks';
import LegacyPanel from '../LegacyPanel';
import AchievementsPanel from '../AchievementsPanel';
import HowToPlay from '../HowToPlay';

export default function IntroScreen() {
  const snap = useSnapshot(engine);
  const [showLegacy, setShowLegacy] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  return (
    <div className="intro-screen">
      <div className="intro-card">
        <h1>The Last Clockwinder</h1>
        <p className="intro-lore">
          The Great Clock nears midnight. As its final keeper, fight the relentless march of time — for as long as
          you can.
        </p>
        <HowToPlay />

        {(snap.best.score > 0 || snap.legacy.cores > 0 || snap.legacy.levels.startComponents > 0) && (
          <div className="intro-stats-row">
            <div>
              Best Score: <strong>{formatInt(snap.best.score)}</strong>
            </div>
            <div>
              Best Survival: <strong>{formatDuration(snap.best.survivalSeconds)}</strong>
            </div>
            <div>
              Temporal Cores: <strong>{formatInt(snap.legacy.cores)}</strong>
            </div>
          </div>
        )}

        <div className="intro-actions">
          {snap.hasSavedRun && (
            <button className="primary-button" onClick={() => engine.resumeRun()}>
              Continue Run
            </button>
          )}
          <button className="primary-button" onClick={() => engine.startNewRun(false)}>
            {snap.hasSavedRun ? 'New Run' : 'Begin'}
          </button>
          <button className="secondary-button" onClick={() => engine.startNewRun(true)}>
            Skip Onboarding
          </button>
        </div>
        {!snap.hasSavedRun && <p className="intro-hint">New here? Begin walks you through everything, step by step.</p>}

        <div className="intro-links">
          <button className="link-button" onClick={() => setShowLegacy(true)}>
            Temporal Legacy
          </button>
          <button className="link-button" onClick={() => setShowAchievements(true)}>
            Achievements
          </button>
        </div>
      </div>

      {showLegacy && (
        <div className="modal-backdrop" onClick={() => setShowLegacy(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Temporal Legacy</h2>
              <button className="modal-close" onClick={() => setShowLegacy(false)} aria-label="Close">
                ×
              </button>
            </div>
            <LegacyPanel />
          </div>
        </div>
      )}
      {showAchievements && <AchievementsPanel onClose={() => setShowAchievements(false)} />}
    </div>
  );
}
