export type UpgradeKey =
  | 'click'
  | 'auto'
  | 'rewindPower'
  | 'rewindMax'
  | 'rewindRegen'
  | 'gearSpawn'
  | 'gearValue'
  | 'heatSink'
  | 'eventChance'
  | 'tuneEscapement'
  | 'replaceParts'
  | 'cryo'
  | 'gauge'
  | 'amplifier'
  | 'dampener';

export type LegacyKey =
  | 'startComponents'
  | 'heatCapacity'
  | 'precisionFloor'
  | 'zoneWidth'
  | 'coreGain'
  | 'startEnergy';

export type EventType = 'good' | 'bad';

export type ModifierKey =
  | 'timeProgression'
  | 'heatPerSkillcheck'
  | 'autoWindPower'
  | 'skillcheckSuccessBonus'
  | 'rewindEnergyRegen'
  | 'rewindEnergyCost'
  | 'passiveCooling'
  | 'precisionDecay'
  | 'skillcheckZoneWidth'
  | 'skillcheckSpeed'
  | 'componentGain';

export interface EventDef {
  id: string;
  type: EventType;
  name: string;
  explanation: string;
  duration: number;
  modifiers: Partial<Record<ModifierKey, number>>;
  instant?: (engine: import('./GameEngine').GameEngine) => void;
}

export interface GearInstance {
  id: number;
  x: number;
  y: number;
  bornAt: number;
  lifetime: number;
  collected: boolean;
}

export interface FloatingTextInstance {
  id: number;
  x: number;
  y: number;
  text: string;
  kind: 'time' | 'score' | 'components' | 'heat' | 'bad';
  createdAt: number;
}

export type CueKind =
  | 'windSuccess'
  | 'windGreatSuccess'
  | 'windFail'
  | 'gearCollect'
  | 'overheatStart'
  | 'overheatEnd'
  | 'eventGood'
  | 'eventBad'
  | 'jam'
  | 'upgrade'
  | 'gameOver'
  | 'prestige'
  | 'achievement';

export interface Cue {
  kind: CueKind;
  at: number;
}

export type GameStatus = 'intro' | 'running' | 'gameOver';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  check: (engine: import('./GameEngine').GameEngine) => boolean;
}

export interface Snapshot {
  status: GameStatus;
  tutorialStage: number;
  tutorialSpotlightTarget: string | null;
  gameTimeSeconds: number;
  startingSeconds: number;
  score: number;
  components: number;
  best: { score: number; survivalSeconds: number };
  heat: {
    current: number;
    max: number;
    overheatThreshold: number;
    isOverheating: boolean;
    isHighHeat: boolean;
  };
  precision: {
    current: number;
    min: number;
    max: number;
    effectiveDecayRate: number;
  };
  rewind: {
    current: number;
    max: number;
    regenRate: number;
    isRewinding: boolean;
    canRewind: boolean;
  };
  skillcheck: {
    active: boolean;
    zoneStart: number;
    zoneWidth: number;
    greatZoneStart: number;
    greatZoneWidth: number;
    combo: number;
    jammed: boolean;
    jamRemainingMs: number;
  };
  gears: GearInstance[];
  gearsUnlocked: boolean;
  event: { current: EventDef | null; remaining: number };
  stats: {
    clickPower: number;
    autoWindPower: number;
    coolingRate: number;
    precisionDecayStat: number;
  };
  upgrades: Record<UpgradeKey, { cost: number; level: number; available: boolean; visible: boolean }>;
  legacy: { cores: number; levels: Record<LegacyKey, number> };
  achievements: { id: string; name: string; description: string; unlocked: boolean }[];
  settings: { muted: boolean; reducedMotion: boolean };
  hasSavedRun: boolean;
  floatingTexts: FloatingTextInstance[];
  lastRunCoresEarned: number;
}
