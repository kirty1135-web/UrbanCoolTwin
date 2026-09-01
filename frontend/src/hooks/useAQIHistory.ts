import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../api/client';

export function useAQIHistory(lat: number, lon: number) {
  return useQuery<{ history: number[] }>({
    queryKey: ['aqi', 'history', lat, lon],
    queryFn: async () => {
      const data = await fetchApi(`/aqi/history?lat=${lat}&lon=${lon}`);
      return data as { history: number[] };
    }
  });
}
