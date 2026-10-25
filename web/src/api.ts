/**
 * api.ts — typed fetch client.
 *
 * How it works with TanStack Query:
 *   - Each function here is a plain async fetch; it throws on non-2xx.
 *   - The hooks in hooks/ pass these functions as queryFn to useQuery.
 *   - TanStack Query handles caching, deduplication, background refetch,
 *     and exposes isPending / isError / data to components.
 *   - No global state or context is needed for data — Query manages it all.
 */

import type {
  StandingsRow,
  SimulationResponse,
  CoverageResponse,
  MatchRow,
} from './types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore json parse failure
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export function fetchStandings(competition: string, season: number) {
  return get<StandingsRow[]>(
    `/standings?competition=${encodeURIComponent(competition)}&season=${season}`
  );
}

export function fetchSimulation(competition: string, season: number) {
  return get<SimulationResponse>(
    `/simulation?competition=${encodeURIComponent(competition)}&season=${season}`
  );
}

export function fetchCoverage() {
  return get<CoverageResponse>('/coverage');
}

export function fetchUpcomingMatches(competition: string, season: number, limit = 10) {
  return get<MatchRow[]>(
    `/matches?competition=${encodeURIComponent(competition)}&season=${season}&upcoming=true&limit=${limit}`
  );
}
