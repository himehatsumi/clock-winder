import {
  BASE_PASSIVE_TICK_RATE,
  BASE_SKILLCHECK_DURATION,
  BASE_SKILLCHECK_SUCCESS_ZONE_WIDTH,
  BASE_UPGRADE_COSTS,
  COMBO_MULTIPLIER_STEP,
  COST_MULTIPLIERS,
  EVENT_CHECK_INTERVAL,
  GREAT_SUCCESS_ZONE_WIDTH_RATIO,
  HEAT_JAM_CHANCE,
  HIGH_HEAT_THRESHOLD_PERCENT,
  LEGACY_BASE_COSTS,
  LEGACY_COST_MULTIPLIERS,
  MAX_COMBO_MULTIPLIER,
  MAX_DELTA_TIME,
  MAX_REWARD_COMBO,
  MIN_SKILLCHECK_DURATION,
  SKILLCHECK_FAIL_JAM_DURATION,
  SKILLCHECK_SCORE_BONUS,
  STARTING_SECONDS_BEFORE_MIDNIGHT,
  TUTORIAL_STAGE_FALLBACK_SECONDS,
  TUTORIAL_SPOTLIGHT_TARGETS,
} from './constants';
import { ACHIEVEMENT_DEFS } from './achievements';
import { Emitter } from './emitter';
import { EVENT_DEFS } from './events';
import { applyLegacyToEngine, coresEarnedFromScore, LEGACY_DEFS } from './legacy';
import { clearRun, loadMeta, loadRun, loadSettings, saveMeta, saveRun, saveSettings, type MetaSave } from './save';
import { UPGRADE_DEFS } from './upgrades';
import type {
  Cue,
  EventDef,
  FloatingTextInstance,
  GearInstance,
  LegacyKey,
  ModifierKey,
  Snapshot,
  UpgradeKey,
} from './types';

const ALL_UPGRADE_KEYS = UPGRADE_DEFS.map((u) => u.key);
const ALL_LEGACY_KEYS = LEGACY_DEFS.map((l) => l.key);

function zeroRecord<K extends string>(keys: K[]): Record<K, number> {
  const out = {} as Record<K, number>;
  for (const k of keys) out[k] = 0;
  return out;
}

export interface FrameData {
  gameTimeSeconds: number;
  indicatorPercent: number;
  isSkillcheckActive: boolean;
  heatPercent: number;
  isRewinding: boolean;
  isOverheating: boolean;
  elapsedRealTime: number;
}

interface EngineState {
  status: 'intro' | 'running' | 'gameOver';
  tutorialStage: number;
  tutorialStageEnteredAt: number;
  tutorialWindsThisRun: number;
  tutorialRewindsThisRun: number;
  tutorialGearsThisRun: number;
  elapsedRealTime: number;
  gameTimeSeconds: number;
  score: number;
  components: number;

  skillcheckSuccessBonusBase: number;
  heatPerSkillcheckBase: number;
  heatPenaltyFail: number;
  heatPerAutoPowerBase: number;
  heatPerGearClick: number;
  autoWindPowerBase: number;

  maxRewindEnergy: number;
  currentRewindEnergy: number;
  rewindEnergyRegenRateBase: number;
  rewindEnergyCostPerSecondBase: number;
  rewindPowerPerSecondBase: number;
  naturalTimeProgressionRate: number;

  currentHeat: number;
  maxHeat: number;
  passiveCoolingRateBase: number;
  coolingPerRewindSecondBase: number;
  isOverheating: boolean;
  isHighHeatActive: boolean;
  heatJamChance: number;

  gearSpawnChance: number;
  maxActiveGears: number;
  gearValueBase: number;
  gearTimeBonus: number;
  gearLifetime: number;
  gearCounter: number;
  gears: GearInstance[];

  eventCheckInterval: number;
  timeSinceLastEventCheck: number;
  baseEventChance: number;
  goodEventBias: number;
  currentEvent: EventDef | null;
  eventDuration: number;
  negativeEventDurationMultiplier: number;
  activeModifierKeys: ModifierKey[];
  modifiers: Partial<Record<ModifierKey, number>>;

  precision: number;
  maxPrecision: number;
  precisionDecayRateBase: number;
  minPrecision: number;

  isSkillcheckActive: boolean;
  skillcheckDuration: number;
  skillcheckStartTime: number;
  skillcheckDirection: 1 | -1;
  skillcheckSuccessZoneWidthBase: number;
  skillcheckSuccessZonePos: number;
  skillcheckCombo: number;
  greatSuccessCombo: number;
  isGreatSuccess: boolean;
  skillcheckComponentBaseBase: number;
  skillcheckComponentPerComboBase: number;
  isWindJammed: boolean;
  windJamEndMs: number;
  skillcheckFailTimeoutId: number | null;
  skillcheckIndicatorPercent: number;

  passiveTickRate: number;
  isRewinding: boolean;

  bestScore: number;
  bestSurvivalSeconds: number;

  upgradeCosts: Record<UpgradeKey, number>;
  upgradeLevels: Record<UpgradeKey, number>;

  legacyCores: number;
  legacyLevels: Record<LegacyKey, number>;

  achievementsUnlocked: Set<string>;
  lifetimeCoresEarned: number;
  lifetimeGearsCollected: number;
  lifetimeOverheats: number;
  lifetimeSuccessfulWinds: number;
  lifetimeEventsThisRun: number;

  settings: { muted: boolean; reducedMotion: boolean };

  floatingTexts: FloatingTextInstance[];
  floatingTextCounter: number;

  hasSavedRun: boolean;
  debugUnlocked: boolean;
}

export class GameEngine {
  state: EngineState;

