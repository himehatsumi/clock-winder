import { useRef } from 'react';
import { engine } from '../engine/singleton';
import { useFrame, useSnapshot } from './hooks';

export function WindButton() {
  const snap = useSnapshot(engine);
  const disabled = snap.skillcheck.jammed;
  return (
    <button
      className={`wind-button${snap.skillcheck.active ? ' is-active-check' : ''}${snap.tutorialStage === 0 ? ' tutorial-highlight' : ''}`}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        engine.attemptWind();
      }}
    >
      {snap.skillcheck.active ? 'Click Again!' : 'Initiate Winding'}
      {snap.skillcheck.combo > 1 && <span className="wind-combo">×{snap.skillcheck.combo}</span>}
    </button>
  );
}

export function SkillcheckBar() {
  const snap = useSnapshot(engine);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useFrame(engine, (frame) => {
    if (indicatorRef.current) {
      indicatorRef.current.style.left = `${frame.indicatorPercent}%`;
    }
  });

  if (!snap.skillcheck.active) return <div className="skillcheck-bar-slot" />;

  return (
    <div className="skillcheck-bar-slot">
      <div className="skillcheck-bar">
        <div
          className="skillcheck-zone"
          style={{ left: `${snap.skillcheck.zoneStart}%`, width: `${snap.skillcheck.zoneWidth}%` }}
        />
        <div
          className="skillcheck-great-zone"
          style={{ left: `${snap.skillcheck.greatZoneStart}%`, width: `${snap.skillcheck.greatZoneWidth}%` }}
        />
        <div className="skillcheck-indicator" ref={indicatorRef} />
      </div>
      <div className="skillcheck-prompt">Click Again!</div>
    </div>
  );
}

export function RewindHint() {
  const snap = useSnapshot(engine);
  if (!snap.rewind.canRewind) return null;
  return (
    <div className={`rewind-hint${snap.rewind.isRewinding ? ' is-active' : ''}`}>
      Hold <kbd>Space</kbd> / <kbd>Right-Click</kbd> to Rewind
    </div>
  );
}
