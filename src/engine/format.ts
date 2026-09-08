export function getTimeDescription(totalSeconds: number): string {
  if (totalSeconds <= 0) return 'It is midnight';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  let desc = 'It is ';
  if (minutes > 0) {
    desc += `${minutes} minute${minutes > 1 ? 's' : ''}`;
    if (seconds > 0) desc += ` and ${seconds} second${seconds > 1 ? 's' : ''}`;
  } else {
    desc += `${seconds} second${seconds > 1 ? 's' : ''}`;
  }
  desc += ' to midnight';
  return desc;
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export function formatInt(n: number): string {
  return Math.floor(n).toLocaleString('en-US');
}
