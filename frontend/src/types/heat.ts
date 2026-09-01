export interface HeatRiskData {
  heat_risk_probability: number;
  category: 'low' | 'moderate' | 'high' | 'extreme' | string;
  confidence: number;
  model_version: string;
}

export interface MapHeatProperties {
  lst: number;
  air_temperature: number;
  aqi: number;
  ndvi: number;
  building_density: number;
  heat_risk_probability: number;
}
