import type { MatchRow, StandingsRow } from '../types';

export const CURRENT_SEASON = 2026;

export type PositionSource =
  | StandingsRow[]
  | Map<string | number, number>
  | Record<string | number, number>
  | ((name: string, id?: number) => number | undefined);

export function buildPositionMap(
  standings?: (StandingsRow | { name?: string; team_id?: number; id?: number; position?: number })[]
): Map<string | number, number> {
  const map = new Map<string | number, number>();
  if (!standings || !Array.isArray(standings)) return map;

  standings.forEach((row, index) => {
    const pos = 'position' in row && typeof row.position === 'number' ? row.position : index + 1;
    if (row.name) {
      map.set(row.name, pos);
    }
    if ('team_id' in row && typeof row.team_id === 'number') {
      map.set(row.team_id, pos);
    }
    if ('id' in row && typeof row.id === 'number') {
      map.set(row.id, pos);
    }
  });

  return map;
}

/**
 * Pure function to sort matches for the marquee fixture card:
 * 1. Kick-off time ascending.
 * 2. For matches with the exact same kick-off timestamp:
 *    - Combined position (home position + away position), lower first.
 *    - Then smaller single position, lower first.
 *    - Fixture where either team has no position goes last among that time slot.
 */
export function sortFeaturedMatches(
  matches: MatchRow[],
  positions?: PositionSource
): MatchRow[] {
  if (!matches || matches.length === 0) return [];

  let getPos: (name: string, id?: number) => number | undefined;

  if (typeof positions === 'function') {
    getPos = positions;
  } else if (positions instanceof Map) {
    getPos = (name: string, id?: number) => {
      if (id !== undefined && positions.has(id)) return positions.get(id);
      if (positions.has(name)) return positions.get(name);
      return undefined;
    };
  } else if (Array.isArray(positions)) {
    const map = buildPositionMap(positions);
    getPos = (name: string, id?: number) => {
      if (id !== undefined && map.has(id)) return map.get(id);
      if (map.has(name)) return map.get(name);
      return undefined;
    };
  } else if (positions && typeof positions === 'object') {
    getPos = (name: string, id?: number) => {
      if (id !== undefined && id in positions) return (positions as Record<string | number, number>)[id];
      if (name in positions) return (positions as Record<string | number, number>)[name];
      return undefined;
    };
  } else {
    getPos = () => undefined;
  }

  return [...matches].sort((a, b) => {
    const timeA = new Date(a.kickoff_utc).getTime();
    const timeB = new Date(b.kickoff_utc).getTime();

    if (timeA !== timeB) {
      return timeA - timeB;
    }

    const posHomeA = getPos(a.home_team_name, a.home_team_id);
    const posAwayA = getPos(a.away_team_name, a.away_team_id);
    const hasPosA = posHomeA != null && posAwayA != null;

    const posHomeB = getPos(b.home_team_name, b.home_team_id);
    const posAwayB = getPos(b.away_team_name, b.away_team_id);
    const hasPosB = posHomeB != null && posAwayB != null;

    // A fixture where either team has no position goes last among that time slot
    if (hasPosA && !hasPosB) return -1;
    if (!hasPosA && hasPosB) return 1;
    if (!hasPosA && !hasPosB) return 0;

    // Both fixtures have positions for both teams:
    const combinedA = posHomeA! + posAwayA!;
    const combinedB = posHomeB! + posAwayB!;

    if (combinedA !== combinedB) {
      return combinedA - combinedB;
    }

    const minA = Math.min(posHomeA!, posAwayA!);
    const minB = Math.min(posHomeB!, posAwayB!);

    if (minA !== minB) {
      return minA - minB;
    }

    return 0;
  });
}
