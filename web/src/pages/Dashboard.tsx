import { useState } from 'react';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import MarqueeFixtureCard from '../components/MarqueeFixtureCard';
import SimulationTable from '../components/SimulationTable';
import StandingsTable from '../components/StandingsTable';
import TitleRaceCard from '../components/TitleRaceCard';
import CoveragePanel from '../components/CoveragePanel';

const COMP_NAMES: Record<string, string> = {
  PL: 'Premier League',
  PD: 'La Liga',
  CL: 'UEFA Champions League',
  SA: 'Serie A',
};

export default function Dashboard() {
  const [competition, setCompetition] = useState<string>('PD');
  const [season, setSeason] = useState<number>(2026);
  const [view, setView] = useState<'outlook' | 'table'>('table');

  const compTitle = COMP_NAMES[competition] ?? competition;

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

          {/* Three-column layout on >= 1024px (Sidebar + Centre + Right), collapses to 1 column < 1024px */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-6 items-start">
            {/* Centre column: Marquee fixture then Unified card with toggle between League Table & Season Outlook */}
            <div className="flex flex-col gap-6 min-w-0">
              {/* Marquee Featured Fixture */}
              <MarqueeFixtureCard competition={competition} season={season} />

              <section className="card" aria-label="League data and projections">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {view === 'table' ? 'League Table' : 'Season Outlook'}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {view === 'table'
                        ? 'Official standings, goal difference, and total points'
                        : 'Monte Carlo simulation probabilities based on current form & Poisson model'}
                    </p>
                  </div>

                  {/* Segmented Toggle Control */}
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
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
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
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 flex items-center gap-1.5 ${
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
                </div>

                {view === 'table' ? (
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

            {/* Right column: Title race card then Data & limitations panel */}
            <div className="flex flex-col gap-6">
              <TitleRaceCard competition={competition} season={season} />
              <CoveragePanel />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="py-6 px-4 text-center text-xs border-t mt-auto"
        style={{
          borderColor: 'var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        <p>Data: football-data.org</p>
      </footer>
    </div>
  );
}
