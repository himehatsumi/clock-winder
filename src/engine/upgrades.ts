import type { GameEngine } from './GameEngine';
import type { UpgradeKey } from './types';

export interface UpgradeDef {
  key: UpgradeKey;
  name: string;
  requiredStage: number;
  apply: (engine: GameEngine) => void;
  describe: (engine: GameEngine) => string;
  hint: string;
}

export const UPGRADE_DEFS: UpgradeDef[] = [
  {
    key: 'click',
    name: 'Reinforced Spring',
    requiredStage: 2,
    hint: '+Winding Boost (+Heat/Wind)',
    apply: (e) => {
      e.state.skillcheckSuccessBonusBase += 0.08;
      e.state.heatPerSkillcheckBase *= 1.1;
    },
    describe: (e) => `Base wind: ${e.state.skillcheckSuccessBonusBase.toFixed(2)}s · Heat ~${e.state.heatPerSkillcheckBase.toFixed(2)}°`,
  },
  {
    key: 'auto',
    name: 'Self-Winding Gearbox',
    requiredStage: 3,
    hint: '+Auto-Winder (+Heat/Sec)',
    apply: (e) => {
      e.state.autoWindPowerBase += 0.005;
      e.state.heatPerAutoPowerBase *= 1.12;
    },
    describe: (e) => `Auto: ${e.state.autoWindPowerBase.toFixed(3)}s/s · Heat ~${e.state.heatPerAutoPowerBase.toFixed(2)}°/s`,
  },
  {
    key: 'rewindPower',
    name: 'Temporal Coolant',
    requiredStage: 3,
    hint: '+Rewind Power (+Cooling)',
    apply: (e) => {
      e.state.rewindPowerPerSecondBase += 0.3;
      e.state.coolingPerRewindSecondBase += 0.5;
    },
    describe: (e) => `Rewind: ${e.state.rewindPowerPerSecondBase.toFixed(2)}s/s · Cool ${e.state.coolingPerRewindSecondBase.toFixed(2)}°/s`,
  },
  {
    key: 'rewindMax',
    name: 'Aether Tank',
    requiredStage: 3,
    hint: '+Max Rewind Energy',
    apply: (e) => {
      e.state.maxRewindEnergy += 25;
      e.state.currentRewindEnergy += 25;
    },
    describe: (e) => `Max Energy: ${e.state.maxRewindEnergy.toFixed(0)}`,
  },
  {
    key: 'rewindRegen',
    name: 'Aetheric Siphon',
    requiredStage: 3,
    hint: '+Energy Regen',
    apply: (e) => {
      e.state.rewindEnergyRegenRateBase += 0.15;
    },
    describe: (e) => `Regen: ${e.state.rewindEnergyRegenRateBase.toFixed(2)} E/s`,
  },
  {
    key: 'gearSpawn',
    name: 'Loose Gear Collector',
    requiredStage: 3,
    hint: 'More Loose Gears Appear',
    apply: (e) => {
      e.state.gearSpawnChance += 0.05;
    },
    describe: (e) => `Spawn Rate: ${(e.state.gearSpawnChance * 100).toFixed(1)}%`,
  },
  {
    key: 'gearValue',
    name: 'Precision Gears',
    requiredStage: 3,
    hint: 'Gears give more Components',
    apply: (e) => {
      e.state.gearValueBase += 0.75;
    },
    describe: (e) => `Comp/Gear: ${e.state.gearValueBase.toFixed(2)}`,
  },
  {
    key: 'heatSink',
    name: 'Heat Sink Vents',
    requiredStage: 3,
    hint: '+Max Heat (+Passive Cooling)',
    apply: (e) => {
      e.state.maxHeat += 25;
      e.state.passiveCoolingRateBase += 0.06;
    },
    describe: (e) => `Max Heat: ${e.state.maxHeat.toFixed(0)}° · Passive ${e.state.passiveCoolingRateBase.toFixed(2)}°/s`,
  },
  {
    key: 'tuneEscapement',
    name: 'Tune Escapement',
    requiredStage: 4,
    hint: 'Slow Precision Decay Rate',
    apply: (e) => {
      e.state.precisionDecayRateBase *= 0.85;
    },
    describe: (e) => `Decay Factor: ${e.state.precisionDecayRateBase.toFixed(3)}%/s`,
  },
  {
    key: 'replaceParts',
    name: 'Replace Worn Parts',
    requiredStage: 4,
    hint: 'Increase Min. Precision Level',
    apply: (e) => {
      e.state.minPrecision = Math.min(95, e.state.minPrecision + 4);
    },
    describe: (e) => `Min Precision: ${e.state.minPrecision.toFixed(0)}%`,
  },
  {
    key: 'gauge',
    name: 'Calibrated Gauge',
    requiredStage: 4,
    hint: 'Widen Skillcheck Zone',
    apply: (e) => {
      e.state.skillcheckSuccessZoneWidthBase = Math.min(40, e.state.skillcheckSuccessZoneWidthBase + 1);
    },
    describe: (e) => `Zone Width: ${e.state.skillcheckSuccessZoneWidthBase.toFixed(0)}%`,
  },
  {
    key: 'eventChance',
    name: 'Stabilizer',
    requiredStage: 5,
    hint: 'Better Event Odds',
    apply: (e) => {
      e.state.goodEventBias = Math.min(0.85, e.state.goodEventBias + 0.06);
      e.state.baseEventChance *= 0.96;
    },
    describe: (e) => `Good Event Bias: ${(e.state.goodEventBias * 100).toFixed(0)}%`,
  },
  {
    key: 'cryo',
    name: 'Cryo-Stabilizers',
    requiredStage: 5,
    hint: 'Improve Cooling Rates',
    apply: (e) => {
      e.state.passiveCoolingRateBase += 0.03;
      e.state.coolingPerRewindSecondBase += 0.2;
    },
    describe: (e) => `Passive: ${e.state.passiveCoolingRateBase.toFixed(2)}°/s · Rewind ${e.state.coolingPerRewindSecondBase.toFixed(2)}°/s`,
  },
  {
    key: 'amplifier',
    name: 'Component Amplifier',
    requiredStage: 5,
    hint: 'Boost Component Gain',
    apply: (e) => {
      e.state.passiveTickRate += 0.02;
      e.state.skillcheckComponentBaseBase += 0.05;
      e.state.skillcheckComponentPerComboBase += 0.02;
    },
    describe: (e) => `Passive: ${e.state.passiveTickRate.toFixed(2)} C/s · Wind +${e.state.skillcheckComponentBaseBase.toFixed(2)}/+${e.state.skillcheckComponentPerComboBase.toFixed(2)} per combo`,
  },
  {
    key: 'dampener',
    name: 'Temporal Dampener',
    requiredStage: 5,
    hint: 'Shorten Bad Events',
    apply: (e) => {
      e.state.negativeEventDurationMultiplier = Math.max(0.5, e.state.negativeEventDurationMultiplier - 0.08);
    },
    describe: (e) => `Bad Event Time: x${e.state.negativeEventDurationMultiplier.toFixed(2)}`,
  },
];
