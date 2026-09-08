import { useCallback, useEffect, useSyncExternalStore } from 'react';
import type { GameEngine, FrameData } from '../engine/GameEngine';
import type { Cue, Snapshot } from '../engine/types';

export function useSnapshot(engine: GameEngine): Snapshot {
  const subscribe = useCallback((cb: () => void) => engine.subscribeSnapshot(cb), [engine]);
  const getSnapshot = useCallback(() => engine.getSnapshot(), [engine]);
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useFrame(engine: GameEngine, cb: (frame: FrameData) => void): void {
  useEffect(() => engine.subscribeFrame(cb), [engine, cb]);
}

export function useCue(engine: GameEngine, cb: (cue: Cue) => void): void {
  useEffect(() => engine.subscribeCue(cb), [engine, cb]);
}