  private rafId: number | null = null;
  private lastTimestamp = 0;
  private snapshotNotifyAccumulator = 0;
  private cachedSnapshot: Snapshot | null = null;
  private dirty = true;

  private snapshotEmitter = new Emitter<Snapshot>();
  private frameEmitter = new Emitter<FrameData>();
  private cueEmitter = new Emitter<Cue>();

  constructor() {
    const meta = loadMeta();
    const settings = loadSettings();
    const hasSavedRun = loadRun() !== null;

    this.state = {
      status: 'intro',
      tutorialStage: 0,
      tutorialStageEnteredAt: 0,
      tutorialWindsThisRun: 0,
      tutorialRewindsThisRun: 0,
      tutorialGearsThisRun: 0,
      elapsedRealTime: 0,
      gameTimeSeconds: STARTING_SECONDS_BEFORE_MIDNIGHT,
      score: 0,
      components: 25,

      skillcheckSuccessBonusBase: 0.45,
      heatPerSkillcheckBase: 1.5,
      heatPenaltyFail: 1.0,
      heatPerAutoPowerBase: 8.0,
      heatPerGearClick: 0.2,
      autoWindPowerBase: 0,

      maxRewindEnergy: 100,
      currentRewindEnergy: 100,
      rewindEnergyRegenRateBase: 1.44,
      rewindEnergyCostPerSecondBase: 20,
      rewindPowerPerSecondBase: 2.85,
      naturalTimeProgressionRate: 1.0,

      currentHeat: 0,
      maxHeat: 120,
      passiveCoolingRateBase: 0.15,
      coolingPerRewindSecondBase: 3.5,
      isOverheating: false,
      isHighHeatActive: false,
      heatJamChance: HEAT_JAM_CHANCE,

      gearSpawnChance: 0.2,
      maxActiveGears: 6,
      gearValueBase: 2.25,
      gearTimeBonus: 0.08,
      gearLifetime: 7.0,
      gearCounter: 0,
      gears: [],

      eventCheckInterval: EVENT_CHECK_INTERVAL,
      timeSinceLastEventCheck: 0,
      baseEventChance: 0.25,
      goodEventBias: 0.5,
      currentEvent: null,
      eventDuration: 0,
      negativeEventDurationMultiplier: 1.0,
      activeModifierKeys: [],
      modifiers: {},

      precision: 100,
      maxPrecision: 100,
      precisionDecayRateBase: 0.05,
      minPrecision: 50,

      isSkillcheckActive: false,
      skillcheckDuration: BASE_SKILLCHECK_DURATION,
      skillcheckStartTime: 0,
      skillcheckDirection: 1,
      skillcheckSuccessZoneWidthBase: BASE_SKILLCHECK_SUCCESS_ZONE_WIDTH,
      skillcheckSuccessZonePos: 50,
      skillcheckCombo: 0,
      greatSuccessCombo: 0,
      isGreatSuccess: false,
      skillcheckComponentBaseBase: 0.25,
      skillcheckComponentPerComboBase: 0.15,
      isWindJammed: false,
      windJamEndMs: 0,
      skillcheckFailTimeoutId: null,
      skillcheckIndicatorPercent: 0,

      passiveTickRate: BASE_PASSIVE_TICK_RATE,
      isRewinding: false,

      bestScore: meta?.bestScore ?? 0,
      bestSurvivalSeconds: meta?.bestSurvivalSeconds ?? 0,

      upgradeCosts: { ...BASE_UPGRADE_COSTS } as Record<UpgradeKey, number>,
      upgradeLevels: zeroRecord(ALL_UPGRADE_KEYS),

      legacyCores: meta?.legacyCores ?? 0,
      legacyLevels: { ...zeroRecord(ALL_LEGACY_KEYS), ...(meta?.legacyLevels ?? {}) },

      achievementsUnlocked: new Set(meta?.achievementsUnlocked ?? []),
      lifetimeCoresEarned: meta?.lifetimeCoresEarned ?? 0,
      lifetimeGearsCollected: meta?.lifetimeGearsCollected ?? 0,
      lifetimeOverheats: meta?.lifetimeOverheats ?? 0,
      lifetimeSuccessfulWinds: meta?.lifetimeSuccessfulWinds ?? 0,
      lifetimeEventsThisRun: 0,

      settings: { muted: settings?.muted ?? false, reducedMotion: settings?.reducedMotion ?? false },

      floatingTexts: [],
      floatingTextCounter: 0,

      hasSavedRun,
      debugUnlocked: typeof location !== 'undefined' && new URLSearchParams(location.search).get('debug') === '1',
    };
  }

  // --- Subscriptions ---
  subscribeSnapshot(cb: (snap: Snapshot) => void): () => void {
    return this.snapshotEmitter.subscribe(cb);
  }
  subscribeFrame(cb: (frame: FrameData) => void): () => void {
    return this.frameEmitter.subscribe(cb);
  }
  subscribeCue(cb: (cue: Cue) => void): () => void {
    return this.cueEmitter.subscribe(cb);
  }

  private markDirty() {
    this.dirty = true;
  }

  private emitCue(kind: Cue['kind']) {
    this.cueEmitter.emit({ kind, at: performance.now() });
  }

