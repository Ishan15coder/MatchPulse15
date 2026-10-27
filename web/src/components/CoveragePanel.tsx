import LoadingSpinner from './LoadingSpinner';
import ErrorCard from './ErrorCard';
import { useCoverage } from '../hooks/useCoverage';

interface Props {
  onClose?: () => void;
}

export default function CoveragePanel({ onClose }: Props) {
  const { data, isPending, isError, error } = useCoverage();

  if (isPending) return <LoadingSpinner label="Loading data coverage…" />;
  if (isError) return <ErrorCard message={(error as Error).message} />;
  if (!data || (data.coverage.length === 0 && data.limitations.length === 0)) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="section-title mb-0">Data & Limitations</p>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>
          No coverage metadata available.
        </p>
      </div>
    );
  }

  // Find latest ingested date across all coverage records
  const latestIngested = data.coverage.reduce<string | null>((latest, r) => {
    if (!r.last_ingested) return latest;
    if (!latest) return r.last_ingested;
    return new Date(r.last_ingested) > new Date(latest) ? r.last_ingested : latest;
  }, null);

  const formattedLatest = latestIngested
    ? new Date(latestIngested).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Data & Limitations
          </h2>
          {formattedLatest && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Last ingested: <span className="font-medium">{formattedLatest}</span>
            </p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors text-lg focus:outline-none focus:ring-2 focus:ring-accent"
          >
            ✕
          </button>
        )}
      </div>

      {/* Coverage table / counts */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Match Coverage
        </p>
        <div className="divide-y text-xs border rounded-xl px-3" style={{ borderColor: 'var(--border)' }}>
          {data.coverage.map((row) => (
            <div
              key={`${row.competition_code}-${row.season}`}
              className="py-2.5 flex items-center justify-between gap-2"
              style={{ borderColor: 'var(--border)' }}
            >
              <div>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {row.competition_name}
                </span>
                <span className="ml-1.5 opacity-60" style={{ color: 'var(--text-muted)' }}>
                  {row.season}/{String(row.season + 1).slice(2)}
                </span>
              </div>
              <div className="tabular-nums font-medium text-right">
                <span style={{ color: 'var(--text-primary)' }}>{row.finished_count}</span>
                <span style={{ color: 'var(--text-muted)' }}> / {row.match_count} matches</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visible Limitations List */}
      <div className="pt-2">
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
          System Limitations
        </p>
        <ul className="space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          {data.limitations.map((lim, index) => (
            <li key={index} className="flex items-start gap-2 leading-relaxed">
              <span className="text-accent shrink-0 select-none font-bold">•</span>
              <span>{lim}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
