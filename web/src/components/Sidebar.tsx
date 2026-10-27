interface SidebarProps {
  competition: string;
  onCompetitionChange: (c: string) => void;
  season: number;
  onSeasonChange: (s: number) => void;
}

const SEASONS = [2026, 2025];

const COMPETITIONS = [
  { code: 'CL', name: 'Champions League', flag: '🏆', active: true },
  { code: 'PL', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', active: true },
  { code: 'PD', name: 'La Liga', flag: '🇪🇸', active: true },
  { code: 'SA', name: 'Serie A', flag: '🇮🇹', active: true },
];

export default function Sidebar({
  competition,
  onCompetitionChange,
  season,
  onSeasonChange,
}: SidebarProps) {
  return (
    <aside
      className="hidden lg:flex flex-col gap-6 w-56 shrink-0 px-3 pt-6 pb-8"
      style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
    >
      
      <div>
        <p className="section-title px-3">Competition</p>
        <div className="flex flex-col gap-1">
          {COMPETITIONS.map((c) => (
            <button
              key={c.code}
              onClick={() => c.active && onCompetitionChange(c.code)}
              className={`nav-item w-full text-left ${competition === c.code ? 'active' : ''} ${!c.active ? 'disabled' : ''}`}
              title={c.active ? undefined : 'Coming soon'}
              disabled={!c.active}
            >
              <span aria-hidden="true">{c.flag}</span>
              <span className="flex-1">{c.name}</span>
              {!c.active && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-medium"
                  style={{
                    background: 'var(--border)',
                    color: 'var(--text-muted)',
                    fontSize: '10px',
                  }}
                >
                  soon
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Small-screen season selector is in TopBar, not here */}
    </aside>
  );
}
