import { useRef } from 'react';
import { engine } from '../engine/singleton';
import { useFrame, useSnapshot } from './hooks';

function handAngles(gameTimeSeconds: number) {
  const secondsPastTwelve = (43200 - Math.max(0, gameTimeSeconds)) % 43200;
  return {
    second: secondsPastTwelve * 6,
    minute: secondsPastTwelve * 0.1,
    hour: secondsPastTwelve * (1 / 120),
  };
}

export default function ClockScene() {
  const snap = useSnapshot(engine);
  const sceneRef = useRef<HTMLDivElement>(null);
  const secondHandRef = useRef<SVGLineElement>(null);
  const minuteHandRef = useRef<SVGLineElement>(null);
  const hourHandRef = useRef<SVGLineElement>(null);

  useFrame(engine, (frame) => {
    const angles = handAngles(frame.gameTimeSeconds);
    if (secondHandRef.current) secondHandRef.current.style.transform = `rotate(${angles.second}deg)`;
    if (minuteHandRef.current) minuteHandRef.current.style.transform = `rotate(${angles.minute}deg)`;
    if (hourHandRef.current) hourHandRef.current.style.transform = `rotate(${angles.hour}deg)`;
    sceneRef.current?.style.setProperty('--heat', frame.heatPercent.toFixed(3));
    sceneRef.current?.classList.toggle('is-rewinding', frame.isRewinding);
    sceneRef.current?.classList.toggle('is-overheating', frame.isOverheating);
  });

  return (
    <div className="clock-scene" ref={sceneRef}>
      <svg className="analog-clock" viewBox="0 0 200 200">
        <defs>
          <radialGradient id="faceGradient" cx="50%" cy="42%" r="70%">
            <stop offset="0%" stopColor="#232833" />
            <stop offset="100%" stopColor="#12151c" />
          </radialGradient>
          <linearGradient id="bezelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8c890" />
            <stop offset="50%" stopColor="#8a6f45" />
            <stop offset="100%" stopColor="#c8a060" />
          </linearGradient>
          <filter id="handGlow">
            <feGaussianBlur stdDeviation="1.1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="100" cy="100" r="97" className="clock-bezel" />
        <circle cx="100" cy="100" r="92" className="clock-face" />
        <circle cx="100" cy="100" r="92" className="clock-heat-ring" />

        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * 360;
          const major = i % 3 === 0;
          return (
            <line
              key={i}
              x1="100"
              y1={major ? 12 : 16}
              x2="100"
              y2={major ? 22 : 20}
              className={`marking${major ? ' marking-major' : ''}`}
              transform={`rotate(${angle} 100 100)`}
            />
          );
        })}

        <line ref={hourHandRef} x1="100" y1="100" x2="100" y2="55" className="hand hour-hand" />
        <line ref={minuteHandRef} x1="100" y1="100" x2="100" y2="34" className="hand minute-hand" />
        <line
          ref={secondHandRef}
          x1="100"
          y1="100"
          x2="100"
          y2="24"
          className="hand second-hand"
          filter="url(#handGlow)"
        />
        <circle cx="100" cy="100" r="5" className="center-pin" />
      </svg>

      <div className="gear-field">
        {snap.gears.map((g) => (
          <button
            key={g.id}
            className={`loose-gear${g.collected ? ' is-collected' : ''}`}
            style={{ left: `${(g.x / 200) * 100}%`, top: `${(g.y / 200) * 100}%` }}
            onClick={(e) => {
              e.stopPropagation();
              engine.collectGear(g.id);
            }}
            aria-label="Collect loose gear"
          />
        ))}
        {snap.floatingTexts.map((f) => (
          <span
            key={f.id}
            className={`floating-text floating-text-${f.kind}`}
            style={{ left: `${(f.x / 200) * 100}%`, top: `${(f.y / 200) * 100}%` }}
          >
            {f.text}
          </span>
        ))}
      </div>

      {snap.gearsUnlocked && snap.gears.length === 0 && snap.tutorialStage < 4 && (
        <div className="gear-hint">Click falling gears!</div>
      )}
    </div>
  );
}
