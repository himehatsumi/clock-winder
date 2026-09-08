import { LEGACY_KEY, SAVE_KEY, SETTINGS_KEY } from './constants';
import type { LegacyKey, UpgradeKey } from './types';

export interface MetaSave {
  legacyCores: number;
  legacyLevels: Record<LegacyKey, number>;
  achievementsUnlocked: string[];
  bestScore: number;
  bestSurvivalSeconds: number;
  lifetimeCoresEarned: number;
  lifetimeGearsCollected: number;
  lifetimeOverheats: number;
  lifetimeSuccessfulWinds: number;
}

export interface SettingsSave {
  muted: boolean;
  reducedMotion: boolean;
}

export interface RunSave {
  gameTimeSeconds: number;
  elapsedRealTime: number;
  tutorialStage: number;
  tutorialStageEnteredAt: number;
  tutorialWindsThisRun: number;
  tutorialRewindsThisRun: number;
  tutorialGearsThisRun: number;
  score: number;
  components: number;
  currentHeat: number;
  maxHeat: number;
  precision: number;
  currentRewindEnergy: number;
  maxRewindEnergy: number;
  upgradeCosts: Record<UpgradeKey, number>;
  upgradeLevels: Record<UpgradeKey, number>;
  skillcheckSuccessBonusBase: number;
  heatPerSkillcheckBase: number;
  heatPerAutoPowerBase: number;
  autoWindPowerBase: number;
  rewindEnergyRegenRateBase: number;
  rewindPowerPerSecondBase: number;
  passiveCoolingRateBase: number;
  coolingPerRewindSecondBase: number;
  precisionDecayRateBase: number;
  minPrecision: number;
  gearSpawnChance: number;
  gearValueBase: number;
  goodEventBias: number;
  baseEventChance: number;
  skillcheckSuccessZoneWidthBase: number;
  passiveTickRate: number;
  skillcheckComponentBaseBase: number;
  skillcheckComponentPerComboBase: number;
  negativeEventDurationMultiplier: number;
}

function safeGet(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable (private mode, quota, etc.) - fail silently
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function loadMeta(): MetaSave | null {
  return safeGet(LEGACY_KEY) as MetaSave | null;
}

export function saveMeta(meta: MetaSave): void {
  safeSet(LEGACY_KEY, meta);
}

export function loadSettings(): SettingsSave | null {
  return safeGet(SETTINGS_KEY) as SettingsSave | null;
}

export function saveSettings(settings: SettingsSave): void {
  safeSet(SETTINGS_KEY, settings);
}

export function loadRun(): RunSave | null {
  return safeGet(SAVE_KEY) as RunSave | null;
}

export function saveRun(run: RunSave): void {
  safeSet(SAVE_KEY, run);
}

export function clearRun(): void {
  safeRemove(SAVE_KEY);
}
