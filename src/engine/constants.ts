export const STARTING_SECONDS_BEFORE_MIDNIGHT = 5 * 60;
export const MAX_DELTA_TIME = 0.15;

export const BASE_SKILLCHECK_DURATION = 0.85;
export const MIN_SKILLCHECK_DURATION = 0.15;
export const SKILLCHECK_FAIL_JAM_DURATION = 2.0;
export const BASE_SKILLCHECK_SUCCESS_ZONE_WIDTH = 20;
export const GREAT_SUCCESS_ZONE_WIDTH_RATIO = 0.25;
export const MAX_COMBO_MULTIPLIER = 4.0;
export const COMBO_MULTIPLIER_STEP = 0.15;
export const SKILLCHECK_SCORE_BONUS = 10;

export const HIGH_HEAT_THRESHOLD_PERCENT = 0.8;
export const HEAT_JAM_CHANCE = 0.05;

export const EVENT_CHECK_INTERVAL = 20.0;

export const BASE_PASSIVE_TICK_RATE = 0.1;

// Reward multiplier caps at combo 21 (1.0 + (21-1)*0.15 = 4.0 = MAX_COMBO_MULTIPLIER); skillcheck
// sweep speed shouldn't keep compounding past that point, or difficulty and reward decouple.
export const MAX_REWARD_COMBO = Math.round(1 + (MAX_COMBO_MULTIPLIER - 1) / COMBO_MULTIPLIER_STEP);

// Tutorial stages 0-4 advance when the player does the taught action (see GameEngine's
// advanceTutorial); these are safety-net ceilings (seconds spent in that stage) so nobody
// gets soft-locked. Stage 5 is free play and has no fallback.
export const TUTORIAL_STAGE_FALLBACK_SECONDS = [25, 30, 35, 40, 20];

// What each stage 0-4 spotlights (dims the rest of the screen, glows this one); null = no spotlight.
export const TUTORIAL_SPOTLIGHT_TARGETS: (string | null)[] = [
  'wind-button',
  'heat-panel',
  'upgrade-click',
  'rewind-control',
  'precision-panel',
  null,
];

export const COST_MULTIPLIERS: Record<string, number> = {
  click: 1.5,
  auto: 1.65,
  rewindMax: 1.6,
  rewindRegen: 1.75,
  rewindPower: 1.8,
  heatSink: 1.85,
  gearSpawn: 1.55,
  gearValue: 1.7,
  eventChance: 1.95,
  tuneEscapement: 1.75,
  replaceParts: 2.0,
  cryo: 1.7,
  gauge: 1.6,
  amplifier: 1.9,
  dampener: 1.85,
};

export const BASE_UPGRADE_COSTS: Record<string, number> = {
  click: 10,
  auto: 35,
  rewindMax: 30,
  rewindRegen: 45,
  rewindPower: 50,
  heatSink: 60,
  gearSpawn: 30,
  gearValue: 45,
  eventChance: 75,
  tuneEscapement: 70,
  replaceParts: 90,
  cryo: 55,
  gauge: 40,
  amplifier: 65,
  dampener: 80,
};

export const LEGACY_COST_MULTIPLIERS: Record<string, number> = {
  startComponents: 1.6,
  heatCapacity: 1.7,
  precisionFloor: 1.8,
  zoneWidth: 1.9,
  coreGain: 2.1,
  startEnergy: 1.7,
};

export const LEGACY_BASE_COSTS: Record<string, number> = {
  startComponents: 3,
  heatCapacity: 4,
  precisionFloor: 5,
  zoneWidth: 6,
  coreGain: 8,
  startEnergy: 4,
};

export const SAVE_KEY = 'clockwinder:save:v1';
export const LEGACY_KEY = 'clockwinder:legacy:v1';
export const SETTINGS_KEY = 'clockwinder:settings:v1';
