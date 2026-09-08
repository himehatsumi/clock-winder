import { engine } from '../engine/singleton';

export default function DebugPanel() {
  return (
    <div className="debug-panel">
      <button onClick={() => engine.debugMaxComponents()}>Max Components</button>
      <button onClick={() => engine.debugMaxEnergy()}>Max Rewind Energy</button>
      <button onClick={() => engine.debugResetHeat()}>Reset Heat</button>
      <button onClick={() => engine.debugMaxScore()}>Max Score</button>
      <button onClick={() => engine.debugTriggerEvent()}>Trigger Event</button>
      <button onClick={() => engine.debugAddHeat()}>Add 20 Heat</button>
    </div>
  );
}
