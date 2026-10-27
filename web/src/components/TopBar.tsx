interface TopBarProps {
  competition: string;
  onCompetitionChange: (c: string) => void;
  season: number;
  onSeasonChange: (s: number) => void;
}

const SEASONS = [2026, 2025];
const COMPETITIONS = [
  { code: 'PL', name: 'Premier League' },
  { code: 'PD', name: 'La Liga' },
  { code: 'SA', name: 'Serie A' },
  { code: 'CL', name: 'Champions League' },
];

export default function TopBar({
  competition,
  onCompetitionChange,
  season,
  onSeasonChange,
}: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-5 py-2.5 gap-2 sm:gap-4 max-w-full"
      style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-lg sm:text-xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Match<span className="text-accent">Pulse</span>
        </span>
      </div>

      {/* Middle/Right: Competition selector/tabs & Season select */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
        {/* Horizontal scrollable competition tabs on mobile/tablet */}
        <div
          role="tablist"
          aria-label="Competition selection"
          className="lg:hidden flex items-center gap-1 overflow-x-auto py-1 px-0.5 max-w-[180px] xs:max-w-[220px] sm:max-w-none scrollbar-none"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {COMPETITIONS.map((c) => {
            const isActive = competition === c.code;
            return (
              <button
                key={c.code}
                role="tab"
                aria-selected={isActive}
                onClick={() => onCompetitionChange(c.code)}
                className={`min-h-[40px] px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'hover:text-[var(--text-primary)]'
                }`}
                style={{
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  background: isActive ? undefined : 'color-mix(in srgb, var(--border) 40%, transparent)',
                  border: '1px solid var(--border)',
                }}
              >
                {c.code}
              </button>
            );
          })}
        </div>

        {/* Season select */}
        <label htmlFor="season-select" className="sr-only">Season</label>
        <select
          id="season-select"
          value={season}
          onChange={(e) => onSeasonChange(Number(e.target.value))}
          className="min-h-[40px] text-xs sm:text-sm font-medium rounded-lg px-2.5 sm:px-3 py-2 shrink-0 focus:outline-none focus:ring-2 focus:ring-accent"
          style={{
            background: 'var(--bg-page)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
        >
          {SEASONS.map((s) => (
            <option key={s} value={s}>
              {s}/{String(s + 1).slice(2)}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
