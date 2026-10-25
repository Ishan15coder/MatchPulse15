import { useQuery } from '@tanstack/react-query';
import { fetchCoverage } from '../api';

export function useCoverage() {
  return useQuery({
    queryKey: ['coverage'],
    queryFn: fetchCoverage,
    staleTime: 10 * 60 * 1000, // 10 min — coverage is static metadata
  });
}
