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
      className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 gap-4"
      style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Match<span className="text-accent">Pulse</span>
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile competition select */}
        <div className="lg:hidden">
          <label htmlFor="mobile-comp-select" className="sr-only">Competition</label>
          <select
            id="mobile-comp-select"
            value={competition}
            onChange={(e) => onCompetitionChange(e.target.value)}
            className="text-sm font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent"
            style={{
              background: 'var(--bg-page)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          >
            {COMPETITIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Season select */}
        <label htmlFor="season-select" className="sr-only">Season</label>
        <select
          id="season-select"
          value={season}
          onChange={(e) => onSeasonChange(Number(e.target.value))}
          className="text-sm font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent"
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
