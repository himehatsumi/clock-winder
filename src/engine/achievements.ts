import type { AchievementDef } from './types';

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: 'first_wind',
    name: 'First Turn',
    description: 'Successfully complete a skillcheck.',
    check: (e) => e.state.lifetimeSuccessfulWinds >= 1,
  },
  {
    id: 'combo_10',
    name: 'Steady Hands',
    description: 'Reach a x10 winding combo.',
    check: (e) => e.state.skillcheckCombo >= 10,
  },
  {
    id: 'combo_25',
    name: 'Clockwork Precision',
    description: 'Reach a x25 winding combo.',
    check: (e) => e.state.skillcheckCombo >= 25,
  },
  {
    id: 'survive_10min',
    name: 'Borrowed Time',
    description: 'Bank 10 minutes of buffer before midnight in a single run.',
    check: (e) => e.state.gameTimeSeconds >= 10 * 60,
  },
  {
    id: 'overheat_once',
    name: 'Too Hot to Handle',
    description: 'Let the mechanism overheat.',
    check: (e) => e.state.lifetimeOverheats >= 1,
  },
  {
    id: 'overheat_10',
    name: 'Playing With Fire',
    description: 'Overheat the mechanism 10 times.',
    check: (e) => e.state.lifetimeOverheats >= 10,
  },
  {
    id: 'gears_100',
    name: 'Gear Collector',
    description: 'Collect 100 loose gears.',
    check: (e) => e.state.lifetimeGearsCollected >= 100,
  },
  {
    id: 'score_10000',
    name: 'Master Custodian',
    description: 'Reach a score of 10,000 in a single run.',
    check: (e) => e.state.score >= 10000,
  },
  {
    id: 'first_prestige',
    name: 'The Cycle Continues',
    description: 'Earn Temporal Cores for the first time.',
    check: (e) => e.state.legacyCores > 0 || e.state.lifetimeCoresEarned > 0,
  },
  {
    id: 'great_success_5',
    name: 'Perfect Timing',
    description: 'Land 5 Great Successes in a row.',
    check: (e) => e.state.greatSuccessCombo >= 5,
  },
  {
    id: 'all_upgrades',
    name: 'Fully Restored',
    description: 'Purchase every upgrade at least once in a single run.',
    check: (e) => Object.values(e.state.upgradeLevels).every((lvl) => lvl >= 1),
  },
  {
    id: 'survive_events',
    name: 'Weathered the Storm',
    description: 'Live through 10 random events in a single run.',
    check: (e) => e.state.lifetimeEventsThisRun >= 10,
  },
];
