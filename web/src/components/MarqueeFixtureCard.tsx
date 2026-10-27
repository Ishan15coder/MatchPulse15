import { useState, useRef, useEffect, useCallback } from 'react';
import { useUpcomingMatches } from '../hooks/useUpcomingMatches';
import { useStandings } from '../hooks/useStandings';
import { sortFeaturedMatches, CURRENT_SEASON } from '../lib/marquee';

const MAX_FEATURED = 10;

interface Props {
  competition: string;
  season: number;
}

export default function MarqueeFixtureCard({ competition, season }: Props) {
  const isCurrentSeason = season === CURRENT_SEASON;
  const { data: matches, isPending, isError } = useUpcomingMatches(competition, season, 30);
  const { data: standings } = useStandings(competition, season);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const featured = isCurrentSeason && matches && !isError
    ? sortFeaturedMatches(matches, standings).slice(0, MAX_FEATURED)
    : [];

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    const clamped = Math.max(0, Math.min(index, featured.length - 1));
    setActiveIndex(clamped);
  }, [featured.length]);

  const scrollToSlide = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const targetLeft = index * el.clientWidth;
    el.scrollTo({ left: targetLeft, behavior: 'smooth' });
    setActiveIndex(index);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Reset scroll and active index if competition changes
  useEffect(() => {
    setActiveIndex(0);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [competition]);

  // Do not render the card when the selected season is not CURRENT_SEASON
  if (!isCurrentSeason) {
    return null;
  }

  if (isPending) {
    return (
      <div className="w-full rounded-2xl p-6 animate-pulse" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="h-4 w-32 bg-slate-700/40 rounded mb-4" />
        <div className="h-16 w-full bg-slate-700/20 rounded" />
      </div>
    );
  }

  if (isError || !matches || matches.length === 0 || featured.length === 0) {
    return null; // Don't show if there are no upcoming matches
  }

  const compLabel =
    featured[0].competition_name ||
    (competition === 'CL'
      ? 'UEFA Champions League'
      : competition === 'SA'
      ? 'Serie A'
      : competition === 'PL'
      ? 'Premier League'
      : 'La Liga');

  const showControls = featured.length > 1;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={`${compLabel} Featured Fixtures`}
      className="relative overflow-hidden rounded-2xl p-4 sm:p-6 text-white shadow-xl transition-all"
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
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-white/15 text-white tracking-wide">
            {compLabel}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-white/10 text-slate-200">
            Featured Fixtures
          </span>
        </div>

        {/* Previous / Next buttons (40px tap targets, hidden below sm breakpoint) */}
        {showControls && (
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 mr-1">
              {activeIndex + 1} of {featured.length}
            </span>
            <button
              type="button"
              onClick={() => scrollToSlide(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous fixture"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollToSlide(activeIndex + 1)}
              disabled={activeIndex === featured.length - 1}
              aria-label="Next fixture"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Flex Slider Container with CSS Scroll-Snap */}
      <div
        ref={scrollRef}
        tabIndex={0}
        aria-label="Fixtures slider"
        className="flex w-full overflow-x-auto focus:outline-none touch-pan-x"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {featured.map((match, idx) => {
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

          return (
            <div
              key={match.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`Fixture ${idx + 1} of ${featured.length}: ${match.home_team_name} vs ${match.away_team_name}`}
              className="w-full flex-shrink-0"
              style={{
                flex: '0 0 100%',
                scrollSnapAlign: 'start',
              }}
            >
              <div className="rounded-xl p-3 sm:p-5 bg-black/25 border border-white/10 backdrop-blur-sm">
                {/* Matchup Centerpiece */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 sm:gap-6 py-1">
                  {/* Home Team */}
                  <div className="flex items-center justify-end gap-1.5 sm:gap-4 text-right min-w-0">
                    <div className="truncate">
                      <h3 className="font-bold text-xs sm:text-base text-white tracking-tight truncate">
                        {match.home_team_short_name ?? match.home_team_name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-slate-400 hidden xs:block sm:block truncate">Home</p>
                    </div>
                    {match.home_team_crest_url ? (
                      <img
                        src={match.home_team_crest_url}
                        alt={`${match.home_team_name} crest`}
                        className="w-7 h-7 sm:w-14 sm:h-14 object-contain shrink-0 drop-shadow-md"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs sm:text-base">
                        {(match.home_team_short_name ?? match.home_team_name).slice(0, 2)}
                      </div>
                    )}
                  </div>

                  {/* Center: Kickoff Time / Date */}
                  <div className="flex flex-col items-center justify-center px-1.5 sm:px-4 py-1 text-center shrink-0">
                    <div className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-black/50 border border-white/15 backdrop-blur-sm">
                      <span className="text-xs sm:text-base font-bold tracking-wider text-amber-300">
                        {formattedTime}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-300 mt-1 font-medium">{formattedDate}</span>
                    {match.matchday && (
                      <span className="text-[9px] sm:text-[11px] text-slate-400 mt-0.5">
                        MD {match.matchday}
                      </span>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-start gap-1.5 sm:gap-4 text-left min-w-0">
                    {match.away_team_crest_url ? (
                      <img
                        src={match.away_team_crest_url}
                        alt={`${match.away_team_name} crest`}
                        className="w-7 h-7 sm:w-14 sm:h-14 object-contain shrink-0 drop-shadow-md"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs sm:text-base">
                        {(match.away_team_short_name ?? match.away_team_name).slice(0, 2)}
                      </div>
                    )}
                    <div className="truncate">
                      <h3 className="font-bold text-xs sm:text-base text-white tracking-tight truncate">
                        {match.away_team_short_name ?? match.away_team_name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-slate-400 hidden xs:block sm:block truncate">Away</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Model Probabilities Bar (Shown only when authentic Poisson model odds exist) */}
                {hasProbabilities && (
                  <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-300 mb-1.5 sm:mb-2 font-medium">
                      <span className="flex items-center gap-1 sm:gap-1.5">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 inline-block" />
                        <span>Home: {homePct}%</span>
                      </span>
                      <span className="flex items-center gap-1 sm:gap-1.5">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-400 inline-block" />
                        <span>Draw: {drawPct}%</span>
                      </span>
                      <span className="flex items-center gap-1 sm:gap-1.5">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-sky-400 inline-block" />
                        <span>Away: {awayPct}%</span>
                      </span>
                    </div>

                    {/* Multi-segment Probability Track */}
                    <div
                      className="w-full h-2 rounded-full overflow-hidden flex bg-white/10"
                      aria-label="Match probabilities bar"
                    >
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
            </div>
          );
        })}
      </div>

      {/* Slide Position Indicator under the card: text counter if > 6, otherwise dots */}
      {showControls && (
        <div className="flex items-center justify-center mt-3 sm:mt-4">
          {featured.length > 6 ? (
            <div
              className="min-h-[40px] px-4 py-2 inline-flex items-center justify-center rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-slate-200 tabular-nums tracking-wide select-none"
              aria-live="polite"
              aria-atomic="true"
            >
              {activeIndex + 1} / {featured.length}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5" role="tablist" aria-label="Fixture slides">
              {featured.map((m, dotIdx) => (
                <button
                  key={m.id}
                  role="tab"
                  aria-selected={dotIdx === activeIndex}
                  aria-label={`Go to fixture ${dotIdx + 1}: ${m.home_team_name} vs ${m.away_team_name}`}
                  onClick={() => scrollToSlide(dotIdx)}
                  className="min-h-[40px] min-w-[32px] sm:min-w-[40px] inline-flex items-center justify-center p-2 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg"
                >
                  <span
                    className={`h-2 rounded-full transition-all duration-200 block ${
                      dotIdx === activeIndex
                        ? 'w-6 bg-white shadow-sm'
                        : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
