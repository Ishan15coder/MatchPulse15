import { useQuery } from '@tanstack/react-query';
import { fetchSimulation } from '../api';

export function useSimulation(competition: string, season: number) {
  return useQuery({
    queryKey: ['simulation', competition, season],
    queryFn: () => fetchSimulation(competition, season),
    staleTime: 5 * 60 * 1000, // 5 min — simulation runs infrequently
  });
}
