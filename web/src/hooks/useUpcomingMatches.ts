import { useQuery } from '@tanstack/react-query';
import { fetchUpcomingMatches } from '../api';

export function useUpcomingMatches(competition: string, season: number, limit = 10) {
  return useQuery({
    queryKey: ['upcomingMatches', competition, season, limit],
    queryFn: () => fetchUpcomingMatches(competition, season, limit),
    staleTime: 5 * 60 * 1000,
  });
}
