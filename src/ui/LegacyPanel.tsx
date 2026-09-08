import { LEGACY_DEFS } from '../engine/legacy';
import { engine } from '../engine/singleton';
import { formatInt } from '../engine/format';
import { useSnapshot } from './hooks';

export default function LegacyPanel() {
  const snap = useSnapshot(engine);
  return (
    <div className="legacy-panel">
      <div className="legacy-header">
        <h3>Temporal Legacy</h3>
        <div className="legacy-cores">
          <span className="legacy-cores-value">{formatInt(snap.legacy.cores)}</span> Temporal Cores
        </div>
      </div>
      <p className="legacy-blurb">
        Every fallen clock leaves behind Temporal Cores, salvaged from its final score. Spend them here on permanent
        upgrades that carry into every future run.
      </p>
      <div className="legacy-grid">
        {LEGACY_DEFS.map((def) => {
          const level = snap.legacy.levels[def.key];
          const maxed = level >= def.maxLevel;
          const cost = engine.legacyUpgradeCost(def.key);
          const canAfford = !maxed && snap.legacy.cores >= cost;
          return (
            <div key={def.key} className={`legacy-card${maxed ? ' is-maxed' : ''}`}>
              <div className="legacy-card-name">{def.name}</div>
              <div className="legacy-card-hint">{def.hint}</div>
              <div className="legacy-card-level">
                {maxed ? `Mastered: ${def.describe(level)}` : `Next: ${def.describe(level + 1)}`}
              </div>
              <div className="legacy-card-owned">
                Lv. {level}/{def.maxLevel}
              </div>
              <button
                className="legacy-buy"
                disabled={!canAfford}
                onClick={() => engine.buyLegacyUpgrade(def.key)}
              >
                {maxed ? 'Mastered' : `${cost} Cores`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
