import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorCard from './ErrorCard';
import { useStandings } from '../hooks/useStandings';
import { useSimulation } from '../hooks/useSimulation';

interface Props {
  competition: string;
  season: number;
}

export default function StandingsTable({ competition, season }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { data, isPending, isError, error } = useStandings(competition, season);
  const { data: simData } = useSimulation(competition, season);

  if (isPending) return <LoadingSpinner label="Loading league table…" />;
  if (isError) return <ErrorCard message={(error as Error).message} />;
  if (!data || data.length === 0) {
    return (
      <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
        No standings data available for {season}/{String(season + 1).slice(2)}.
      </p>
    );
  }

  // Crest lookup from simulation data
  const crestMap = new Map<string, string | null>();
  if (simData?.teams) {
    for (const team of simData.teams) {
      if (team.crest_url) {
        crestMap.set(team.name, team.crest_url);
        if (team.short_name) {
          crestMap.set(team.short_name, team.crest_url);
        }
      }
    }
  }

  const visibleData = expanded ? data : data.slice(0, 8);

  return (
    <div>
      <div className="table-scroll">
        <table className="data-table" aria-label="League table">
          <thead>
            <tr>
              <th className="w-8 text-center">#</th>
              <th>Team</th>
              <th className="text-center">P</th>
              <th className="text-center">W</th>
              <th className="text-center">D</th>
              <th className="text-center">L</th>
              <th className="text-right">GD</th>
              <th className="text-right font-semibold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {visibleData.map((row, i) => {
              const crest = crestMap.get(row.name);
              return (
                <tr key={row.name}>
                  <td className="text-center font-medium" style={{ color: 'var(--text-muted)' }}>
                    {i + 1}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {crest && (
                        <img
                          src={crest}
                          alt={`${row.name} crest`}
                          className="w-5 h-5 object-contain shrink-0"
                          loading="lazy"
                        />
                      )}
                      <span className="font-medium">{row.name}</span>
                    </div>
                  </td>
                  <td className="text-center tabular-nums">{row.played}</td>
                  <td className="text-center tabular-nums">{row.won}</td>
                  <td className="text-center tabular-nums">{row.drawn}</td>
                  <td className="text-center tabular-nums">{row.lost}</td>
                  <td className="text-right tabular-nums">
                    {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                  </td>
                  <td className="text-right font-semibold tabular-nums text-accent">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length > 8 && (
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
              {expanded ? 'Show top 8 only' : `Show all ${data.length} teams (${data.length - 8} more)`}
            </span>
            <span aria-hidden="true">{expanded ? '↑' : '↓'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
