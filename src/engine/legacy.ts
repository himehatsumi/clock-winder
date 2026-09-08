import type { GameEngine } from './GameEngine';
import type { LegacyKey } from './types';

export interface LegacyDef {
  key: LegacyKey;
  name: string;
  hint: string;
  maxLevel: number;
  describe: (level: number) => string;
}

export const LEGACY_DEFS: LegacyDef[] = [
  {
    key: 'startComponents',
    name: 'Old Blueprints',
    hint: 'Begin each run with more Components',
    maxLevel: 10,
    describe: (lvl) => `+${lvl * 10} starting Components`,
  },
  {
    key: 'heatCapacity',
    name: 'Reforged Housing',
    hint: 'Begin each run with a higher heat ceiling',
    maxLevel: 10,
    describe: (lvl) => `+${lvl * 8}° starting Max Heat`,
  },
  {
    key: 'precisionFloor',
    name: 'Master Craftsmanship',
    hint: 'Raise the minimum possible Precision',
    maxLevel: 10,
    describe: (lvl) => `+${lvl * 1.5}% minimum Precision`,
  },
  {
    key: 'zoneWidth',
    name: "Winder's Instinct",
    hint: 'Widen the base skillcheck success zone',
    maxLevel: 8,
    describe: (lvl) => `+${lvl}% starting skillcheck zone width`,
  },
  {
    key: 'startEnergy',
    name: 'Stored Aether',
    hint: 'Begin each run with more max Rewind Energy',
    maxLevel: 10,
    describe: (lvl) => `+${lvl * 10} starting Max Rewind Energy`,
  },
  {
    key: 'coreGain',
    name: "Archivist's Ledger",
    hint: 'Earn more Temporal Cores from each run',
    maxLevel: 10,
    describe: (lvl) => `+${lvl * 10}% Temporal Cores earned`,
  },
];

export function applyLegacyToEngine(engine: GameEngine): void {
  const levels = engine.state.legacyLevels;
  engine.state.components += levels.startComponents * 10;
  engine.state.maxHeat += levels.heatCapacity * 8;
  engine.state.minPrecision = Math.min(95, engine.state.minPrecision + levels.precisionFloor * 1.5);
  engine.state.skillcheckSuccessZoneWidthBase += levels.zoneWidth;
  engine.state.maxRewindEnergy += levels.startEnergy * 10;
  engine.state.currentRewindEnergy = engine.state.maxRewindEnergy;
}

export function coresEarnedFromScore(score: number, coreGainLevel: number): number {
  const base = Math.floor(Math.sqrt(Math.max(0, score)) / 8);
  return Math.floor(base * (1 + coreGainLevel * 0.1));
}
