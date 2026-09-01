export interface VegetationData {
  ndvi: number;
  vegetation_cover_percent: number;
  observed_at: string;
}

export interface BuildingData {
  building_density_percent: number;
  built_up_percent: number;
  observed_at: string;
}

export interface EnvironmentalLayer {
  name: string;
  unit: string;
  timestamp: string;
  resolution: string;
  source: string;
  available: boolean;
}
