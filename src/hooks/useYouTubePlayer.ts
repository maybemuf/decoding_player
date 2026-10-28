import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';

declare global {
  interface Window {
    YT?: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<typeof YT> | null = null;

/** Injects the IFrame API script once; every caller shares the same promise. */
function loadYouTubeApi(): Promise<typeof YT> {
  apiPromise ??= new Promise((resolve, reject) => {
    if (window.YT?.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT!);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => {
      apiPromise = null; // allow a retry on next mount
      script.remove();
      reject(new Error('iframe_api failed to load'));
    };
    document.head.append(script);
  });
  return apiPromise;
}

const ERRORS: Record<number, string> = {
  2: 'This link has an invalid video ID.',
  5: "This video can't be played in your browser.",
  100: 'This video was not found or is private.',
  101: "The owner of this video doesn't allow it to be played on other sites.",
  150: "The owner of this video doesn't allow it to be played on other sites.",
};

type Args = { videoId: string; start?: number; end?: number };

/**
 * Creates a player inside `containerRef` and keeps playback within [start, end].
 * start/end are read live from a ref, so changing them never rebuilds the player;
 * the clamp below enforces the new segment (we don't pass `end` as a playerVar,
 * since YouTube would keep stopping at the old value).
 */
export function useYouTubePlayer(
  containerRef: RefObject<HTMLDivElement>,
  { videoId, start = 0, end }: Args,
) {
  const playerRef = useRef<YT.Player | null>(null); // set only once the player is ready
  const seg = useRef({ start, end });
  seg.current = { start, end };

  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(start);
  const [duration, setDuration] = useState(0);
  const [rate, setRateState] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;
    let cancelled = false;
    let player: YT.Player | undefined;
    setReady(false);
    setIsPlaying(false);
    setError(null);
    setRateState(1);
    setCurrentTime(seg.current.start);

    // YT replaces this element with its iframe, so it must not be React-managed.
    const el = document.createElement('div');
    host.append(el);

    loadYouTubeApi().then(
      (api) => {
        if (cancelled) return;
        player = new api.Player(el, {
          videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            start: seg.current.start,
            rel: 0,
            playsinline: 1,
            modestbranding: 1,
            controls: 1,
          },
          events: {
            onReady: (e) => {
              playerRef.current = e.target;
              setDuration(e.target.getDuration());
              setReady(true);
            },
            onStateChange: (e) => {
              const playing = e.data === api.PlayerState.PLAYING;
              // Play pressed at/after the end (our button or YouTube's) -> restart the clip.
              const { start, end } = seg.current;
              if (playing && end !== undefined && e.target.getCurrentTime() >= end - 0.3) {
                e.target.seekTo(start, true);
              }
              setIsPlaying(playing);
            },
            onError: (e) => setError(ERRORS[e.data] ?? 'Something went wrong playing this video.'),
          },
        });
      },
      () => {
        if (!cancelled)
          setError('Could not load the YouTube player. Check your connection or ad blocker.');
      },
    );

    return () => {
      cancelled = true;
      playerRef.current = null;
      player?.destroy();
      host.replaceChildren();
    };
  }, [containerRef, videoId]);

  // Clamp to the segment while playing; also catches scrubbing via YouTube's own bar.
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      const { start, end } = seg.current;
      let t = p.getCurrentTime();
      if (end !== undefined && t >= end) {
        p.pauseVideo();
        p.seekTo(end, true);
        t = end;
      } else if (t < start - 0.5) {
        p.seekTo(start, true);
        t = start;
      }
      setCurrentTime(t);
      setDuration(p.getDuration());
    }, 200);
    return () => clearInterval(id);
  }, [isPlaying]);

  // Stable identities, so keyboard listeners etc. don't resubscribe on every poll tick.
  const controls = useMemo(() => {
    const get = () => playerRef.current;
    return {
      play: () => get()?.playVideo(),
      pause: () => get()?.pauseVideo(),
      toggle: () => {
        const p = get();
        if (!p) return;
        if (p.getPlayerState() === window.YT!.PlayerState.PLAYING) p.pauseVideo();
        else p.playVideo();
      },
      /** Keeps play/pause state; never leaves the segment. */
      seekBy: (delta: number) => {
        const p = get();
        if (!p) return;
        const { start, end } = seg.current;
        const max = end ?? p.getDuration();
        const t = Math.min(Math.max(p.getCurrentTime() + delta, start), max);
        p.seekTo(t, true);
        setCurrentTime(t);
      },
      replay: () => {
        const p = get();
        if (!p) return;
        p.seekTo(seg.current.start, true);
        p.playVideo();
        setCurrentTime(seg.current.start);
      },
      setRate: (r: number) => {
        get()?.setPlaybackRate(r);
        setRateState(r);
      },
    };
  }, []);

  return { ready, isPlaying, currentTime, duration, rate, error, ...controls };
}
