# Batch 1b Progress

- [x] 1. web/src/components/StandingsTable.tsx using the existing useStandings hook: position, crest and name, played, W, D, L, GD, points. Wide tables scroll inside their own container. Use the existing LoadingSpinner and ErrorCard for loading, error and empty states.
- [x] 2. web/src/components/CoveragePanel.tsx using the existing useCoverage hook: match counts per competition and season, the last ingested date, and EVERY string in the limitations array as a visible list (never collapsed, never in a tooltip). Same loading and error handling.
- [x] 3. web/src/components/TitleRaceCard.tsx: the top 3 teams by title probability from the existing useSimulation data, labelled "model estimates, not predictions or advice".
- [x] 4. web/src/pages/Dashboard.tsx (main.tsx already imports it): holds the selected season in state (2026 default, 2025 available) and lays out three columns: Sidebar on the left, a wide centre column (SimulationTable, then StandingsTable) and a right column (TitleRaceCard, then CoveragePanel). Below 1024px it collapses to one column. Add a footer that says "Data: football-data.org".
- [x] 5. Run: cd web, npm install, npm run build. Show me the full output. Fix compile errors if there are any, but only in files you created in this session.

All 5 tasks completed. Installed dependencies, created `web/src/vite-env.d.ts` for Vite client type definitions, and verified that `npm run build` succeeds cleanly.
