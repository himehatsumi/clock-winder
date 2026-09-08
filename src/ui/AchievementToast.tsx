export default function AchievementToast({ name }: { name: string }) {
  return (
    <div className="achievement-toast">
      <span className="achievement-toast-label">Achievement Unlocked</span>
      <strong>{name}</strong>
    </div>
  );
}
