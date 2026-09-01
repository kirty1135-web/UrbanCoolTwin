import { useState, useMemo, useEffect } from 'react';

import { fetchApi } from '../../api/client';

type DataRow = {
  date: string;
  aqi: number;
  temp: number;
  lst: number;
  ndvi: number;
  building: number;
  risk: string;
};

type SortKey = 'date' | 'aqi' | 'temp' | 'lst' | 'ndvi' | 'building';

export default function DataExplorer() {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('2026-08-01');
  const [toDate, setToDate] = useState('2026-08-30');
  const [metric, setMetric] = useState('all');
  
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(true);
  
  const [rows, setRows] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch real data when fromDate or toDate changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!fromDate || !toDate) return;
      setLoading(true);
      try {
        const data = (await fetchApi(`/explorer/history?from=${fromDate}&to=${toDate}`)) as DataRow[];
        setRows(data);
      } catch (err) {
        console.error("Failed to fetch historical data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [fromDate, toDate]);

  const filtered = useMemo(() => {
    let result = rows.filter(r => {
      const hay = Object.values(r).join(" ").toLowerCase();
      if (search && !hay.includes(search.toLowerCase())) return false;
      if (fromDate && r.date < fromDate) return false;
      if (toDate && r.date > toDate) return false;
      if (metric === "aqi" && r.aqi < 80) return false;
      if (metric === "temp" && r.temp < 38) return false;
      if (metric === "lst" && r.lst < 40) return false;
      if (metric === "ndvi" && r.ndvi > 0.30) return false;
      return true;
    });

    result.sort((a, b) => {
      let x = a[sortKey], y = b[sortKey];
      if (x < y) return sortAsc ? -1 : 1;
      if (x > y) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [search, fromDate, toDate, metric, sortKey, sortAsc]);

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
      const headers = ['date', 'aqi', 'temp', 'lst', 'ndvi', 'building', 'risk'];
      content = [
        headers.join(','),
        ...filtered.map(r => [r.date, r.aqi, r.temp, r.lst, r.ndvi, r.building, r.risk].join(','))
      ].join('\n');
      type = 'text/csv';
    } else if (format === 'json') {
      content = JSON.stringify(filtered, null, 2);
      type = 'application/json';
    } else if (format === 'geojson') {
      const features = filtered.map(r => ({
        type: 'Feature',
        properties: r,
        geometry: { type: 'Point', coordinates: [85.8245, 20.2961] } // Mock location for generic dataset
      }));
      content = JSON.stringify({ type: 'FeatureCollection', features }, null, 2);
      type = 'application/geo+json';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urbancool-export-${new Date().toISOString().split('T')[0]}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="page-title">
        <div className="eyebrow">Public data portal</div>
        <h2>Data Explorer</h2>
        <p>Select a period, filter observations, sort the table and export the visible dataset.</p>
      </div>

      <div className="card filters p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-[10px] mb-[16px]">
        <div className="field md:col-span-1 sm:col-span-2">
          <label className="block text-[11px] font-bold text-muted mb-1">Search</label>
          <input className="w-full p-2 border border-border bg-surface-2 text-text rounded-md outline-none" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search date or value…" />
        </div>
        <div className="field">
          <label className="block text-[11px] font-bold text-muted mb-1">From</label>
          <input type="date" className="w-full p-2 border border-border bg-surface-2 text-text rounded-md outline-none" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="field">
          <label className="block text-[11px] font-bold text-muted mb-1">To</label>
          <input type="date" className="w-full p-2 border border-border bg-surface-2 text-text rounded-md outline-none" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <div className="field">
          <label className="block text-[11px] font-bold text-muted mb-1">Metric</label>
          <select className="w-full p-2 border border-border bg-surface-2 text-text rounded-md outline-none" value={metric} onChange={(e) => setMetric(e.target.value)}>
            <option value="all">All observations</option>
            <option value="aqi">AQI ≥ 80</option>
            <option value="temp">Temp ≥ 38°C</option>
            <option value="lst">LST ≥ 40°C</option>
            <option value="ndvi">NDVI ≤ 0.30</option>
          </select>
        </div>
        <button className="btn primary self-end mt-2 md:mt-0 sm:col-span-2 md:col-span-1">Apply filters</button>
      </div>

      <div className="card">
        <div className="table-top flex flex-col md:flex-row justify-between md:items-center p-4 gap-[10px]">
          <div>
            <b>{filtered.length} observations</b>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Illustrative preview dataset</div>
          </div>
          <div className="export-group flex gap-[6px] flex-wrap">
            <button className="btn small" onClick={() => handleExport('csv')}>CSV</button>
            <button className="btn small" onClick={() => handleExport('json')}>JSON</button>
            <button className="btn small" onClick={() => handleExport('geojson')}>GeoJSON</button>
          </div>
        </div>
        <div className="table-wrap overflow-auto">
          {loading ? (
            <div className="p-8 text-center text-muted">
              Fetching real historical climate data from Open-Meteo...
            </div>
          ) : (
            <table className="data-table w-full min-w-[760px] border-collapse">
            <thead>
              <tr>
                <th onClick={() => toggleSort('date')} className="cursor-pointer">Date ↕</th>
                <th onClick={() => toggleSort('aqi')} className="cursor-pointer">AQI ↕</th>
                <th onClick={() => toggleSort('temp')} className="cursor-pointer">Temp ↕</th>
                <th onClick={() => toggleSort('lst')} className="cursor-pointer">LST ↕</th>
                <th onClick={() => toggleSort('ndvi')} className="cursor-pointer">NDVI ↕</th>
                <th onClick={() => toggleSort('building')} className="cursor-pointer">Building ↕</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="hover:bg-surface-2">
                  <td>{r.date}</td>
                  <td><b>{r.aqi}</b></td>
                  <td>{r.temp.toFixed(1)}°C</td>
                  <td>{r.lst.toFixed(1)}°C</td>
                  <td>{r.ndvi.toFixed(2)}</td>
                  <td>{r.building}%</td>
                  <td>
                    <span className={`badge ${r.risk === 'High' ? 'high' : 'moderate'}`}>{r.risk}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </>
  );
}
