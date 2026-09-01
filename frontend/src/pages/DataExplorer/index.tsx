import { useState, useMemo, useEffect } from 'react';
import { fetchApi } from '../../api/client';

type DataRow = {
  id: string;
  lat: number;
  lon: number;
  temp: number;
  aqi: number;
  ndvi: number;
};

type SortKey = 'lat' | 'lon' | 'temp' | 'aqi' | 'ndvi';

export default function DataExplorer() {
  const [search, setSearch] = useState('');
  const [minTemp, setMinTemp] = useState('');
  const [minAqi, setMinAqi] = useState('');
  
  const [sortKey, setSortKey] = useState<SortKey>('temp');
  const [sortAsc, setSortAsc] = useState(false);
  
  const [rows, setRows] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch unified real data from the backend
  useEffect(() => {
    const fetchMapData = async () => {
      setLoading(true);
      try {
        // Default bounding box for Bhubaneswar
        const data = await fetchApi(`/explorer/points?min_lon=85.78&min_lat=20.25&max_lon=85.88&max_lat=20.34`);
        if (data && data.features) {
          const parsed = data.features.map((f: any) => ({
            id: f.properties.uid,
            lon: f.geometry.coordinates[0],
            lat: f.geometry.coordinates[1],
            temp: f.properties.temp,
            aqi: f.properties.aqi,
            ndvi: f.properties.ndvi
          }));
          setRows(parsed);
        } else {
          setRows([]);
        }
      } catch (err) {
        console.error(`Failed to fetch spatial points data:`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  const filtered = useMemo(() => {
    let result = rows.filter(r => {
      if (search) {
        const hay = `${r.lat.toFixed(4)} ${r.lon.toFixed(4)} ${r.temp.toFixed(1)} ${r.aqi} ${r.ndvi.toFixed(2)}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      if (minTemp && !isNaN(Number(minTemp))) {
        if (r.temp < Number(minTemp)) return false;
      }
      if (minAqi && !isNaN(Number(minAqi))) {
        if (r.aqi < Number(minAqi)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      let x = a[sortKey], y = b[sortKey];
      if (x < y) return sortAsc ? -1 : 1;
      if (x > y) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [search, minTemp, minAqi, rows, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleExport = (format: 'csv' | 'json' | 'geojson') => {
    let content = '';
    let type = 'text/plain';
    let ext = format;

    if (format === 'csv') {
      const headers = ['latitude', 'longitude', 'temperature_c', 'aqi', 'ndvi'];
      content = [
        headers.join(','),
        ...filtered.map(r => [r.lat.toFixed(5), r.lon.toFixed(5), r.temp.toFixed(2), r.aqi, r.ndvi.toFixed(2)].join(','))
      ].join('\n');
      type = 'text/csv';
    } else if (format === 'json') {
      content = JSON.stringify(filtered, null, 2);
      type = 'application/json';
    } else if (format === 'geojson') {
      const features = filtered.map(r => ({
        type: 'Feature',
        properties: { temp: r.temp, aqi: r.aqi, ndvi: r.ndvi },
        geometry: { type: 'Point', coordinates: [r.lon, r.lat] }
      }));
      content = JSON.stringify({ type: 'FeatureCollection', features }, null, 2);
      type = 'application/geo+json';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urbancool-spatial-export-${new Date().toISOString().split('T')[0]}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="page-title">
        <div className="eyebrow">Public Data Portal</div>
        <h2>Unified Spatial Data Explorer</h2>
        <p>Explore and export the unified point cloud data combining Temperature, AQI, and Vegetation cover.</p>
      </div>

      <div className="card filters p-6 flex flex-wrap gap-4 items-end mb-6">
        <div className="field flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Search Coordinates</label>
          <input 
            className="w-full p-2.5 border border-border bg-surface-2 text-text rounded-lg outline-none focus:border-accent transition-colors" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search lat/lon or value…" 
          />
        </div>
        <div className="field flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Min Temperature (°C)</label>
          <input 
            type="number"
            className="w-full p-2.5 border border-border bg-surface-2 text-text rounded-lg outline-none focus:border-accent transition-colors" 
            value={minTemp} 
            onChange={(e) => setMinTemp(e.target.value)} 
            placeholder="e.g. 38"
          />
        </div>
        <div className="field flex-1 min-w-[150px]">
          <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Min AQI</label>
          <input 
            type="number"
            className="w-full p-2.5 border border-border bg-surface-2 text-text rounded-lg outline-none focus:border-accent transition-colors" 
            value={minAqi} 
            onChange={(e) => setMinAqi(e.target.value)} 
            placeholder="e.g. 100"
          />
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row justify-between md:items-center p-6 border-b border-border/50 gap-4">
          <div>
            <b className="text-lg">{filtered.length} Points Extracted</b>
            <div className="text-xs text-muted mt-1">Unified spatial data streaming from Open-Meteo Bulk APIs</div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn small bg-surface-2 hover:bg-surface border-border" onClick={() => handleExport('csv')}>CSV</button>
            <button className="btn small bg-surface-2 hover:bg-surface border-border" onClick={() => handleExport('json')}>JSON</button>
            <button className="btn small primary" onClick={() => handleExport('geojson')}>GeoJSON</button>
          </div>
        </div>
        <div className="overflow-auto max-h-[600px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 text-muted">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
              Orchestrating concurrent bulk requests...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface z-10 backdrop-blur-md shadow-sm">
              <tr>
                <th onClick={() => toggleSort('lat')} className="p-4 text-xs font-bold uppercase tracking-wider text-muted cursor-pointer hover:text-accent transition-colors">Latitude ↕</th>
                <th onClick={() => toggleSort('lon')} className="p-4 text-xs font-bold uppercase tracking-wider text-muted cursor-pointer hover:text-accent transition-colors">Longitude ↕</th>
                <th onClick={() => toggleSort('temp')} className="p-4 text-xs font-bold uppercase tracking-wider text-muted cursor-pointer hover:text-accent transition-colors">Temperature (°C) ↕</th>
                <th onClick={() => toggleSort('aqi')} className="p-4 text-xs font-bold uppercase tracking-wider text-muted cursor-pointer hover:text-accent transition-colors">AQI ↕</th>
                <th onClick={() => toggleSort('ndvi')} className="p-4 text-xs font-bold uppercase tracking-wider text-muted cursor-pointer hover:text-accent transition-colors">Vegetation (NDVI) ↕</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-surface-2 transition-colors">
                  <td className="p-4 font-mono text-sm">{r.lat.toFixed(5)}</td>
                  <td className="p-4 font-mono text-sm">{r.lon.toFixed(5)}</td>
                  <td className="p-4">
                    <span className="font-bold text-orange-500">{r.temp.toFixed(1)}°C</span>
                  </td>
                  <td className="p-4">
                    <span className={`font-bold px-2 py-1 rounded bg-surface border ${r.aqi > 100 ? 'border-red-500/30 text-red-500' : 'border-yellow-500/30 text-yellow-500'}`}>
                      {r.aqi}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-bold px-2 py-1 rounded bg-surface border ${r.ndvi > 0.4 ? 'border-green-500/30 text-green-500' : 'border-slate-500/30 text-slate-400'}`}>
                      {r.ndvi.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">No points found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </>
  );
}
