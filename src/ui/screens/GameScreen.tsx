import { useEffect, useState } from 'react';
import { engine } from '../../engine/singleton';
import { formatInt } from '../../engine/format';
import { getTimeDescription } from '../../engine/format';
import { useSnapshot } from '../hooks';
import ClockScene from '../ClockScene';
import { EnergyPanel, EventBanner, HeatPanel, PrecisionPanel, StatsPanel, TutorialBanner } from '../HUD';
import { RewindButton, RewindHint, SkillcheckBar, WindButton } from '../Controls';
import UpgradeShop from '../Shop';
import AchievementsPanel from '../AchievementsPanel';
import { IconMenu, IconSpeaker } from '../icons';

export default function GameScreen() {
  const snap = useSnapshot(engine);
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    const onClick = () => engine.globalClickAttempt();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        engine.startRewind();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') engine.stopRewind();
    };
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault();
        engine.startRewind();
      }
    };
    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 2) engine.stopRewind();
    };
    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('contextmenu', onContextMenu);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('contextmenu', onContextMenu);
      engine.stopRewind();
    };
  }, []);

  return (
    <div className="game-screen">
      <header className="top-bar">
        <h1 className="game-title">The Last Clockwinder</h1>
        <div className="top-bar-info">
          <div className="time-description">{getTimeDescription(Math.max(0, snap.gameTimeSeconds))}</div>
          <div className="score-display">
            Score: <span>{formatInt(snap.score)}</span>
          </div>
        </div>
        <button className="icon-button" onClick={() => setShowAchievements(true)} title="Achievements">
          <IconMenu />
        </button>
        <button
          className="icon-button"
          onClick={() => engine.toggleMute()}
          title={snap.settings.muted ? 'Unmute' : 'Mute'}
        >
          <IconSpeaker muted={snap.settings.muted} />
        </button>
      </header>

      <TutorialBanner />
      <EventBanner />

      <main className="stage">
        <div className="stage-left">
          <HeatPanel />
          <PrecisionPanel />
        </div>

        <ClockScene />

        <div className="stage-right">
          <div className="action-dock">
            <WindButton />
            <SkillcheckBar />
            <RewindButton />
            <RewindHint />
            <EnergyPanel />
          </div>
        </div>
      </main>

      <section className="lower-panel">
        <StatsPanel />
        <UpgradeShop />
      </section>

      {showAchievements && <AchievementsPanel onClose={() => setShowAchievements(false)} />}
    </div>
  );
}
