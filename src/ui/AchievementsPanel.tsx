import { engine } from '../engine/singleton';
import { useSnapshot } from './hooks';

export default function AchievementsPanel({ onClose }: { onClose: () => void }) {
  const snap = useSnapshot(engine);
  const unlockedCount = snap.achievements.filter((a) => a.unlocked).length;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            Achievements <span className="modal-header-count">{unlockedCount}/{snap.achievements.length}</span>
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <ul className="achievement-list">
          {snap.achievements.map((a) => (
            <li key={a.id} className={`achievement-row${a.unlocked ? ' is-unlocked' : ''}`}>
              <div className="achievement-row-name">{a.unlocked ? a.name : '???'}</div>
              <div className="achievement-row-desc">{a.unlocked ? a.description : 'Not yet discovered.'}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
