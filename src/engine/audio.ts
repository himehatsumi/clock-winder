import type { GameEngine } from './GameEngine';
import type { Cue } from './types';

type Wave = OscillatorType;

interface Tone {
  freq: number;
  duration: number;
  wave?: Wave;
  gain?: number;
  delay?: number;
  glideTo?: number;
}

const CUE_TONES: Partial<Record<Cue['kind'], Tone[]>> = {
  windSuccess: [{ freq: 620, duration: 0.07, wave: 'sine', gain: 0.16 }],
  windGreatSuccess: [
    { freq: 880, duration: 0.08, wave: 'triangle', gain: 0.18 },
    { freq: 1320, duration: 0.12, wave: 'triangle', gain: 0.18, delay: 0.07 },
  ],
  windFail: [{ freq: 180, duration: 0.18, wave: 'sawtooth', gain: 0.14, glideTo: 90 }],
  gearCollect: [{ freq: 1400, duration: 0.05, wave: 'triangle', gain: 0.1 }],
  overheatStart: [
    { freq: 220, duration: 0.15, wave: 'square', gain: 0.12 },
    { freq: 220, duration: 0.15, wave: 'square', gain: 0.12, delay: 0.2 },
  ],
  eventGood: [
    { freq: 523, duration: 0.09, wave: 'sine', gain: 0.14 },
    { freq: 659, duration: 0.09, wave: 'sine', gain: 0.14, delay: 0.09 },
    { freq: 784, duration: 0.14, wave: 'sine', gain: 0.14, delay: 0.18 },
  ],
  eventBad: [{ freq: 160, duration: 0.3, wave: 'sawtooth', gain: 0.12, glideTo: 110 }],
  jam: [{ freq: 100, duration: 0.22, wave: 'square', gain: 0.15 }],
  upgrade: [
    { freq: 740, duration: 0.05, wave: 'square', gain: 0.1 },
    { freq: 1180, duration: 0.08, wave: 'square', gain: 0.1, delay: 0.05 },
  ],
  gameOver: [
    { freq: 392, duration: 0.35, wave: 'sine', gain: 0.16 },
    { freq: 330, duration: 0.35, wave: 'sine', gain: 0.16, delay: 0.3 },
    { freq: 262, duration: 0.7, wave: 'sine', gain: 0.16, delay: 0.6 },
  ],
  prestige: [
    { freq: 660, duration: 0.1, wave: 'triangle', gain: 0.16 },
    { freq: 990, duration: 0.1, wave: 'triangle', gain: 0.16, delay: 0.1 },
    { freq: 1320, duration: 0.2, wave: 'triangle', gain: 0.16, delay: 0.2 },
  ],
  achievement: [
    { freq: 784, duration: 0.09, wave: 'sine', gain: 0.15 },
    { freq: 988, duration: 0.09, wave: 'sine', gain: 0.15, delay: 0.09 },
    { freq: 1175, duration: 0.16, wave: 'sine', gain: 0.15, delay: 0.18 },
  ],
};

export class AudioController {
  private ctx: AudioContext | null = null;
  private unsubscribe: (() => void) | null = null;
  private engine: GameEngine;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  attach(): void {
    this.unsubscribe = this.engine.subscribeCue((cue) => this.handleCue(cue));
  }

  detach(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  private ensureContext(): AudioContext | null {
    if (this.engine.state.settings.muted) return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  private playTone(tone: Tone, when: number) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = tone.wave ?? 'sine';
    osc.frequency.setValueAtTime(tone.freq, when);
    if (tone.glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, tone.glideTo), when + tone.duration);
    const peak = tone.gain ?? 0.15;
    gainNode.gain.setValueAtTime(0.0001, when);
    gainNode.gain.exponentialRampToValueAtTime(peak, when + 0.012);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, when + tone.duration);
    osc.connect(gainNode).connect(ctx.destination);
    osc.start(when);
    osc.stop(when + tone.duration + 0.02);
  }

  private handleCue(cue: Cue) {
    const tones = CUE_TONES[cue.kind];
    if (!tones) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const base = ctx.currentTime;
    for (const tone of tones) this.playTone(tone, base + (tone.delay ?? 0));
  }

  playWindTick(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.playTone({ freq: 950, duration: 0.02, wave: 'square', gain: 0.03 }, ctx.currentTime);
  }
}
