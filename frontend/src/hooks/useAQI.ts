import { useQuery } from '@tanstack/react-query';


import { fetchApi } from '../api/client';

export const fetchCurrentAQI = async (lat?: number, lon?: number) => {
  // Use default Bhubaneswar coordinates if not provided for now
  const queryLat = lat ?? 20.2961;
  const queryLon = lon ?? 85.8245;
  
  return fetchApi<any>(`/aqi/current?lat=${queryLat}&lon=${queryLon}`);
};

export function useCurrentAQI(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['aqi', 'current', lat, lon],
    queryFn: () => fetchCurrentAQI(lat, lon),
    staleTime: 60 * 1000 * 5, // 5 minutes
  });
}
