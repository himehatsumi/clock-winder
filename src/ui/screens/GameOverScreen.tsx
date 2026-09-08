import { engine } from '../../engine/singleton';
import { formatDuration, formatInt } from '../../engine/format';
import { useSnapshot } from '../hooks';
import LegacyPanel from '../LegacyPanel';

export default function GameOverScreen() {
  const snap = useSnapshot(engine);
  const isNewBestScore = snap.score >= snap.best.score;

  return (
    <div className="gameover-screen">
      <div className="gameover-card">
        <h2>The Mechanism Falls Silent</h2>
        <p className="gameover-subtitle">Midnight consumes all.</p>
        <div className="gameover-stats">
          <div className="gameover-stat">
            <span className="gameover-stat-label">Final Score</span>
            <span className="gameover-stat-value">
              {formatInt(snap.score)}
              {isNewBestScore && <span className="gameover-new-best">New Best!</span>}
            </span>
          </div>
          <div className="gameover-stat">
            <span className="gameover-stat-label">Time Survived</span>
            <span className="gameover-stat-value">{formatDuration(snap.best.survivalSeconds)}</span>
          </div>
          <div className="gameover-stat">
            <span className="gameover-stat-label">Temporal Cores Earned</span>
            <span className="gameover-stat-value gameover-cores">+{formatInt(snap.lastRunCoresEarned)}</span>
          </div>
        </div>

        <div className="intro-actions">
          <button className="primary-button" onClick={() => engine.startNewRun(true)}>
            Wind Again
          </button>
        </div>
      </div>

      <div className="gameover-legacy">
        <LegacyPanel />
      </div>
    </div>
  );
}
