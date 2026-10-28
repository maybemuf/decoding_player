/** "75", "1:15", "01:15", "1:02:03" -> seconds. null if invalid. */
export function parseTime(input: string): number | null {
  const s = input.trim();
  if (!/^\d+(:\d{2}){0,2}$/.test(s)) return null;
  const parts = s.split(':').map(Number);
  if (parts.slice(1).some((p) => p >= 60)) return null;
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

/** 65 -> "1:05", 3723 -> "1:02:03". */
export function formatTime(seconds: number): string {
  const t = Math.max(0, Math.floor(seconds));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const ss = String(t % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}
