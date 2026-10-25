import LoadingSpinner from './LoadingSpinner';
import ErrorCard from './ErrorCard';
import { useCoverage } from '../hooks/useCoverage';

export default function CoveragePanel() {
  const { data, isPending, isError, error } = useCoverage();

  if (isPending) return <LoadingSpinner label="Loading data coverage…" />;
  if (isError) return <ErrorCard message={(error as Error).message} />;
  if (!data || (data.coverage.length === 0 && data.limitations.length === 0)) {
    return (
      <div className="card">
        <p className="section-title">Data & Limitations</p>
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
    <div className="card flex flex-col gap-4">
      <div>
        <p className="section-title mb-1">Data & Limitations</p>
        {formattedLatest && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Last ingested: <span className="font-medium">{formattedLatest}</span>
          </p>
        )}
      </div>

      {/* Coverage table / counts */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Match Coverage
        </p>
        <div className="divide-y text-xs" style={{ borderColor: 'var(--border)' }}>
          {data.coverage.map((row) => (
            <div
              key={`${row.competition_code}-${row.season}`}
              className="py-2 flex items-center justify-between gap-2"
            >
              <div>
                <span className="font-medium">{row.competition_name}</span>
                <span className="ml-1.5 opacity-60">
                  {row.season}/{String(row.season + 1).slice(2)}
                </span>
              </div>
              <div className="tabular-nums font-medium text-right">
                <span>{row.finished_count}</span>
                <span style={{ color: 'var(--text-muted)' }}> / {row.match_count} matches</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visible Limitations List — never collapsed, never in tooltip */}
      <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
          System Limitations
        </p>
        <ul className="space-y-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          {data.limitations.map((lim, index) => (
            <li key={index} className="flex items-start gap-2 leading-relaxed">
              <span className="text-accent shrink-0 select-none">•</span>
              <span>{lim}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
