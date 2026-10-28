import { useState } from 'react';
import { ClipPlayer } from '../components/ClipPlayer';
import { CopyField } from '../components/CopyField';
import { formatTime, parseTime } from '../lib/time';
import { buildShareLink } from '../lib/watchParams';
import { parseYouTubeUrl } from '../lib/youtube';

const TIME_HINT = 'Use a time like 75, 1:15 or 1:02:03.';

export default function GeneratorPage() {
  const [url, setUrl] = useState('');
  const [trim, setTrim] = useState(false);
  const [startStr, setStartStr] = useState('0:00');
  const [endStr, setEndStr] = useState('');
  const [vertical, setVertical] = useState(false);

  const parsed = parseYouTubeUrl(url);

  function onUrlChange(value: string) {
    setUrl(value);
    const next = parseYouTubeUrl(value);
    if (!next || next.videoId === parsed?.videoId) return; // only react to a new video
    setVertical(next.isShort);
    if (next.startFromUrl !== undefined) setStartStr(formatTime(next.startFromUrl));
  }

  const start = trim ? parseTime(startStr) : 0;
  const end = trim ? parseTime(endStr) : undefined;
  // Errors only for fields the teacher has typed into.
  const startError = trim && startStr && start === null ? TIME_HINT : '';
  const endError =
    trim && endStr
      ? end === null
        ? TIME_HINT
        : start !== null && end! <= start
          ? 'End must be after start.'
          : ''
      : '';
  const trimValid = !trim || (start !== null && end != null && end > start);

  const params =
    parsed && trimValid
      ? { videoId: parsed.videoId, start: start ?? 0, end: end ?? undefined, vertical }
      : null;
  const shareLink = params && buildShareLink(params);

  return (
    <main className="page">
      <header>
        <h1>Clip Player</h1>
        <p className="muted">Paste a YouTube link, pick a part, and share it with students.</p>
      </header>

      <section className="card">
        <h2>1. Paste a link</h2>
        <div className="field">
          <label htmlFor="yt-url">YouTube video or Short</label>
          <input
            id="yt-url"
            type="text"
            inputMode="url"
            autoComplete="off"
            placeholder="https://www.youtube.com/watch?v=…"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            aria-invalid={!!url && !parsed}
            aria-describedby="yt-url-error"
          />
          <p id="yt-url-error" className="error">
            {url && !parsed ? "That doesn't look like a YouTube link." : ''}
          </p>
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={vertical}
            onChange={(e) => setVertical(e.target.checked)}
          />
          Vertical layout (Shorts)
        </label>
      </section>

      <section className="card">
        <h2>2. Trim</h2>
        <div className="segmented" role="group" aria-label="Trim mode">
          <button aria-pressed={!trim} onClick={() => setTrim(false)}>
            Play whole video
          </button>
          <button aria-pressed={trim} onClick={() => setTrim(true)}>
            Play a part
          </button>
        </div>
        {trim && (
          <div className="grid2">
            <div className="field">
              <label htmlFor="start">Start</label>
              <input
                id="start"
                type="text"
                placeholder="0:30"
                value={startStr}
                onChange={(e) => setStartStr(e.target.value)}
                aria-invalid={!!startError}
                aria-describedby="start-error"
              />
              <p id="start-error" className="error">
                {startError}
              </p>
            </div>
            <div className="field">
              <label htmlFor="end">End</label>
              <input
                id="end"
                type="text"
                placeholder="1:15"
                value={endStr}
                onChange={(e) => setEndStr(e.target.value)}
                aria-invalid={!!endError}
                aria-describedby="end-error"
              />
              <p id="end-error" className="error">
                {endError}
              </p>
            </div>
          </div>
        )}
      </section>

      {parsed && (
        <section className="card">
          <h2>3. Preview</h2>
          <ClipPlayer
            key={parsed.videoId}
            videoId={parsed.videoId}
            start={params?.start}
            end={params?.end}
            vertical={vertical}
          />
        </section>
      )}

      {shareLink && (
        <section className="card">
          <h2>4. Share</h2>
          <CopyField label="Link for students" value={shareLink} />
          <a className="btn" href={shareLink} target="_blank" rel="noopener noreferrer">
            Open in new tab ↗
          </a>
        </section>
      )}
    </main>
  );
}
