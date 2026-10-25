import { useState } from 'react';
import { useUpcomingMatches } from '../hooks/useUpcomingMatches';

interface Props {
  competition: string;
  season: number;
}

export default function MarqueeFixtureCard({ competition, season }: Props) {
  const { data: matches, isPending, isError } = useUpcomingMatches(competition, season, 10);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isPending) {
    return (
      <div className="w-full rounded-2xl p-6 animate-pulse" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="h-4 w-32 bg-slate-700/40 rounded mb-4" />
        <div className="h-16 w-full bg-slate-700/20 rounded" />
      </div>
    );
  }

  if (isError || !matches || matches.length === 0) {
    return null; // Don't show if there are no upcoming matches
  }

  // Ensure index within bounds if competition changes
  const activeIndex = currentIndex >= matches.length ? 0 : currentIndex;
  const match = matches[activeIndex];

  // Authentic model match odds from Poisson simulation (if available for this competition/fixture)
  const hasProbabilities =
    match.prob_home != null &&
    match.prob_draw != null &&
    match.prob_away != null;

  const homePct = hasProbabilities ? Math.round(match.prob_home! * 100) : 0;
  const drawPct = hasProbabilities ? Math.round(match.prob_draw! * 100) : 0;
  const awayPct = hasProbabilities ? Math.max(0, 100 - homePct - drawPct) : 0;

  const kickoff = new Date(match.kickoff_utc);
  const formattedDate = kickoff.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = kickoff.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const compLabel =
    match.competition_name ||
    (competition === 'CL'
      ? 'UEFA Champions League'
      : competition === 'SA'
      ? 'Serie A'
      : competition === 'PL'
      ? 'Premier League'
      : 'La Liga');

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 sm:p-6 text-white shadow-xl transition-all"
      style={{
        background:
          competition === 'CL'
            ? 'linear-gradient(135deg, #1e0842 0%, #151c5e 50%, #0b132b 100%)'
            : competition === 'SA'
            ? 'linear-gradient(135deg, #062822 0%, #0d2644 50%, #0a1730 100%)'
            : competition === 'PL'
            ? 'linear-gradient(135deg, #2b033d 0%, #150936 50%, #0c1836 100%)'
            : 'linear-gradient(135deg, #2b091f 0%, #1a1638 50%, #0f172a 100%)',
        border:
          competition === 'SA'
            ? '1px solid rgba(16, 185, 129, 0.25)'
            : competition === 'PL'
            ? '1px solid rgba(168, 85, 247, 0.35)'
            : '1px solid rgba(244, 63, 94, 0.25)',
        boxShadow:
          competition === 'SA'
            ? '0 10px 30px -10px rgba(16, 185, 129, 0.3)'
            : competition === 'PL'
            ? '0 10px 30px -10px rgba(168, 85, 247, 0.35)'
            : '0 10px 30px -10px rgba(88, 28, 135, 0.4)',
      }}
    >
      {/* Subtle background glow/watermark decoration */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 w-64 h-64 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            competition === 'CL'
              ? '#6366f1'
              : competition === 'SA'
              ? '#10b981'
              : competition === 'PL'
              ? '#c084fc'
              : '#f43f5e',
        }}
        aria-hidden="true"
      />

      {/* Header Row: Badges & Next/Prev Controls */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-white/15 text-white tracking-wide">
            {compLabel}
          </span>
          {match.matchday && (
            <span className="text-xs px-2 py-0.5 rounded font-medium bg-black/30 text-slate-300">
              Matchday {match.matchday}
            </span>
          )}
        </div>

        {/* Carousel pagination arrows */}
        {matches.length > 1 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">
              {activeIndex + 1} of {matches.length}
            </span>
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              aria-label="Previous fixture"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0))}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              aria-label="Next fixture"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* Matchup Centerpiece */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6 py-2">
        {/* Home Team */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 text-right min-w-0">
          <div className="truncate">
            <h3 className="font-bold text-base sm:text-xl text-white tracking-tight truncate">
              {match.home_team_short_name ?? match.home_team_name}
            </h3>
            <p className="text-xs text-slate-400 hidden sm:block truncate">Home</p>
          </div>
          {match.home_team_crest_url ? (
            <img
              src={match.home_team_crest_url}
              alt={`${match.home_team_name} crest`}
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain shrink-0 drop-shadow-md"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg">
              {(match.home_team_short_name ?? match.home_team_name).slice(0, 2)}
            </div>
          )}
        </div>

        {/* Center: Kickoff Time / Date */}
        <div className="flex flex-col items-center justify-center px-2 py-1 text-center shrink-0">
          <div className="px-3 py-1 rounded-lg bg-black/40 border border-white/15 backdrop-blur-sm">
            <span className="text-base sm:text-lg font-bold tracking-wider text-amber-300">
              {formattedTime}
            </span>
          </div>
          <span className="text-xs text-slate-300 mt-1 font-medium">{formattedDate}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">
            {match.status === 'TIMED' ? 'Upcoming' : match.status}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-start gap-3 sm:gap-4 text-left min-w-0">
          {match.away_team_crest_url ? (
            <img
              src={match.away_team_crest_url}
              alt={`${match.away_team_name} crest`}
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain shrink-0 drop-shadow-md"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg">
              {(match.away_team_short_name ?? match.away_team_name).slice(0, 2)}
            </div>
          )}
          <div className="truncate">
            <h3 className="font-bold text-base sm:text-xl text-white tracking-tight truncate">
              {match.away_team_short_name ?? match.away_team_name}
            </h3>
            <p className="text-xs text-slate-400 hidden sm:block truncate">Away</p>
          </div>
        </div>
      </div>

      {/* Bottom Model Probabilities Bar (Shown only when authentic Poisson model odds exist) */}
      {hasProbabilities && (
        <div className="mt-5 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              <span>Home: {homePct}%</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
              <span>Draw: {drawPct}%</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
              <span>Away: {awayPct}%</span>
            </span>
          </div>

          {/* Multi-segment Probability Track */}
          <div className="w-full h-2 rounded-full overflow-hidden flex bg-white/10" aria-label="Match probabilities bar">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${homePct}%` }}
              title={`Home win: ${homePct}%`}
            />
            <div
              className="h-full bg-slate-400/80 transition-all duration-300"
              style={{ width: `${drawPct}%` }}
              title={`Draw: ${drawPct}%`}
            />
            <div
              className="h-full bg-sky-400 transition-all duration-300"
              style={{ width: `${awayPct}%` }}
              title={`Away win: ${awayPct}%`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
