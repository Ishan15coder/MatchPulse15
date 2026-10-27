import LoadingSpinner from './LoadingSpinner';
import ErrorCard from './ErrorCard';
import { useSimulation } from '../hooks/useSimulation';

interface Props {
  competition: string;
  season: number;
}

export default function TitleRaceCard({ competition, season }: Props) {
  const { data, isPending, isError, error } = useSimulation(competition, season);
  const isUcl = competition === 'CL';

  if (isPending) return <LoadingSpinner label="Loading title race…" />;
  if (isError) return <ErrorCard message={(error as Error).message} />;
  if (!data || data.teams.length === 0) {
    return null;
  }

  const top3 = [...data.teams]
    .sort((a, b) => b.p_title - a.p_title)
    .slice(0, 3);

  return (
    <div className="card flex flex-col gap-4">
      <div>
        <p className="section-title mb-1">
          {isUcl ? 'League Phase Leader' : 'Title Race'}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {isUcl
            ? 'Top contenders to finish #1 in the 36-team single table'
            : 'Top contenders by championship probability'}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {top3.map((team, index) => {
          const pct = Math.round(team.p_title * 100);
          return (
            <div
              key={team.team_id}
              className="p-3 rounded-xl border flex flex-col gap-2"
              style={{
                borderColor: 'var(--border)',
                background: 'color-mix(in srgb, var(--bg-card) 95%, var(--border) 5%)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-5 text-center text-xs font-bold shrink-0"
                    style={{ color: index === 0 ? '#10b981' : 'var(--text-muted)' }}
                  >
                    #{index + 1}
                  </span>
                  {team.crest_url && (
                    <img
                      src={team.crest_url}
                      alt={`${team.short_name ?? team.name} crest`}
                      className="w-5 h-5 object-contain shrink-0"
                      loading="lazy"
                    />
                  )}
                  <span className="font-semibold text-sm truncate">
                    {team.short_name ?? team.name}
                  </span>
                </div>
                <span className="text-sm font-bold tabular-nums text-accent">
                  {pct}%
                </span>
              </div>

              {/* Probability bar */}
              <div className="prob-track">
                <div
                  className="prob-fill"
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${team.short_name ?? team.name} title probability: ${pct}%`}
                />
              </div>

              {/* Sub-stats */}
              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>Pts now: <strong style={{ color: 'var(--text-primary)' }}>{team.points_now}</strong></span>
                <span>xPts: <strong style={{ color: 'var(--text-primary)' }}>{team.exp_points.toFixed(1)}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs italic pt-1" style={{ color: 'var(--text-muted)' }}>
        Model estimates, not predictions or advice.
      </p>
    </div>
  );
}
