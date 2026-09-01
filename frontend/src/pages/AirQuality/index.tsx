import MetricCard from '../../components/cards/MetricCard';
import BaseChart from '../../components/charts/BaseChart';
import { useCurrentAQI } from '../../hooks/useAQI';
import { useAQIHistory } from '../../hooks/useAQIHistory';

export default function AirQuality() {
  // Bhubaneswar coordinates for now
  const lat = 20.2961;
  const lon = 85.8245;

  const { data: currentData, isLoading: isLoadingCurrent } = useCurrentAQI(lat, lon);
  const { data: historyData, isLoading: isLoadingHistory } = useAQIHistory(lat, lon);

  const aqi = currentData?.data?.aqi ?? 0;
  const category = currentData?.data?.category ?? 'Unknown';
  const pm25 = currentData?.data?.pm25 ?? 0;
  const pm10 = currentData?.data?.pm10 ?? 0;
  const no2 = currentData?.data?.no2 ?? 0;
  const o3 = currentData?.data?.o3 ?? 0;

  const trendData = historyData?.history || [];
  
  // Calculate relative percentages for the pollution components bars (mock max limits)
  const pm25Pct = Math.min(100, (pm25 / 50) * 100);
  const pm10Pct = Math.min(100, (pm10 / 100) * 100);
  const no2Pct = Math.min(100, (no2 / 50) * 100);
  const o3Pct = Math.min(100, (o3 / 100) * 100);

  return (
    <>
      <div className="page-title">
        <div className="eyebrow">Air quality</div>
        <h2>Air quality over time</h2>
        <p>Current pollution levels and historical observations for the selected area.</p>
      </div>
      
      <div className="grid metrics">
        <MetricCard label="AQI" value={isLoadingCurrent ? "..." : aqi.toString()} type="aqi">
          <span className={`badge ${aqi > 100 ? 'high' : 'moderate'}`}>{category}</span>
        </MetricCard>
        <MetricCard label="PM2.5" value={isLoadingCurrent ? "..." : pm25.toString()} sub="µg/m³" />
        <MetricCard label="PM10" value={isLoadingCurrent ? "..." : pm10.toString()} sub="µg/m³" />
        <MetricCard label="NO₂" value={isLoadingCurrent ? "..." : no2.toString()} sub="µg/m³" />
      </div>

      <div className="section-head">
        <div>
          <h2>Trends</h2>
          <p>Real-time 30-day series from Open-Meteo</p>
        </div>
      </div>
      
      <div className="content-grid">
        <div className="card chart-card">
          <h3>AQI trend</h3>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-[200px] text-slate-500">Loading history...</div>
          ) : (
            <BaseChart option={{
              xAxis: { 
                data: Array(trendData.length).fill('').map((_, i) => {
                  if (i === 0) return '30 Days Ago';
                  if (i === trendData.length - 1) return 'Today';
                  return '';
                }) 
              },
              series: [{ 
                data: trendData, 
                type: 'line', 
                smooth: true, 
                areaStyle: { opacity: 0.12 }, 
                lineStyle: { width: 3 }, 
                itemStyle: { color: '#2563eb' } 
              }]
            }} />
          )}
        </div>
        <div className="card chart-card">
          <h3>Pollution components</h3>
          <div className="grid gap-[14px] mt-[18px]">
            <div className="grid grid-cols-[105px_1fr_50px] items-center gap-[10px] text-[12px]">
              <span>PM2.5</span>
              <div className="h-[8px] bg-surface-2 rounded-[10px] overflow-hidden"><span className="block h-full rounded-[10px] bg-accent" style={{ width: `${pm25Pct}%` }}></span></div>
              <b>{pm25}</b>
            </div>
            <div className="grid grid-cols-[105px_1fr_50px] items-center gap-[10px] text-[12px]">
              <span>PM10</span>
              <div className="h-[8px] bg-surface-2 rounded-[10px] overflow-hidden"><span className="block h-full rounded-[10px] bg-accent" style={{ width: `${pm10Pct}%` }}></span></div>
              <b>{pm10}</b>
            </div>
            <div className="grid grid-cols-[105px_1fr_50px] items-center gap-[10px] text-[12px]">
              <span>NO₂</span>
              <div className="h-[8px] bg-surface-2 rounded-[10px] overflow-hidden"><span className="block h-full rounded-[10px] bg-accent" style={{ width: `${no2Pct}%` }}></span></div>
              <b>{no2}</b>
            </div>
            <div className="grid grid-cols-[105px_1fr_50px] items-center gap-[10px] text-[12px]">
              <span>O₃</span>
              <div className="h-[8px] bg-surface-2 rounded-[10px] overflow-hidden"><span className="block h-full rounded-[10px] bg-accent" style={{ width: `${o3Pct}%` }}></span></div>
              <b>{o3}</b>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
