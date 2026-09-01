import MetricCard from '../../components/cards/MetricCard';
import BaseChart from '../../components/charts/BaseChart';

export default function Environment() {
  const rows = [
    {date:"2026-08-01",aqi:68,temp:35.2,lst:39.1,ndvi:.42,building:61,risk:"Moderate"},
    {date:"2026-08-03",aqi:74,temp:36.1,lst:40.3,ndvi:.41,building:61,risk:"Moderate"},
    {date:"2026-08-05",aqi:81,temp:37.4,lst:41.7,ndvi:.40,building:62,risk:"High"},
    {date:"2026-08-08",aqi:87,temp:38.0,lst:42.2,ndvi:.39,building:63,risk:"High"},
    {date:"2026-08-10",aqi:92,temp:38.7,lst:43.0,ndvi:.36,building:64,risk:"High"},
    {date:"2026-08-13",aqi:79,temp:36.8,lst:40.8,ndvi:.38,building:65,risk:"Moderate"},
    {date:"2026-08-16",aqi:83,temp:37.9,lst:41.4,ndvi:.34,building:66,risk:"High"},
    {date:"2026-08-19",aqi:96,temp:39.0,lst:43.6,ndvi:.31,building:67,risk:"High"},
    {date:"2026-08-22",aqi:88,temp:38.2,lst:42.4,ndvi:.30,building:68,risk:"High"},
    {date:"2026-08-25",aqi:76,temp:37.0,lst:40.1,ndvi:.33,building:67,risk:"Moderate"},
    {date:"2026-08-28",aqi:84,temp:38.1,lst:41.8,ndvi:.32,building:67,risk:"High"},
    {date:"2026-08-30",aqi:72,temp:38.4,lst:41.2,ndvi:.32,building:67,risk:"Moderate"}
  ];

  const ndviData = rows.map(r => [r.ndvi, r.lst]);
  const buildingData = rows.map(r => [r.building, r.lst]);

  return (
    <>
      <div className="page-title">
        <div className="eyebrow">Urban environment</div>
        <h2>Vegetation & built environment</h2>
        <p>Explore the physical characteristics associated with urban heat patterns.</p>
      </div>
      
      <div className="grid metrics">
        <MetricCard label="VEGETATION COVER" value="28%" sub="NDVI 0.32" type="green" />
        <MetricCard label="BUILDING DENSITY" value="67%" sub="Selected zone" />
        <MetricCard label="LAND SURFACE TEMP." value="41.2°C" sub="Latest satellite observation" type="temp" />
        <MetricCard label="BUILT-UP AREA" value="61%" sub="Derived spatial indicator" />
      </div>

      <div className="section-head">
        <div>
          <h2>Environmental relationships</h2>
          <p>Associations in the selected sample; not proof of causation.</p>
        </div>
      </div>
      
      <div className="content-grid">
        <div className="card chart-card">
          <h3>LST vs vegetation</h3>
          <BaseChart option={{
            xAxis: { type: 'value', name: 'Lower ↔ Higher', nameLocation: 'middle', nameGap: 20 },
            yAxis: { type: 'value', name: 'Low ↕ High' },
            series: [{ data: ndviData, type: 'scatter', itemStyle: { color: '#2563eb', opacity: 0.75 } }]
          }} />
        </div>
        <div className="card chart-card">
          <h3>Building density vs heat</h3>
          <BaseChart option={{
            xAxis: { type: 'value', name: 'Lower ↔ Higher', nameLocation: 'middle', nameGap: 20 },
            yAxis: { type: 'value', name: 'Low ↕ High' },
            series: [{ data: buildingData, type: 'scatter', itemStyle: { color: '#2563eb', opacity: 0.75 } }]
          }} />
        </div>
      </div>
    </>
  );
}
