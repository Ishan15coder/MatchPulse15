import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorCard from './ErrorCard';
import { useSimulation } from '../hooks/useSimulation';

interface Props {
  competition: string;
  season: number;
}

interface ProbBarProps {
  value: number; // 0–1
  className: string;
  label: string;
}

function ProbBar({ value, className, label }: ProbBarProps) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2" aria-label={`${label}: ${pct}%`}>
      <div className="prob-track flex-1">
        <div
          className={className}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <span className="text-xs font-medium tabular-nums w-9 text-right" style={{ color: 'var(--text-muted)' }}>
        {pct}%
      </span>
    </div>
  );
}

export default function SimulationTable({ competition, season }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { data, isPending, isError, error } = useSimulation(competition, season);
  const isUcl = competition === 'CL';

  if (isPending) return <LoadingSpinner label="Loading season outlook…" />;
  if (isError) return <ErrorCard message={(error as Error).message} />;
  if (!data || data.teams.length === 0) {
    return (
      <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
        No simulation data available for {season}/{String(season + 1).slice(2)}.
      </p>
    );
  }

  const runAt = data.run_at
    ? new Date(data.run_at).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  const visibleTeams = expanded ? data.teams : data.teams.slice(0, 8);

  return (
    <div>
      <div className="table-scroll">
        <table className="data-table" aria-label="Season outlook">
          <thead>
            <tr>
              <th className="w-8 text-center">#</th>
              <th>Team</th>
              <th className="text-right whitespace-nowrap">Pts now</th>
              <th className="text-right whitespace-nowrap">xPts</th>
              <th style={{ minWidth: 115 }} title={isUcl ? 'Finish 1st in the 36-team single table' : 'Win League Title'}>
                {isUcl ? 'Phase 1st' : 'Title'}
              </th>
              <th style={{ minWidth: 115 }} title={isUcl ? 'Direct qualification to Round of 16 (Ranks 1-8)' : 'Top 4 qualification'}>
                {isUcl ? 'Top 8 (R16)' : 'Top 4'}
              </th>
              <th style={{ minWidth: 115 }} title={isUcl ? 'Eliminated from competition (Ranks 25-36)' : 'Relegation to lower tier'}>
                {isUcl ? 'Eliminated' : 'Relegation'}
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleTeams.map((team, i) => (
              <tr key={team.team_id}>
                <td className="text-center font-medium" style={{ color: 'var(--text-muted)' }}>
                  {i + 1}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {team.crest_url && (
                      <img
                        src={team.crest_url}
                        alt={`${team.short_name ?? team.name} crest`}
                        className="w-5 h-5 object-contain shrink-0"
                        loading="lazy"
                      />
                    )}
                    <span className="font-medium">{team.short_name ?? team.name}</span>
                  </div>
                </td>
                <td className="text-right font-semibold">{team.points_now}</td>
                <td className="text-right font-semibold text-accent">{team.exp_points.toFixed(1)}</td>
                <td>
                  <ProbBar
                    value={team.p_title}
                    className="prob-fill"
                    label={isUcl ? 'Phase 1st probability' : 'Title probability'}
                  />
                </td>
                <td>
                  <ProbBar
                    value={team.p_top4}
                    className="prob-fill-top4"
                    label={isUcl ? 'Top 8 (R16) probability' : 'Top-4 probability'}
                  />
                </td>
                <td>
                  <ProbBar
                    value={team.p_relegation}
                    className="prob-fill-relg"
                    label={isUcl ? 'Elimination probability' : 'Relegation probability'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.teams.length > 8 && (
        <div className="mt-3 pt-3 border-t flex justify-center" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all hover:bg-emerald-500/10 hover:text-emerald-500"
            style={{
              background: 'color-mix(in srgb, var(--border) 40%, transparent)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          >
            <span>
              {expanded ? 'Show top 8 only' : `Show all ${data.teams.length} teams (${data.teams.length - 8} more)`}
            </span>
            <span aria-hidden="true">{expanded ? '↑' : '↓'}</span>
          </button>
        </div>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap gap-4 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        {runAt && <span>Last simulation run: {runAt}</span>}
        {data.n_sims != null && <span>{data.n_sims.toLocaleString()} simulations</span>}
        {isUcl && (
          <span className="text-amber-400 font-medium">
            UCL Single Table: Top 8 to R16, 9–24 to play-offs, 25–36 eliminated.
          </span>
        )}
        {isUcl && (
          <span className="text-amber-300/80">
            ⚠️ Experimental: CL ratings come from La Liga, Premier League, Serie A and CL
            matches only. Teams from other leagues (e.g. Bundesliga, Ligue 1) get a neutral
            rating. Illustrative, not a forecast.
          </span>
        )}
        <span className="italic">Model estimates, not predictions or advice.</span>
      </div>
    </div>
  );
}
