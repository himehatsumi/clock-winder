import type { EventDef } from './types';
import type { GameEngine } from './GameEngine';

export const EVENT_DEFS: EventDef[] = [
  {
    id: 'aether_surge',
    type: 'good',
    name: 'Aether Surge',
    explanation: 'Instantly refills Rewind Energy.',
    duration: 8,
    modifiers: {},
    instant: (e: GameEngine) => {
      e.state.currentRewindEnergy = e.state.maxRewindEnergy;
    },
  },
  {
    id: 'gear_ejection',
    type: 'good',
    name: 'Gear Ejection',
    explanation: 'Grants bonus Components and Score.',
    duration: 5,
    modifiers: {},
    instant: (e: GameEngine) => {
      e.state.components += 10 + Math.floor(e.state.components * 0.05);
      e.state.score += 25;
    },
  },
  {
    id: 'momentary_stasis',
    type: 'good',
    name: 'Momentary Stasis',
    explanation: 'Time passes much slower.',
    duration: 6,
    modifiers: { timeProgression: 0.2 },
  },
  {
    id: 'cooling_breeze',
    type: 'good',
    name: 'Cooling Breeze',
    explanation: 'Greatly increases passive cooling.',
    duration: 10,
    modifiers: { passiveCooling: 4 },
  },
  {
    id: 'efficient_winding',
    type: 'good',
    name: 'Efficient Winding',
    explanation: 'Reduces heat gained from winding.',
    duration: 12,
    modifiers: { heatPerSkillcheck: 0.6 },
  },
  {
    id: 'temporal_duplicate',
    type: 'good',
    name: 'Temporal Duplicate',
    explanation: 'Winding actions are twice as effective (time & components).',
    duration: 10,
    modifiers: { skillcheckSuccessBonus: 2, componentGain: 2 },
  },
  {
    id: 'polished_pistons',
    type: 'good',
    name: 'Polished Pistons',
    explanation: 'Skillchecks generate no heat, and precision decays half as fast.',
    duration: 15,
    modifiers: { heatPerSkillcheck: 0, precisionDecay: 0.5 },
  },
  {
    id: 'temporal_warp',
    type: 'bad',
    name: 'Temporal Warp',
    explanation: 'Time passes faster.',
    duration: 7,
    modifiers: { timeProgression: 1.5 },
  },
  {
    id: 'mainspring_loss',
    type: 'bad',
    name: 'Mainspring Tension Loss',
    explanation: 'Reduces time gained from winding.',
    duration: 8,
    modifiers: { skillcheckSuccessBonus: 0.7 },
  },
  {
    id: 'heat_spike',
    type: 'bad',
    name: 'Heat Spike',
    explanation: 'Instantly gain 15 Heat.',
    duration: 5,
    modifiers: {},
    instant: (e: GameEngine) => {
      e.state.currentHeat = Math.min(e.state.maxHeat, e.state.currentHeat + 15);
    },
  },
  {
    id: 'aether_leak',
    type: 'bad',
    name: 'Aether Leak',
    explanation: 'Greatly reduces Rewind Energy regen.',
    duration: 8,
    modifiers: { rewindEnergyRegen: 0.4 },
  },
  {
    id: 'gear_friction',
    type: 'bad',
    name: 'Increased Gear Friction',
    explanation: 'Reduces Auto-Winder effectiveness.',
    duration: 10,
    modifiers: { autoWindPower: 0.5 },
  },
  {
    id: 'grinding_gears',
    type: 'bad',
    name: 'Grinding Gears',
    explanation: 'The skillcheck zone shrinks and the indicator speeds up.',
    duration: 12,
    modifiers: { skillcheckZoneWidth: 0.7, skillcheckSpeed: 0.75 },
  },
  {
    id: 'energy_siphon',
    type: 'bad',
    name: 'Energy Siphon',
    explanation: 'Rewind energy cost is doubled.',
    duration: 10,
    modifiers: { rewindEnergyCost: 2 },
  },
  {
    id: 'chronal_instability',
    type: 'bad',
    name: 'Chronal Instability',
    explanation: 'The flow of time becomes unpredictable and faster.',
    duration: 10,
    modifiers: { timeProgression: 2.0 },
  },
];
