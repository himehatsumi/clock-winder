import { useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { engine } from '../engine/singleton';
import { useFrame, useSnapshot } from './hooks';
import { IconRewind } from './icons';

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

export function RewindButton() {
  const snap = useSnapshot(engine);
  if (!snap.rewind.canRewind) return null;
  const depleted = snap.rewind.current <= 0;

  const start = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    engine.startRewind();
  };
  const stop = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    engine.stopRewind();
  };

  return (
    <button
      className={`rewind-button${snap.rewind.isRewinding ? ' is-active' : ''}`}
      disabled={depleted}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerCancel={stop}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <IconRewind />
      <span className="rewind-button-label">Hold to Rewind</span>
      <span className="rewind-button-sub">or Space / Right-Click</span>
    </button>
  );
}
