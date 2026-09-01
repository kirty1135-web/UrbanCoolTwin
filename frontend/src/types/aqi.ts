export interface AQIData {
  aqi: number;
  category: 'Good' | 'Moderate' | 'Unhealthy' | 'Very High' | 'Hazardous' | string;
  pm25: number;
  pm10?: number;
  no2?: number;
  o3?: number;
}

export interface AQIHistoryData {
  timestamp: string;
  aqi: number;
  pm25: number;
}
