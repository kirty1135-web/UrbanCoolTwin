import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat'; // Import heatmap plugin
import { fetchApi } from '../../api/client';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom component to wrap leaflet.heat since it doesn't have a native react-leaflet v4 binding
function HeatmapLayer({ points, options }: { points: [number, number, number][], options: any }) {
  const map = useMap();
  
  useEffect(() => {
    if (!points || points.length === 0) return;
    
    // Create the heat layer
    const heatLayer = (L as any).heatLayer(points, options).addTo(map);
    
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);
  
  return null;
}

function MapBoundsUpdater({ setBounds }: { setBounds: (b: any) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      setBounds({
        minLon: b.getWest(),
        minLat: b.getSouth(),
        maxLon: b.getEast(),
        maxLat: b.getNorth()
      });
    },
  });
  return null;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function RealMap() {
  const [activeLayer, setActiveLayer] = useState('Heat');
  const [bounds, setBounds] = useState({ minLon: 85.78, minLat: 20.25, maxLon: 85.88, maxLat: 20.34 });
  const [layerData, setLayerData] = useState<any>(null);
  
  const [selectedPoint, setSelectedPoint] = useState<{lat: number, lon: number} | null>(null);
  const [attribution, setAttribution] = useState<any>(null);
  const [loadingAttr, setLoadingAttr] = useState(false);

  const handleMapClick = async (lat: number, lng: number) => {
    setSelectedPoint({ lat, lon: lng });
    setLoadingAttr(true);
    setAttribution(null);
    
    try {
      // Create synthetic metrics based on typical Bhubaneswar summer profile for demo
      const mockTemp = 37 + Math.random() * 5;
      const reqBody = {
        lat,
        lon: lng,
        temp: mockTemp,
        aqi: Math.floor(60 + Math.random() * 80),
        ndvi: Math.random() * 0.4,
        building_density: Math.floor(40 + Math.random() * 50)
      };
      
      const res = await fetchApi<any>('/analytics/attribution', {
        method: 'POST',
        body: JSON.stringify(reqBody)
      });
      
      setAttribution(res);
      setLoadingAttr(false);
    } catch (err) {
      setAttribution({ explanation: 'Failed to connect to AI engine.' });
      setLoadingAttr(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = `min_lon=${bounds.minLon}&min_lat=${bounds.minLat}&max_lon=${bounds.maxLon}&max_lat=${bounds.maxLat}`;
        let endpoint = '';
        if (activeLayer === 'AQI') endpoint = `/map/aqi?${query}`;
        else if (activeLayer === 'Heat') endpoint = `/map/heat?${query}`;
        else if (activeLayer === 'Vegetation') endpoint = `/map/vegetation?${query}`;
        else if (activeLayer === 'Buildings') endpoint = `/map/buildings?${query}`;
        
        if (endpoint) {
          const data = await fetchApi(endpoint);
          setLayerData(data);
        }
      } catch (err) {
        console.error('Failed to fetch layer data:', err);
      }
    };
    fetchData();
  }, [activeLayer, bounds]);

  const eeUrl = useMemo(() => {
    if (layerData?.type === 'EE_TileLayer' && layerData.url) {
      return layerData.url;
    }
    return null;
  }, [layerData]);

  // Leaflet GeoJSON requires a stable key to trigger a full re-render when data updates
  const geojsonKey = useMemo(() => JSON.stringify(layerData), [layerData]);

  const getGeoJsonStyle = (feature: any) => {
    if (activeLayer === 'Vegetation') {
      return {
        fillColor: '#22c55e',
        weight: 0,
        fillOpacity: feature.properties.ndvi || 0.5
      };
    }
    if (activeLayer === 'Buildings') {
      return {
        fillColor: '#8b5cf6',
        color: '#6d28d9',
        weight: 1,
        fillOpacity: 0.8
      };
    }
    return {};
  };

  // Convert FeatureCollection to Heatmap points array [lat, lon, intensity]
  const heatPoints = useMemo<[number, number, number][]>(() => {
    if (layerData?.type !== 'FeatureCollection') return [];
    
    if (activeLayer === 'Heat') {
      return layerData.features.map((f: any) => {
        const temp = f.properties.temp;
        // Normalize 30-45C to 0.0-1.0 intensity
        const intensity = Math.max(0, Math.min(1, (temp - 30) / 15));
        return [f.geometry.coordinates[1], f.geometry.coordinates[0], intensity];
      });
    }
    if (activeLayer === 'AQI') {
      return layerData.features.map((f: any) => {
        const aqi = f.properties.value;
        // Normalize 0-200 AQI to 0.0-1.0 intensity
        const intensity = Math.max(0, Math.min(1, aqi / 200));
        return [f.geometry.coordinates[1], f.geometry.coordinates[0], intensity];
      });
    }
    
    if (activeLayer === 'Vegetation') {
      return layerData.features.map((f: any) => {
        const ndvi = f.properties.ndvi || 0.5;
        let lat = 0, lon = 0;
        if (f.geometry.type === 'Point') {
          lat = f.geometry.coordinates[1];
          lon = f.geometry.coordinates[0];
        } else if (f.geometry.type === 'Polygon' && f.geometry.coordinates[0].length > 0) {
          // Approximate centroid using first point
          lat = f.geometry.coordinates[0][0][1];
          lon = f.geometry.coordinates[0][0][0];
        }
        return [lat, lon, ndvi];
      });
    }
    
    return [];
  }, [layerData, activeLayer]);

  const classicGradient = {
    0.2: '#0000ff', // Blue
    0.4: '#00ffff', // Cyan
    0.6: '#00ff00', // Lime
    0.8: '#ffff00', // Yellow
    1.0: '#ff0000'  // Red
  };

  const heatOptions = useMemo(() => {
    if (activeLayer === 'Heat' || activeLayer === 'AQI' || activeLayer === 'Vegetation') {
      return {
        radius: 35,
        blur: 25,
        maxZoom: 14,
        gradient: classicGradient
      };
    }
    return {};
  }, [activeLayer]);


  return (
    <div className="w-full h-[800px] relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-xl">
      
      {/* Map Controls Overlay - Moved to Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-4 bg-slate-900/90 p-2 px-4 rounded-full backdrop-blur-md border border-slate-700 shadow-xl pointer-events-auto">
        <span className="text-white text-sm font-semibold opacity-80">Views:</span>
        <div className="flex gap-1">
          {['Heat', 'AQI', 'Vegetation', 'Buildings'].map((l) => (
            <button 
              key={l}
              onClick={() => setActiveLayer(l)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                activeLayer === l 
                  ? 'bg-blue-600 text-white font-medium' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <MapContainer 
        center={[20.2961, 85.8245]} 
        zoom={12} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        scrollWheelZoom={false} // Disable scroll-wheel to fix map sensitivity!
        dragging={true} // Allow hand panning
      >
        <MapBoundsUpdater setBounds={setBounds} />
        
        {/* Base Map (OSM with CSS Invert for Dark Mode to avoid API Key limits) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          className="![filter:invert(100%)_hue-rotate(180deg)_brightness(95%)_contrast(90%)]"
        />

        {/* Earth Engine Raster Tile Layer */}
        {(activeLayer === 'Heat' || activeLayer === 'Vegetation') && eeUrl && (
          <TileLayer 
            url={eeUrl} 
            opacity={0.85} 
          />
        )}

        {/* TRUE HEATMAP LAYER */}
        {(activeLayer === 'Heat' || activeLayer === 'AQI' || activeLayer === 'Vegetation') && !eeUrl && heatPoints.length > 0 && (
          <HeatmapLayer points={heatPoints} options={heatOptions} />
        )}

        {/* Fallback Vector Layers (Buildings only now, Vegetation is heatmap) */}
        {activeLayer === 'Buildings' && layerData?.type === 'FeatureCollection' && (
          <GeoJSON 
            key={geojsonKey}
            data={layerData} 
            style={getGeoJsonStyle}
          />
        )}
        
        <MapClickHandler onClick={handleMapClick} />
        
      </MapContainer>

      {/* AI Intelligence Panel */}
      {selectedPoint && (
        <div className="absolute bottom-4 left-4 z-[1000] w-[340px] bg-slate-900/95 backdrop-blur-md rounded border border-slate-700 shadow-2xl pointer-events-auto text-slate-300 font-mono text-[11px] flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
            <span className="font-bold text-white tracking-widest uppercase">Selected Area</span>
            <button onClick={() => setSelectedPoint(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="p-4 flex flex-col gap-4">
            {loadingAttr || !attribution ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-70">
                <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                Analyzing Thermal Data...
              </div>
            ) : (
              <>
                {/* Temperatures */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span>Surface Temperature</span>
                    <span className="text-white">{attribution.surface_temp?.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current AQI</span>
                    <span className="text-white">{attribution.current_aqi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Temperature</span>
                    <span className="text-white">{attribution.expected_temp?.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between font-bold mt-1">
                    <span>Heat Anomaly</span>
                    <span className="text-red-400">+{attribution.anomaly?.toFixed(1)}°C 🔴</span>
                  </div>
                </div>

                <div className="h-px w-full bg-slate-700 my-1"></div>

                {/* Attribution Breakdown */}
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-white mb-2 tracking-widest uppercase">Why is this area hot?</span>
                  
                  <div className="flex justify-between">
                    <span>Season / Weather</span>
                    <span>{attribution.attribution?.season_weather}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vegetation</span>
                    <span>{attribution.attribution?.vegetation}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Building Density</span>
                    <span>{attribution.attribution?.building_density}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impervious Surface</span>
                    <span>{attribution.attribution?.impervious_surface}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AQI</span>
                    <span>{attribution.attribution?.aqi}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other</span>
                    <span>{attribution.attribution?.other}%</span>
                  </div>
                  
                  <div className="mt-2 text-white">
                    Primary urban factor: <span className="text-blue-400">{attribution.attribution?.primary_factor}</span>
                  </div>
                </div>

                <div className="h-px w-full bg-slate-700 my-1"></div>

                {/* AI Explanation */}
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-white tracking-widest uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    AI Explanation
                  </span>
                  <p className="leading-relaxed text-slate-400">
                    {attribution.explanation}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
