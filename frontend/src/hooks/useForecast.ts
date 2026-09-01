import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../api/client';

export interface ForecastResponse {
  dates: string[];
  temp_max: number[];
  precip_prob: number[];
  wind_speed: number[];
}

export function useForecast(lat: number, lon: number) {
  return useQuery<ForecastResponse>({
    queryKey: ['forecast', lat, lon],
    queryFn: async () => {
      const data = await fetchApi(`/forecast?lat=${lat}&lon=${lon}`);
      return data as ForecastResponse;
    },
    staleTime: 60 * 1000 * 15, // 15 mins
  });
}
