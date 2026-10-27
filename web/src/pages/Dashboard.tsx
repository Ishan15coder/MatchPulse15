import { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import MarqueeFixtureCard from '../components/MarqueeFixtureCard';
import SimulationTable from '../components/SimulationTable';
import StandingsTable from '../components/StandingsTable';
import TitleRaceCard from '../components/TitleRaceCard';
import CoveragePanel from '../components/CoveragePanel';
import { CURRENT_SEASON } from '../lib/marquee';

const COMP_NAMES: Record<string, string> = {
  PL: 'Premier League',
  PD: 'La Liga',
  CL: 'UEFA Champions League',
  SA: 'Serie A',
};

export default function Dashboard() {
  const [competition, setCompetition] = useState<string>('CL');
  const [season, setSeason] = useState<number>(2026);
  const [view, setView] = useState<'outlook' | 'table'>('table');
  const [isLimitationsModalOpen, setIsLimitationsModalOpen] = useState(false);

  const isCurrentSeason = season === CURRENT_SEASON;
  const compTitle = COMP_NAMES[competition] ?? competition;

  // Close modal on Escape key
  useEffect(() => {
    if (!isLimitationsModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLimitationsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLimitationsModalOpen]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
      {/* Top Bar with MatchPulse branding, competition switcher & season selector */}
      <TopBar
        competition={competition}
        onCompetitionChange={setCompetition}
        season={season}
        onSeasonChange={setSeason}
      />

      {/* Main dashboard content */}
      <div className="flex-1 flex flex-col lg:flex-row w-full">
        {/* Left column: Sidebar (hidden < 1024px) */}
        <Sidebar
          competition={competition}
          onCompetitionChange={setCompetition}
          season={season}
          onSeasonChange={setSeason}
        />

        {/* Main content area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 w-full max-w-[1600px]">
          {/* Subtitle / context heading */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {compTitle}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Football analytics and Monte Carlo simulations for {compTitle} ({season}/{String(season + 1).slice(2)})
            </p>
          </div>

          {/* Layout: two column on >= 1024px when TitleRaceCard is present; full-width centre column if not */}
          <div className={`grid grid-cols-1 ${isCurrentSeason ? 'lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]' : ''} gap-6 items-start`}>
            {/* Centre column: Marquee fixture then Unified card with League Table & Season Outlook */}
            <div className="flex flex-col gap-6 min-w-0">
              {/* Marquee Featured Fixture */}
              <MarqueeFixtureCard competition={competition} season={season} />

              <section className="card" aria-label="League data and projections">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {!isCurrentSeason || view === 'table' ? 'League Table' : 'Season Outlook'}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {!isCurrentSeason || view === 'table'
                        ? 'Official standings, goal difference, and total points'
                        : 'Monte Carlo simulation probabilities based on current form & Poisson model'}
                    </p>
                  </div>

                  {/* Segmented Toggle Control - only rendered when season is CURRENT_SEASON */}
                  {isCurrentSeason && (
                    <div
                      role="tablist"
                      aria-label="View selection"
                      className="inline-flex p-1 rounded-xl self-start sm:self-auto shrink-0"
                      style={{
                        background: 'color-mix(in srgb, var(--border) 45%, transparent)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <button
                        role="tab"
                        id="tab-table"
                        aria-controls="panel-table"
                        aria-selected={view === 'table'}
                        onClick={() => setView('table')}
                        className={`min-h-[40px] px-3.5 py-2 text-xs font-medium rounded-lg transition-all duration-150 flex items-center justify-center ${
                          view === 'table'
                            ? 'bg-emerald-500 text-white shadow-sm font-semibold'
                            : 'hover:text-[var(--text-primary)]'
                        }`}
                        style={{
                          color: view === 'table' ? '#ffffff' : 'var(--text-muted)',
                        }}
                      >
                        League Table
                      </button>
                      <button
                        role="tab"
                        id="tab-outlook"
                        aria-controls="panel-outlook"
                        aria-selected={view === 'outlook'}
                        onClick={() => setView('outlook')}
                        className={`min-h-[40px] px-3.5 py-2 text-xs font-medium rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 ${
                          view === 'outlook'
                            ? 'bg-emerald-500 text-white shadow-sm font-semibold'
                            : 'hover:text-[var(--text-primary)]'
                        }`}
                        style={{
                          color: view === 'outlook' ? '#ffffff' : 'var(--text-muted)',
                        }}
                      >
                        <span>Season Outlook</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            view === 'outlook'
                              ? 'bg-emerald-700/60 text-emerald-100'
                              : 'text-[var(--text-muted)]'
                          }`}
                          style={{
                            background: view === 'outlook' ? undefined : 'var(--border)',
                          }}
                        >
                          Monte Carlo
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {!isCurrentSeason || view === 'table' ? (
                  <div id="panel-table" role="tabpanel" aria-labelledby="tab-table">
                    <StandingsTable competition={competition} season={season} />
                  </div>
                ) : (
                  <div id="panel-outlook" role="tabpanel" aria-labelledby="tab-outlook">
                    <SimulationTable competition={competition} season={season} />
                  </div>
                )}
              </section>
            </div>

            {/* Right column: Title race card (only rendered when season is CURRENT_SEASON) */}
            {isCurrentSeason && (
              <div className="flex flex-col gap-6">
                <TitleRaceCard competition={competition} season={season} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="py-6 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs border-t mt-auto max-w-full"
        style={{
          borderColor: 'var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        <p>Data: football-data.org</p>
        <button
          type="button"
          onClick={() => setIsLimitationsModalOpen(true)}
          className="min-h-[40px] inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          style={{
            background: 'color-mix(in srgb, var(--border) 40%, transparent)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
        >
          <span>Data &amp; limitations</span>
        </button>
      </footer>

      {/* Data & Limitations Modal Dialog */}
      {isLimitationsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Data and limitations"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop (closes on click) */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsLimitationsModalOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Panel (fits screen) */}
          <div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-6 shadow-2xl z-10"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <CoveragePanel onClose={() => setIsLimitationsModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
