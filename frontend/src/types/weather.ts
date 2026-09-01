export interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  rain_probability: number;
}

export interface WeatherForecastData {
  timestamp: string;
  temperature: number;
  wind_speed: number;
  rain_probability: number;
}
