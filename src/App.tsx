import { useEffect, useRef, useState } from 'react';
import { audio, engine } from './engine/singleton';
import { useCue, useSnapshot } from './ui/hooks';
import IntroScreen from './ui/screens/IntroScreen';
import GameOverScreen from './ui/screens/GameOverScreen';
import GameScreen from './ui/screens/GameScreen';
import BackgroundCanvas from './ui/BackgroundCanvas';
import AchievementToast from './ui/AchievementToast';
import DebugPanel from './ui/DebugPanel';

function App() {
  const snap = useSnapshot(engine);
  const shellRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    audio.attach();
    return () => audio.detach();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('reduced-motion', snap.settings.reducedMotion);
  }, [snap.settings.reducedMotion]);

  useCue(engine, (cue) => {
    if (cue.kind === 'overheatStart' || cue.kind === 'jam') {
      const el = shellRef.current;
      if (!el || snap.settings.reducedMotion) return;
      el.classList.remove('screen-shake');
      void el.offsetWidth;
      el.classList.add('screen-shake');
    }
    if (cue.kind === 'achievement') {
      const unlocked = engine.getSnapshot().achievements.filter((a) => a.unlocked);
      const latest = unlocked[unlocked.length - 1];
      if (latest) {
        setToast(latest.name);
        window.setTimeout(() => setToast(null), 3200);
      }
    }
  });

  return (
    <div className="app-shell" ref={shellRef}>
      <BackgroundCanvas />
      {snap.status === 'intro' && <IntroScreen />}
      {snap.status === 'running' && <GameScreen />}
      {snap.status === 'gameOver' && <GameOverScreen />}
      {toast && <AchievementToast name={toast} />}
      {snap.status !== 'intro' && engine.state.debugUnlocked && <DebugPanel />}
    </div>
  );
}

export default App;
