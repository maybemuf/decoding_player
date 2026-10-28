import { Link, useSearchParams } from 'react-router-dom';
import { ClipPlayer } from '../components/ClipPlayer';
import { formatTime } from '../lib/time';
import { parseWatchParams } from '../lib/watchParams';

export default function WatchPage() {
  const [search] = useSearchParams();
  const params = parseWatchParams(search);

  if (!params) {
    return (
      <main className="page">
        <section className="card">
          <h1>This clip link doesn't work</h1>
          <p className="muted">
            It's missing a valid video or has wrong times. Ask for a new link.
          </p>
          <Link className="btn btn-primary" to="/">
            Make a clip link
          </Link>
        </section>
      </main>
    );
  }

  const { videoId, start, end, vertical } = params;
  const title =
    end !== undefined
      ? `Clip ${formatTime(start)} – ${formatTime(end)}`
      : start
        ? `From ${formatTime(start)}`
        : 'Full video';

  return (
    <main className={`page watch${vertical ? ' vertical' : ''}`}>
      <h1>{title}</h1>
      <section className="card">
        <ClipPlayer key={videoId} videoId={videoId} start={start} end={end} vertical={vertical} />
      </section>
      <p className="muted hint">Keys: ← / → jump 2 s · Space play/pause · R replay</p>
    </main>
  );
}
