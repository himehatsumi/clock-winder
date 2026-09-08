import { engine } from '../engine/singleton';
import { useSnapshot } from './hooks';

export function HeatPanel() {
  const snap = useSnapshot(engine);
  const pct = snap.heat.max > 0 ? (snap.heat.current / snap.heat.max) * 100 : 0;
  const status = snap.heat.isOverheating ? 'Overheating!' : snap.heat.isHighHeat ? 'High Heat!' : 'Stable';
  const statusClass = snap.heat.isOverheating ? 'is-critical' : snap.heat.isHighHeat ? 'is-warning' : 'is-ok';
  return (
    <div className="gauge-panel heat-panel">
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
  return (
    <div className="gauge-panel precision-panel">
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
      <div className="stats-row">
        <span>Auto-Winder</span>
        <strong>{snap.stats.autoWindPower.toFixed(3)}s/s</strong>
      </div>
      <div className="stats-row">
        <span>Cooling Rate</span>
        <strong>{snap.stats.coolingRate.toFixed(1)}°/s</strong>
      </div>
      <div className="stats-row">
        <span>Precision Decay</span>
        <strong>{snap.stats.precisionDecayStat.toFixed(3)}%/s</strong>
      </div>
    </div>
  );
}

export function EventBanner() {
  const snap = useSnapshot(engine);
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
  0: "Keep the clock from reaching midnight! Click 'Initiate Winding' to gain time.",
  1: 'Winding gains time but adds Heat. Keep Heat low!',
  2: "Winding also yields Components. Spend them in the Workshop below — try 'Reinforced Spring'.",
  3: 'Click falling GEARS for bonuses. Manage Heat with REWIND (Space or Right-Click) — it costs Energy.',
  4: 'PRECISION affects performance and decays over time. High Heat worsens decay!',
};

export function TutorialBanner() {
  const snap = useSnapshot(engine);
  const message = TUTORIAL_MESSAGES[snap.tutorialStage];
  if (!message || snap.tutorialStage >= 5) return null;
  return <div className="tutorial-banner">{message}</div>;
}
