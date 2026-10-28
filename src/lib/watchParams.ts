import { VIDEO_ID_RE } from './youtube';

export type WatchParams = { videoId: string; start: number; end?: number; vertical: boolean };

// undefined = absent, NaN = present but not whole seconds
const toSeconds = (v: string | null) =>
  v === null ? undefined : /^\d+$/.test(v) ? Number(v) : NaN;

/** `#/watch` query -> validated params, or null if the link is broken. */
export function parseWatchParams(q: URLSearchParams): WatchParams | null {
  const videoId = q.get('v') ?? '';
  const start = toSeconds(q.get('start')) ?? 0;
  const end = toSeconds(q.get('end'));
  if (!VIDEO_ID_RE.test(videoId) || Number.isNaN(start)) return null;
  if (end !== undefined && !(end > start)) return null; // also rejects NaN
  return { videoId, start, end, vertical: q.get('ar') === 'v' };
}

export function buildShareLink(p: WatchParams, base = window.location.href.split('#')[0]): string {
  const q = new URLSearchParams({ v: p.videoId });
  if (p.start) q.set('start', String(p.start));
  if (p.end !== undefined) q.set('end', String(p.end));
  if (p.vertical) q.set('ar', 'v');
  return `${base}#/watch?${q}`;
}
