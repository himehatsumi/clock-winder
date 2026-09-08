import { engine } from '../engine/singleton';
import { useSnapshot } from './hooks';

export function HeatPanel() {
  const snap = useSnapshot(engine);
  if (snap.tutorialStage < 1) return null;
  const pct = snap.heat.max > 0 ? (snap.heat.current / snap.heat.max) * 100 : 0;
  const status = snap.heat.isOverheating ? 'Overheating!' : snap.heat.isHighHeat ? 'High Heat!' : 'Stable';
  const statusClass = snap.heat.isOverheating ? 'is-critical' : snap.heat.isHighHeat ? 'is-warning' : 'is-ok';
  const spotlighted = snap.tutorialSpotlightTarget === 'heat-panel';
  return (
    <div className={`gauge-panel heat-panel${spotlighted ? ' tutorial-highlight' : ''}`}>
      <div className="gauge-label">
        Heat <span className="gauge-hint">(Rewind to cool)</span>
      </div>
      <div className="gauge-track">
        <div className="gauge-fill heat-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="gauge-value">
        {Math.floor(snap.heat.current)}° / {Math.floor(snap.heat.max)}°
      </div>
      <div className={`gauge-status ${statusClass}`}>{status}</div>
    </div>
  );
}

export function PrecisionPanel() {
  const snap = useSnapshot(engine);
  if (snap.tutorialStage < 4) return null;
  const spotlighted = snap.tutorialSpotlightTarget === 'precision-panel';
  return (
    <div className={`gauge-panel precision-panel${spotlighted ? ' tutorial-highlight' : ''}`}>
      <div className="gauge-label">Precision</div>
      <div className="gauge-track">
        <div className="gauge-fill precision-fill" style={{ width: `${snap.precision.current}%` }} />
      </div>
      <div className="gauge-value">{snap.precision.current.toFixed(1)}%</div>
      <div className="gauge-hint">Decays over time · affects winding power</div>
    </div>
  );
}

export function EnergyPanel() {
  const snap = useSnapshot(engine);
  if (!snap.rewind.canRewind) return null;
  const pct = snap.rewind.max > 0 ? (snap.rewind.current / snap.rewind.max) * 100 : 0;
  return (
    <div className="gauge-panel energy-panel">
      <div className="gauge-label">Rewind Energy</div>
      <div className="gauge-track">
        <div className="gauge-fill energy-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="gauge-value">
        {Math.floor(snap.rewind.current)} / {Math.floor(snap.rewind.max)} E
      </div>
    </div>
  );
}

export function StatsPanel() {
  const snap = useSnapshot(engine);
  if (snap.tutorialStage < 2) return null;
  return (
    <div className="stats-panel">
      <div className="stats-row">
        <span>Components</span>
        <strong>{Math.floor(snap.components)}</strong>
      </div>
      <div className="stats-row">
        <span>Winding Boost</span>
        <strong>{snap.stats.clickPower.toFixed(2)}s</strong>
      </div>
      {snap.tutorialStage >= 3 && (
        <>
          <div className="stats-row">
            <span>Auto-Winder</span>
            <strong>{snap.stats.autoWindPower.toFixed(3)}s/s</strong>
          </div>
          <div className="stats-row">
            <span>Cooling Rate</span>
            <strong>{snap.stats.coolingRate.toFixed(1)}°/s</strong>
          </div>
        </>
      )}
      {snap.tutorialStage >= 4 && (
        <div className="stats-row">
          <span>Precision Decay</span>
          <strong>{snap.stats.precisionDecayStat.toFixed(3)}%/s</strong>
        </div>
      )}
    </div>
  );
}

export function EventBanner() {
  const snap = useSnapshot(engine);
  if (snap.tutorialStage < 5) return null;
  if (!snap.event.current) {
    return <div className="event-banner is-empty">-- No Active Events --</div>;
  }
  const ev = snap.event.current;
  return (
    <div className={`event-banner is-${ev.type}`}>
      <strong>{ev.name}</strong> ({Math.ceil(snap.event.remaining)}s left)
      <div className="event-banner-explanation">{ev.explanation}</div>
    </div>
  );
}

const TUTORIAL_MESSAGES: Record<number, string> = {
  0: 'Press Initiate Winding, then press again when the marker lands in the bright zone.',
  1: 'Winding heats up the mechanism. Land a few more to see how fast it climbs.',
  2: 'Successful winds also earn Components. Buy Reinforced Spring in the Workshop below.',
  3: 'Click falling gears near the clock for bonus Components. Hold Rewind (or the on-screen button) to cool down.',
  4: "Precision affects your winding power and decays over time — faster if you're running hot.",
};

export function TutorialBanner() {
  const snap = useSnapshot(engine);
  const message = TUTORIAL_MESSAGES[snap.tutorialStage];
  if (!message || snap.tutorialStage >= 5) return null;
  return (
    <div className="tutorial-banner">
      <span className="tutorial-banner-step">Step {snap.tutorialStage + 1} of 5</span>
      <span className="tutorial-banner-text">{message}</span>
      <button className="tutorial-banner-next" onClick={() => engine.advanceTutorialManually()}>
        Got it →
      </button>
    </div>
  );
}