  // --- Lifecycle ---
  startNewRun(skipTutorial: boolean): void {
    clearRun();
    const s = this.state;
    s.status = 'running';
    s.tutorialStage = skipTutorial ? 5 : 0;
    s.tutorialStageEnteredAt = 0;
    s.tutorialWindsThisRun = 0;
    s.tutorialRewindsThisRun = 0;
    s.tutorialGearsThisRun = 0;
    s.elapsedRealTime = 0;
    s.gameTimeSeconds = STARTING_SECONDS_BEFORE_MIDNIGHT;
    s.score = 0;
    s.components = 25;
    s.currentHeat = 0;
    s.maxHeat = 120;
    s.precision = s.maxPrecision;
    s.minPrecision = 50;
    s.currentRewindEnergy = 100;
    s.maxRewindEnergy = 100;
    s.skillcheckCombo = 0;
    s.greatSuccessCombo = 0;
    s.isGreatSuccess = false;
    s.isWindJammed = false;
    s.isRewinding = false;
    s.isSkillcheckActive = false;
    s.gears = [];
    s.currentEvent = null;
    s.eventDuration = 0;
    s.timeSinceLastEventCheck = 0;
    s.modifiers = {};
    s.activeModifierKeys = [];
    s.lifetimeEventsThisRun = 0;
    s.naturalTimeProgressionRate = 1.0;
    s.passiveCoolingRateBase = 0.15;
    s.coolingPerRewindSecondBase = 3.5;
    s.heatPerSkillcheckBase = 1.5;
    s.heatPerAutoPowerBase = 8.0;
    s.skillcheckSuccessBonusBase = 0.45;
    s.rewindEnergyRegenRateBase = 1.44;
    s.rewindEnergyCostPerSecondBase = 20;
    s.rewindPowerPerSecondBase = 2.85;
    s.autoWindPowerBase = 0;
    s.gearSpawnChance = 0.2;
    s.gearValueBase = 2.25;
    s.baseEventChance = 0.25;
    s.goodEventBias = 0.5;
    s.skillcheckSuccessZoneWidthBase = BASE_SKILLCHECK_SUCCESS_ZONE_WIDTH;
    s.precisionDecayRateBase = 0.05;
    s.passiveTickRate = BASE_PASSIVE_TICK_RATE;
    s.skillcheckComponentBaseBase = 0.25;
    s.skillcheckComponentPerComboBase = 0.15;
    s.negativeEventDurationMultiplier = 1.0;
    s.upgradeCosts = { ...BASE_UPGRADE_COSTS } as Record<UpgradeKey, number>;
    s.upgradeLevels = zeroRecord(ALL_UPGRADE_KEYS);
    s.floatingTexts = [];

    applyLegacyToEngine(this);

    this.lastTimestamp = 0;
    this.markDirty();
    this.flushSnapshot();
    this.startLoop();
  }

  resumeRun(): boolean {
    const run = loadRun();
    if (!run) return false;
    const s = this.state;
    Object.assign(s, run);
    s.status = 'running';
    s.isRewinding = false;
    s.isSkillcheckActive = false;
    s.isWindJammed = false;
    s.gears = [];
    s.currentEvent = null;
    s.eventDuration = 0;
    s.timeSinceLastEventCheck = 0;
    s.modifiers = {};
    s.activeModifierKeys = [];
    this.lastTimestamp = 0;
    this.markDirty();
    this.flushSnapshot();
    this.startLoop();
    return true;
  }

  discardSavedRun(): void {
    clearRun();
    this.state.hasSavedRun = false;
    this.markDirty();
    this.flushSnapshot();
  }

