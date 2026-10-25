import { useQuery } from '@tanstack/react-query';
import { fetchStandings } from '../api';

export function useStandings(competition: string, season: number) {
  return useQuery({
    queryKey: ['standings', competition, season],
    queryFn: () => fetchStandings(competition, season),
    staleTime: 2 * 60 * 1000, // 2 min — standings change on match day
  });
}
