import { useEffect, useRef, type MouseEvent } from 'react';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { formatTime } from '../lib/time';

export const SEEK_STEP = 2; // single knob; could become a setting later
const RATES = [0.5, 0.75, 1];

// Mouse clicks shouldn't move focus onto buttons, so Space keeps meaning play/pause.
// Keyboard (Tab) focus is unaffected.
const keepFocus = (e: MouseEvent) => e.preventDefault();

type Props = { videoId: string; start?: number; end?: number; vertical?: boolean };

/** Player + segment progress + big controls + keyboard shortcuts. Used by watch page and preview. */
export function ClipPlayer({ videoId, start = 0, end, vertical = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p = useYouTubePlayer(containerRef, { videoId, start, end });
  const { seekBy, toggle, replay } = p;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      switch (e.key) {
        case 'ArrowLeft':
          seekBy(-SEEK_STEP);
          break;
        case 'ArrowRight':
          seekBy(SEEK_STEP);
          break;
        case ' ':
          if (target?.closest('button, a')) return; // let the focused control activate natively
          toggle();
          break;
        case 'r':
        case 'R':
          replay();
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [seekBy, toggle, replay]);

  const segEnd = end ?? p.duration;
  const pct =
    segEnd > start
      ? Math.min(100, Math.max(0, ((p.currentTime - start) / (segEnd - start)) * 100))
      : 0;

  return (
    <div className="clip">
      <div ref={containerRef} className={`player${vertical ? ' vertical' : ''}`} />
      {p.error && (
        <p className="error" role="alert">
          {p.error}
        </p>
      )}

      <div className="progress-row">
        <div
          className="progress"
          role="progressbar"
          aria-label="Clip progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
        >
          <div style={{ width: `${pct}%` }} />
        </div>
        <span className="muted time">
          {formatTime(p.currentTime)} / {formatTime(segEnd)}
        </span>
      </div>

      <div className="controls-main">
        <button
          className="btn"
          onMouseDown={keepFocus}
          onClick={() => seekBy(-SEEK_STEP)}
          disabled={!p.ready}
          aria-label={`Back ${SEEK_STEP} seconds`}
        >
          ⏪ {SEEK_STEP}s
        </button>
        <button
          className="btn btn-primary"
          onMouseDown={keepFocus}
          onClick={toggle}
          disabled={!p.ready}
          aria-label={p.isPlaying ? 'Pause' : 'Play'}
        >
          {p.isPlaying ? '❚❚ Pause' : '▶ Play'}
        </button>
        <button
          className="btn"
          onMouseDown={keepFocus}
          onClick={() => seekBy(SEEK_STEP)}
          disabled={!p.ready}
          aria-label={`Forward ${SEEK_STEP} seconds`}
        >
          {SEEK_STEP}s ⏩
        </button>
      </div>

      <div className="controls-extra">
        <button
          className="btn btn-small"
          onMouseDown={keepFocus}
          onClick={replay}
          disabled={!p.ready}
          aria-label="Replay clip from the start"
        >
          ↺ Replay clip
        </button>
        <div className="segmented" role="group" aria-label="Playback speed">
          {RATES.map((r) => (
            <button
              key={r}
              onMouseDown={keepFocus}
              onClick={() => p.setRate(r)}
              disabled={!p.ready}
              aria-pressed={p.rate === r}
              aria-label={`Speed ${r}x`}
            >
              {r}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