  private startLoop() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(this.loop);
  }

  private stopLoop() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  private currentMeta(): MetaSave {
    return {
      legacyCores: this.state.legacyCores,
      legacyLevels: this.state.legacyLevels,
      achievementsUnlocked: [...this.state.achievementsUnlocked],
      bestScore: this.state.bestScore,
      bestSurvivalSeconds: this.state.bestSurvivalSeconds,
      lifetimeCoresEarned: this.state.lifetimeCoresEarned,
      lifetimeGearsCollected: this.state.lifetimeGearsCollected,
      lifetimeOverheats: this.state.lifetimeOverheats,
      lifetimeSuccessfulWinds: this.state.lifetimeSuccessfulWinds,
    };
  }

  private persistMeta() {
    saveMeta(this.currentMeta());
  }

  private persistRun() {
    if (this.state.status !== 'running') return;
    const s = this.state;
    saveRun({
      gameTimeSeconds: s.gameTimeSeconds,
      elapsedRealTime: s.elapsedRealTime,
      tutorialStage: s.tutorialStage,
      tutorialStageEnteredAt: s.tutorialStageEnteredAt,
      tutorialWindsThisRun: s.tutorialWindsThisRun,
      tutorialRewindsThisRun: s.tutorialRewindsThisRun,
      tutorialGearsThisRun: s.tutorialGearsThisRun,
      score: s.score,
      components: s.components,
      currentHeat: s.currentHeat,
      maxHeat: s.maxHeat,
      precision: s.precision,
      currentRewindEnergy: s.currentRewindEnergy,
      maxRewindEnergy: s.maxRewindEnergy,
      upgradeCosts: s.upgradeCosts,
      upgradeLevels: s.upgradeLevels,
      skillcheckSuccessBonusBase: s.skillcheckSuccessBonusBase,
      heatPerSkillcheckBase: s.heatPerSkillcheckBase,
      heatPerAutoPowerBase: s.heatPerAutoPowerBase,
      autoWindPowerBase: s.autoWindPowerBase,
      rewindEnergyRegenRateBase: s.rewindEnergyRegenRateBase,
      rewindPowerPerSecondBase: s.rewindPowerPerSecondBase,
      passiveCoolingRateBase: s.passiveCoolingRateBase,
      coolingPerRewindSecondBase: s.coolingPerRewindSecondBase,
      precisionDecayRateBase: s.precisionDecayRateBase,
      minPrecision: s.minPrecision,
      gearSpawnChance: s.gearSpawnChance,
      gearValueBase: s.gearValueBase,
      goodEventBias: s.goodEventBias,
      baseEventChance: s.baseEventChance,
      skillcheckSuccessZoneWidthBase: s.skillcheckSuccessZoneWidthBase,
      passiveTickRate: s.passiveTickRate,
      skillcheckComponentBaseBase: s.skillcheckComponentBaseBase,
      skillcheckComponentPerComboBase: s.skillcheckComponentPerComboBase,
      negativeEventDurationMultiplier: s.negativeEventDurationMultiplier,
    });
  }

  toggleMute(): void {
    this.state.settings.muted = !this.state.settings.muted;
    saveSettings(this.state.settings);
    this.markDirty();
    this.flushSnapshot();
  }

  toggleReducedMotion(): void {
    this.state.settings.reducedMotion = !this.state.settings.reducedMotion;
    saveSettings(this.state.settings);
    this.markDirty();
    this.flushSnapshot();
  }

  // --- Modifiers ---
  private getModifier(key: ModifierKey): number {
    return this.state.modifiers[key] ?? 1;
  }

  private applyEventModifiers(def: EventDef) {
    const keys = Object.keys(def.modifiers) as ModifierKey[];
    this.state.activeModifierKeys = keys;
    for (const k of keys) {
      this.state.modifiers[k] = def.modifiers[k];
    }
  }

  private clearEventModifiers() {
    for (const k of this.state.activeModifierKeys) {
      delete this.state.modifiers[k];
    }
    this.state.activeModifierKeys = [];
  }

  // --- Events ---
  private triggerRandomEvent() {
    if (this.state.currentEvent || Math.random() > this.state.baseEventChance) return;
    const isGood = Math.random() < this.state.goodEventBias;
    const pool = EVENT_DEFS.filter((e) => e.type === (isGood ? 'good' : 'bad'));
    if (pool.length === 0) return;
    const def = pool[Math.floor(Math.random() * pool.length)];
    this.beginEvent(def);
  }

  private beginEvent(def: EventDef) {
    this.state.currentEvent = def;
    this.state.eventDuration = def.duration * (def.type === 'bad' ? this.state.negativeEventDurationMultiplier : 1);
    this.state.lifetimeEventsThisRun += 1;
    this.applyEventModifiers(def);
    if (def.instant) def.instant(this);
    this.emitCue(def.type === 'good' ? 'eventGood' : 'eventBad');
    this.markDirty();
  }

  debugTriggerEvent(): void {
    const pool = EVENT_DEFS;
    const def = pool[Math.floor(Math.random() * pool.length)];
    if (this.state.currentEvent) {
      this.clearEventModifiers();
    }
    this.beginEvent(def);
    this.flushSnapshot();
  }

  private processEvents(dt: number) {
    const s = this.state;
    s.timeSinceLastEventCheck += dt;
    if (s.timeSinceLastEventCheck >= s.eventCheckInterval) {
      s.timeSinceLastEventCheck = 0;
      this.triggerRandomEvent();
    }
    if (s.currentEvent) {
      s.eventDuration -= dt;
      if (s.eventDuration <= 0) {
        this.clearEventModifiers();
        s.currentEvent = null;
        s.eventDuration = 0;
        this.markDirty();
      }
    }
  }

  // --- Gears ---
  private spawnGear() {
    const s = this.state;
    if (s.gears.length >= s.maxActiveGears) return;
    const angle = Math.random() * 2 * Math.PI;
    const radius = 20 + Math.random() * 60;
    s.gears.push({
      id: s.gearCounter++,
      x: 100 + radius * Math.cos(angle) - 11,
      y: 100 + radius * Math.sin(angle) - 11,
      bornAt: s.elapsedRealTime,
      lifetime: s.gearLifetime,
      collected: false,
    });
    this.markDirty();
  }

  collectGear(id: number): void {
    const s = this.state;
    if (s.status !== 'running') return;
    const gear = s.gears.find((g) => g.id === id && !g.collected);
    if (!gear) return;
    gear.collected = true;
    s.score += 5;
    s.components += s.gearValueBase;
    s.gameTimeSeconds += s.gearTimeBonus;
    s.currentHeat = Math.min(s.maxHeat, s.currentHeat + s.heatPerGearClick);
    s.lifetimeGearsCollected += 1;
    s.tutorialGearsThisRun += 1;
    this.spawnFloatingText(gear.x + 11, gear.y + 11, `+${s.gearValueBase.toFixed(1)}`, 'components');
    this.emitCue('gearCollect');
    setTimeout(() => {
      this.state.gears = this.state.gears.filter((g) => g.id !== id);
      this.markDirty();
    }, 260);
    this.markDirty();
  }

  // --- Floating text ---
  private spawnFloatingText(x: number, y: number, text: string, kind: FloatingTextInstance['kind']) {
    const s = this.state;
    s.floatingTexts.push({ id: s.floatingTextCounter++, x, y, text, kind, createdAt: s.elapsedRealTime });
    if (s.floatingTexts.length > 24) s.floatingTexts.splice(0, s.floatingTexts.length - 24);
  }

  // --- Skillcheck ---
  attemptWind(): void {
    const s = this.state;
    if (s.status !== 'running' || s.isWindJammed) return;
    if (s.isOverheating && Math.random() < s.heatJamChance) return;
    if (s.isSkillcheckActive) {
      this.handleSkillcheckAttempt();
    } else {
      this.startSkillcheck();
    }
  }

  /** For a click anywhere on the page: only registers if a skillcheck is already in progress. */
  globalClickAttempt(): void {
    const s = this.state;
    if (s.status === 'running' && s.isSkillcheckActive && !s.isWindJammed) {
      this.handleSkillcheckAttempt();
    }
  }

  private startSkillcheck() {
    const s = this.state;
    if (s.isSkillcheckActive || s.isWindJammed || s.status !== 'running') return;
    const comboTier = Math.floor(Math.min(s.skillcheckCombo, MAX_REWARD_COMBO) / 5);
    const durationMultiplier = Math.pow(0.92, comboTier) * this.getModifier('skillcheckSpeed');
    s.skillcheckDuration = Math.max(MIN_SKILLCHECK_DURATION, BASE_SKILLCHECK_DURATION * durationMultiplier);
    s.isSkillcheckActive = true;
    s.skillcheckStartTime = performance.now();
    s.skillcheckDirection = 1;
    const width = s.skillcheckSuccessZoneWidthBase * this.getModifier('skillcheckZoneWidth');
    s.skillcheckSuccessZonePos = Math.random() * (100 - width);
    s.skillcheckIndicatorPercent = 0;
    if (s.skillcheckFailTimeoutId !== null) clearTimeout(s.skillcheckFailTimeoutId);
    s.skillcheckFailTimeoutId = window.setTimeout(() => this.failSkillcheck(), s.skillcheckDuration * 2 * 1000);
    this.markDirty();
  }

  private handleSkillcheckAttempt() {
    const s = this.state;
    if (!s.isSkillcheckActive || s.status !== 'running') return;
    if (s.skillcheckFailTimeoutId !== null) {
      clearTimeout(s.skillcheckFailTimeoutId);
      s.skillcheckFailTimeoutId = null;
    }
    const width = s.skillcheckSuccessZoneWidthBase * this.getModifier('skillcheckZoneWidth');
    const indicatorPos = this.currentIndicatorPercent();
    const successStart = s.skillcheckSuccessZonePos;
    const successEnd = s.skillcheckSuccessZonePos + width;
    const greatWidth = width * GREAT_SUCCESS_ZONE_WIDTH_RATIO;
    const greatStart = successStart + (width * (1 - GREAT_SUCCESS_ZONE_WIDTH_RATIO)) / 2;
    const greatEnd = greatStart + greatWidth;
    s.isGreatSuccess = indicatorPos >= greatStart && indicatorPos <= greatEnd;
    if (indicatorPos >= successStart && indicatorPos <= successEnd) {
      this.succeedSkillcheck();
    } else {
      this.failSkillcheck();
    }
  }

  private currentIndicatorPercent(): number {
    const s = this.state;
    const elapsed = (performance.now() - s.skillcheckStartTime) / 1000;
    const rawProgress = elapsed / s.skillcheckDuration;
    const sweepCount = Math.floor(rawProgress);
    const progressInSweep = rawProgress % 1.0;
    const direction = sweepCount % 2 === 0 ? 1 : -1;
    return direction === 1 ? progressInSweep * 100 : (1 - progressInSweep) * 100;
  }

  private succeedSkillcheck() {
    const s = this.state;
    s.skillcheckCombo += 1;
    s.lifetimeSuccessfulWinds += 1;
    s.tutorialWindsThisRun += 1;
    let rewardMultiplier = 1.0;
    if (s.isGreatSuccess) {
      rewardMultiplier = 1.5;
      s.currentRewindEnergy = Math.min(s.maxRewindEnergy, s.currentRewindEnergy + 3);
      s.greatSuccessCombo += 1;
    } else {
      s.greatSuccessCombo = 0;
    }
    const comboMultiplier = Math.min(1.0 + Math.max(0, s.skillcheckCombo - 1) * COMBO_MULTIPLIER_STEP, MAX_COMBO_MULTIPLIER);
    const precisionFactor = s.precision / 100;

    const skillcheckSuccessBonus = s.skillcheckSuccessBonusBase * this.getModifier('skillcheckSuccessBonus');
    const baseTimeBonus = skillcheckSuccessBonus * (0.8 + precisionFactor * 0.2);
    const finalTimeBonus = baseTimeBonus * rewardMultiplier * comboMultiplier;
    const finalScoreBonus = SKILLCHECK_SCORE_BONUS * rewardMultiplier * comboMultiplier;

    const heatPerSkillcheck = s.heatPerSkillcheckBase * this.getModifier('heatPerSkillcheck');
    const effectiveHeat = heatPerSkillcheck * (1 + (1.0 - precisionFactor) * 0.2);
    const finalHeatGain = effectiveHeat / (1 + Math.max(0, s.skillcheckCombo - 1) * 0.05);

    const componentGainMod = this.getModifier('componentGain');
    const componentRewardBase = s.skillcheckComponentBaseBase + Math.max(0, s.skillcheckCombo - 1) * s.skillcheckComponentPerComboBase;
    const componentReward = componentRewardBase * rewardMultiplier * componentGainMod;

    s.components += componentReward;
    s.gameTimeSeconds += finalTimeBonus;
    s.score += finalScoreBonus;
    s.currentHeat = Math.min(s.maxHeat, s.currentHeat + finalHeatGain);

    this.spawnFloatingText(100, 60, `+${finalTimeBonus.toFixed(2)}s`, 'time');
    this.emitCue(s.isGreatSuccess ? 'windGreatSuccess' : 'windSuccess');

    this.cleanupSkillcheck();
    setTimeout(() => this.startSkillcheck(), 0);
    this.markDirty();
  }

  private failSkillcheck() {
    const s = this.state;
    if (s.skillcheckFailTimeoutId !== null) {
      clearTimeout(s.skillcheckFailTimeoutId);
      s.skillcheckFailTimeoutId = null;
    }
    if (!s.isSkillcheckActive) return;
    s.skillcheckCombo = 0;
    s.greatSuccessCombo = 0;
    s.skillcheckDuration = BASE_SKILLCHECK_DURATION;
    const precisionFactor = s.precision / 100;
    const effectiveFailHeat = s.heatPenaltyFail * (1 + (1.0 - precisionFactor) * 0.1);
    s.currentHeat = Math.min(s.maxHeat, s.currentHeat + effectiveFailHeat);
    s.isWindJammed = true;
    s.windJamEndMs = performance.now() + SKILLCHECK_FAIL_JAM_DURATION * 1000;
    this.emitCue('windFail');
    this.emitCue('jam');
    this.cleanupSkillcheck();
    this.markDirty();
  }

  private cleanupSkillcheck() {
    this.state.isSkillcheckActive = false;
    this.state.isGreatSuccess = false;
    this.markDirty();
  }

  // --- Rewind ---
  startRewind(): void {
    const s = this.state;
    if (s.status !== 'running' || s.currentRewindEnergy <= 0 || s.isRewinding) return;
    s.isRewinding = true;
    s.tutorialRewindsThisRun += 1;
    this.markDirty();
  }

  stopRewind(): void {
    if (!this.state.isRewinding) return;
    this.state.isRewinding = false;
    this.markDirty();
  }

  // --- Upgrades ---
  isUpgradeVisible(key: UpgradeKey): boolean {
    const def = UPGRADE_DEFS.find((u) => u.key === key)!;
    return this.state.tutorialStage >= def.requiredStage;
  }

  buyUpgrade(key: UpgradeKey): void {
    const s = this.state;
    if (!this.isUpgradeVisible(key)) return;
    const def = UPGRADE_DEFS.find((u) => u.key === key)!;
    const cost = s.upgradeCosts[key];
    if (s.components < cost) return;
    s.components -= cost;
    s.score += cost * 0.25;
    def.apply(this);
    s.upgradeLevels[key] += 1;
    s.upgradeCosts[key] = Math.ceil(cost * COST_MULTIPLIERS[key]);
    this.emitCue('upgrade');
    this.markDirty();
    this.flushSnapshot();
  }

  buyLegacyUpgrade(key: LegacyKey): void {
    const s = this.state;
    const def = LEGACY_DEFS.find((l) => l.key === key)!;
    const level = s.legacyLevels[key];
    if (level >= def.maxLevel) return;
    const cost = Math.ceil(LEGACY_BASE_COSTS[key] * Math.pow(LEGACY_COST_MULTIPLIERS[key], level));
    if (s.legacyCores < cost) return;
    s.legacyCores -= cost;
    s.legacyLevels[key] += 1;
    this.emitCue('prestige');
    this.persistMeta();
    this.markDirty();
    this.flushSnapshot();
  }

  legacyUpgradeCost(key: LegacyKey): number {
    const level = this.state.legacyLevels[key];
    return Math.ceil(LEGACY_BASE_COSTS[key] * Math.pow(LEGACY_COST_MULTIPLIERS[key], level));
  }

  // --- Debug ---
  debugMaxComponents(): void {
    this.state.components = 9999;
    this.markDirty();
    this.flushSnapshot();
  }
  debugMaxEnergy(): void {
    this.state.currentRewindEnergy = this.state.maxRewindEnergy;
    this.markDirty();
    this.flushSnapshot();
  }
  debugResetHeat(): void {
    this.state.currentHeat = 0;
    this.markDirty();
    this.flushSnapshot();
  }
  debugMaxScore(): void {
    this.state.score = 99999;
    this.markDirty();
    this.flushSnapshot();
  }
  debugAddHeat(): void {
    this.state.currentHeat = Math.min(this.state.maxHeat, this.state.currentHeat + 20);
    this.markDirty();
    this.flushSnapshot();
  }

  // --- Tutorial ---
  /** Whether the action taught at this stage has been completed this run. */
  private tutorialActionMet(stage: number): boolean {
    const s = this.state;
    switch (stage) {
      case 0:
        return s.tutorialWindsThisRun >= 1;
      case 1:
        return s.tutorialWindsThisRun >= 3;
      case 2:
        return s.upgradeLevels.click >= 1;
      case 3:
        return s.tutorialRewindsThisRun >= 1 || s.tutorialGearsThisRun >= 1;
      case 4:
        return s.precision <= 99;
      default:
        return false;
    }
  }

  private setTutorialStage(newStage: number) {
    const s = this.state;
    s.tutorialStage = newStage;
    s.tutorialStageEnteredAt = s.elapsedRealTime;
    this.markDirty();
  }

  /** Manual "Got it" advance — satisfies the current stage regardless of the action gate. */
  advanceTutorialManually(): void {
    const s = this.state;
    if (s.tutorialStage >= 5) return;
    this.setTutorialStage(s.tutorialStage + 1);
    this.flushSnapshot();
  }

  private advanceTutorial() {
    const s = this.state;
    if (s.tutorialStage >= 5) return;
    const stage = s.tutorialStage;
    const fallbackElapsed = s.elapsedRealTime - s.tutorialStageEnteredAt >= TUTORIAL_STAGE_FALLBACK_SECONDS[stage];
    if (this.tutorialActionMet(stage) || fallbackElapsed) {
      this.setTutorialStage(stage + 1);
    }
  }

  // --- Achievements ---
  private checkAchievements() {
    let changed = false;
    for (const def of ACHIEVEMENT_DEFS) {
      if (!this.state.achievementsUnlocked.has(def.id) && def.check(this)) {
        this.state.achievementsUnlocked.add(def.id);
        this.emitCue('achievement');
        changed = true;
      }
    }
    if (changed) {
      this.persistMeta();
      this.markDirty();
    }
  }

  // --- Game over ---
  private handleGameOver() {
    const s = this.state;
    s.status = 'gameOver';
    s.gears = [];
    if (s.currentEvent) this.clearEventModifiers();
    s.currentEvent = null;
    s.eventDuration = 0;
    s.isSkillcheckActive = false;
    s.isRewinding = false;
    if (s.skillcheckFailTimeoutId !== null) clearTimeout(s.skillcheckFailTimeoutId);

    const earnedCores = coresEarnedFromScore(s.score, s.legacyLevels.coreGain);
    s.legacyCores += earnedCores;
    s.lifetimeCoresEarned += earnedCores;
    this.lastRunCoresEarned = earnedCores;
    s.bestScore = Math.max(s.bestScore, s.score);
    s.bestSurvivalSeconds = Math.max(s.bestSurvivalSeconds, s.elapsedRealTime);

    clearRun();
    s.hasSavedRun = false;
    this.checkAchievements();
    this.persistMeta();
    this.emitCue('gameOver');
    this.stopLoop();
    this.markDirty();
    this.flushSnapshot();
  }

  lastRunCoresEarned = 0;

  // --- Main loop ---
  private loop = (timestamp: number) => {
    if (this.state.status !== 'running') return;
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      this.rafId = requestAnimationFrame(this.loop);
      return;
    }
    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, MAX_DELTA_TIME);
    this.lastTimestamp = timestamp;
    const s = this.state;
    s.elapsedRealTime += dt;

    this.advanceTutorial();
    if (s.tutorialStage >= 5) this.processEvents(dt);

    if (s.isWindJammed && timestamp >= s.windJamEndMs) {
      s.isWindJammed = false;
    }

    const highHeatThreshold = s.maxHeat * HIGH_HEAT_THRESHOLD_PERCENT;
    s.isHighHeatActive = !s.isOverheating && s.currentHeat >= highHeatThreshold;

    let precisionDecayRate = s.precisionDecayRateBase * this.getModifier('precisionDecay');
    if (s.isHighHeatActive) precisionDecayRate *= 3;
    s.precision = Math.max(s.minPrecision, s.precision - precisionDecayRate * dt);
    const precisionFactor = s.precision / 100;
    const inversePrecisionFactor = 1 - precisionFactor;

    const effectiveAutoPower = s.autoWindPowerBase * this.getModifier('autoWindPower') * (0.8 + precisionFactor * 0.2);
    const effectiveHeatPerAuto = s.heatPerAutoPowerBase * (1 + inversePrecisionFactor * 0.2);
    const effectiveDecayRate = s.naturalTimeProgressionRate * this.getModifier('timeProgression') * (1 + inversePrecisionFactor * 0.15);

    const heatGain = effectiveAutoPower * effectiveHeatPerAuto * dt;
    let heatLoss = s.passiveCoolingRateBase * this.getModifier('passiveCooling') * dt;
    if (s.isRewinding) heatLoss += s.coolingPerRewindSecondBase * dt;
    s.currentHeat = Math.max(0, Math.min(s.currentHeat + heatGain - heatLoss, s.maxHeat));

    const overheatThreshold = s.maxHeat * (110 / 120);
    const wasOverheating = s.isOverheating;
    s.isOverheating = s.currentHeat >= overheatThreshold;
    if (s.isOverheating && !wasOverheating) {
      s.lifetimeOverheats += 1;
      this.emitCue('overheatStart');
    } else if (!s.isOverheating && wasOverheating) {
      this.emitCue('overheatEnd');
    }

    const canRewind = s.tutorialStage >= 3;
    const actualRewindActive = canRewind && s.isRewinding;

    const timeGainedFromAuto = effectiveAutoPower * dt;
    let timeGainedFromRewind = 0;
    if (actualRewindActive) {
      if (s.currentRewindEnergy > 0) {
        const energyUsed = s.rewindEnergyCostPerSecondBase * this.getModifier('rewindEnergyCost') * dt;
        const gain = s.rewindPowerPerSecondBase * dt;
        if (s.currentRewindEnergy >= energyUsed) {
          s.currentRewindEnergy -= energyUsed;
          timeGainedFromRewind = gain;
        } else {
          const ratio = s.currentRewindEnergy / energyUsed;
          timeGainedFromRewind = gain * ratio;
          s.currentRewindEnergy = 0;
          this.stopRewind();
        }
        s.currentRewindEnergy = Math.max(0, s.currentRewindEnergy);
      } else {
        this.stopRewind();
      }
    }

    const heatPercent = s.maxHeat > 0 ? s.currentHeat / s.maxHeat : 0;
    const heatTimePenaltyRate = 3.4 * heatPercent;
    const finalTotalDecayRate = effectiveDecayRate + heatTimePenaltyRate;

    let timeLostToDecay = 0;
    if (timeGainedFromRewind < finalTotalDecayRate * dt * 0.6) {
      timeLostToDecay = finalTotalDecayRate * dt;
    }

    s.gameTimeSeconds += timeGainedFromAuto + timeGainedFromRewind - timeLostToDecay;

    if (!canRewind && s.isRewinding) this.stopRewind();

    s.score += (s.gameTimeSeconds / 60) * 0.05 * dt;
    s.score += (effectiveAutoPower + (actualRewindActive ? s.rewindPowerPerSecondBase : 0)) * 0.01 * dt;
    s.components += s.passiveTickRate * dt;

    const gearChance = s.tutorialStage >= 4 ? s.gearSpawnChance : s.tutorialStage === 3 ? 0.08 : s.tutorialStage === 2 ? 0.02 : 0;
    if (gearChance > 0 && Math.random() < gearChance * dt) {
      this.spawnGear();
    }

    if (!s.isRewinding && s.currentRewindEnergy < s.maxRewindEnergy) {
      s.currentRewindEnergy = Math.min(s.maxRewindEnergy, s.currentRewindEnergy + s.rewindEnergyRegenRateBase * this.getModifier('rewindEnergyRegen') * dt);
    }

    if (s.gears.some((g) => !g.collected && s.elapsedRealTime - g.bornAt > g.lifetime)) {
      s.gears = s.gears.filter((g) => g.collected || s.elapsedRealTime - g.bornAt <= g.lifetime);
      this.markDirty();
    }
    if (s.floatingTexts.some((f) => s.elapsedRealTime - f.createdAt > 1.3)) {
      s.floatingTexts = s.floatingTexts.filter((f) => s.elapsedRealTime - f.createdAt <= 1.3);
      this.markDirty();
    }

    if (s.isSkillcheckActive) {
      s.skillcheckIndicatorPercent = this.currentIndicatorPercent();
    }

    this.checkAchievements();

    this.frameEmitter.emit({
      gameTimeSeconds: s.gameTimeSeconds,
      indicatorPercent: s.skillcheckIndicatorPercent,
      isSkillcheckActive: s.isSkillcheckActive,
      heatPercent,
      isRewinding: s.isRewinding,
      isOverheating: s.isOverheating,
      elapsedRealTime: s.elapsedRealTime,
    });

    this.markDirty();
    this.snapshotNotifyAccumulator += dt;
    if (this.snapshotNotifyAccumulator >= 0.05) {
      this.snapshotNotifyAccumulator = 0;
      this.flushSnapshot();
    }

    this.persistTickAccumulator += dt;
    if (this.persistTickAccumulator >= 4) {
      this.persistTickAccumulator = 0;
      this.persistRun();
    }

    if (s.gameTimeSeconds <= 0) {
      this.handleGameOver();
      return;
    }

    this.rafId = requestAnimationFrame(this.loop);
  };

  private persistTickAccumulator = 0;

  flushSnapshot(): void {
    this.snapshotEmitter.emit(this.getSnapshot());
  }

  getSnapshot(): Snapshot {
    if (!this.dirty && this.cachedSnapshot) return this.cachedSnapshot;
    this.dirty = false;
    const s = this.state;
    const width = s.skillcheckSuccessZoneWidthBase * this.getModifier('skillcheckZoneWidth');
    const greatWidth = width * GREAT_SUCCESS_ZONE_WIDTH_RATIO;
    const greatStart = s.skillcheckSuccessZonePos + (width * (1 - GREAT_SUCCESS_ZONE_WIDTH_RATIO)) / 2;

    const upgrades = {} as Snapshot['upgrades'];
    for (const def of UPGRADE_DEFS) {
      upgrades[def.key] = {
        cost: s.upgradeCosts[def.key],
        level: s.upgradeLevels[def.key],
        available: s.components >= s.upgradeCosts[def.key],
        visible: s.tutorialStage >= def.requiredStage,
      };
    }

    const snapshot: Snapshot = {
      status: s.status,
      tutorialStage: s.tutorialStage,
      tutorialSpotlightTarget: TUTORIAL_SPOTLIGHT_TARGETS[s.tutorialStage] ?? null,
      gameTimeSeconds: s.gameTimeSeconds,
      startingSeconds: STARTING_SECONDS_BEFORE_MIDNIGHT,
      score: s.score,
      components: s.components,
      best: { score: s.bestScore, survivalSeconds: s.bestSurvivalSeconds },
      heat: {
        current: s.currentHeat,
        max: s.maxHeat,
        overheatThreshold: s.maxHeat * (110 / 120),
        isOverheating: s.isOverheating,
        isHighHeat: s.isHighHeatActive,
      },
      precision: {
        current: s.precision,
        min: s.minPrecision,
        max: s.maxPrecision,
        effectiveDecayRate: s.precisionDecayRateBase * this.getModifier('precisionDecay') * (s.isHighHeatActive ? 3 : 1),
      },
      rewind: {
        current: s.currentRewindEnergy,
        max: s.maxRewindEnergy,
        regenRate: s.rewindEnergyRegenRateBase * this.getModifier('rewindEnergyRegen'),
        isRewinding: s.isRewinding,
        canRewind: s.tutorialStage >= 3,
      },
      skillcheck: {
        active: s.isSkillcheckActive,
        zoneStart: s.skillcheckSuccessZonePos,
        zoneWidth: width,
        greatZoneStart: greatStart,
        greatZoneWidth: greatWidth,
        combo: s.skillcheckCombo,
        jammed: s.isWindJammed,
        jamRemainingMs: Math.max(0, s.windJamEndMs - performance.now()),
      },
      gears: s.gears,
      gearsUnlocked: s.tutorialStage >= 3,
      event: { current: s.currentEvent, remaining: s.eventDuration },
      stats: {
        clickPower: s.skillcheckSuccessBonusBase,
        autoWindPower: s.autoWindPowerBase,
        coolingRate: s.coolingPerRewindSecondBase,
        precisionDecayStat: s.precisionDecayRateBase * (s.isHighHeatActive ? 3 : 1),
      },
      upgrades,
      legacy: { cores: s.legacyCores, levels: s.legacyLevels },
      achievements: ACHIEVEMENT_DEFS.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        unlocked: s.achievementsUnlocked.has(a.id),
      })),
      settings: s.settings,
      hasSavedRun: s.hasSavedRun,
      floatingTexts: s.floatingTexts,
      lastRunCoresEarned: this.lastRunCoresEarned,
    };
    this.cachedSnapshot = snapshot;
    return snapshot;
  }
}
