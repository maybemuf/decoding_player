export const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

export type ParsedYouTubeUrl = { videoId: string; startFromUrl?: number; isShort: boolean };

/** YouTube `t=` / `start=` values: "42", "42s", "1m5s", "1h2m3s". */
export function parseTimeParam(t: string | null): number | undefined {
  if (!t) return undefined;
  const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/.exec(t);
  if (!m) return undefined;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

/** Accepts watch / youtu.be / shorts / embed / live URLs (any subdomain) or a bare 11-char ID. */
export function parseYouTubeUrl(input: string): ParsedYouTubeUrl | null {
  const s = input.trim();
  if (VIDEO_ID_RE.test(s)) return { videoId: s, isShort: false };

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www|m|music)\./, '');
  const [, first, second] = url.pathname.split('/');
  let id: string | null | undefined;
  let isShort = false;

  if (host === 'youtu.be') id = first;
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (first === 'watch') id = url.searchParams.get('v');
    else if (['shorts', 'embed', 'live', 'v'].includes(first)) {
      id = second;
      isShort = first === 'shorts';
    }
  }
  if (!id || !VIDEO_ID_RE.test(id)) return null;

  const startFromUrl = parseTimeParam(url.searchParams.get('t') ?? url.searchParams.get('start'));
  return startFromUrl === undefined
    ? { videoId: id, isShort }
    : { videoId: id, isShort, startFromUrl };
}
