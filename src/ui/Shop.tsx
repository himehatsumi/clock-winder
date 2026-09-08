import { UPGRADE_DEFS } from '../engine/upgrades';
import { engine } from '../engine/singleton';
import { useSnapshot } from './hooks';

export default function UpgradeShop() {
  const snap = useSnapshot(engine);
  const visibleUpgrades = UPGRADE_DEFS.filter((def) => snap.upgrades[def.key].visible);
  if (visibleUpgrades.length === 0) return null;

  return (
    <div className="shop-panel">
      <h2>Workshop Blueprints</h2>
      <div className="upgrade-grid">
        {visibleUpgrades.map((def) => {
          const info = snap.upgrades[def.key];
          return (
            <div key={def.key} className="upgrade-card">
              <button
                className="upgrade-buy-button"
                disabled={!info.available}
                onClick={(e) => {
                  e.stopPropagation();
                  engine.buyUpgrade(def.key);
                }}
              >
                {def.name}
              </button>
              <div className="upgrade-cost">{info.cost} Comp.</div>
              <div className="upgrade-hint">{def.hint}</div>
              <div className="upgrade-desc">{def.describe(engine)}</div>
              {info.level > 0 && <div className="upgrade-level">Lv. {info.level}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
