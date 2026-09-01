import { Link } from 'react-router-dom';
import MetricCard from '../../components/cards/MetricCard';
import RealMap from '../../components/map/RealMap';
import BaseChart from '../../components/charts/BaseChart';
import { useCurrentAQI } from '../../hooks/useAQI';
import { useAQIHistory } from '../../hooks/useAQIHistory';

export default function Home() {
  const lat = 20.2961;
  const lon = 85.8245;

  const { data: currentAqi, isLoading: aqiLoading } = useCurrentAQI(lat, lon);
  const { data: historyAqi } = useAQIHistory(lat, lon);

  const aqiVal = currentAqi?.data?.aqi ?? 0;
  const aqiCat = currentAqi?.data?.category ?? 'Unknown';
  const pm25 = currentAqi?.data?.pm25 ?? 0;

  // Use the last 24 hours of history for the AQI chart
  const aqiChartData = historyAqi?.history ? historyAqi.history.slice(-24) : [];
  
  // Static temperature data for now until forecast API is built
  const tempChartData = [31, 30, 30, 31, 32, 34, 35, 37, 38, 38, 39, 39, 38, 37, 36, 35, 34, 33, 32, 31, 31, 32, 35, 38];

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start py-12 lg:py-20 border-b border-border/40 mb-10">
        <div className="flex-1 max-w-3xl">
          <div className="eyebrow mb-4 inline-block px-3 py-1 bg-accent/10 text-accent rounded-full border border-accent/20">Public environmental intelligence</div>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">See how cities breathe, heat and change.</h1>
          <p className="text-lg lg:text-xl text-muted max-w-2xl leading-relaxed mb-10">UrbanCool Twin brings air quality, urban heat, vegetation, built density, weather and satellite observations into one public, explorable view.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/map" className="btn primary px-6 py-3 text-sm">Explore live map →</Link>
            <Link to="/data-explorer" className="btn px-6 py-3 text-sm bg-surface-2 hover:bg-surface border-border">Explore historical data</Link>
          </div>
        </div>
        <div className="w-full lg:w-[420px] bg-surface/40 backdrop-blur-2xl p-8 rounded-3xl border border-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:mt-4">
          <div className="eyebrow text-muted">Current city</div>
          <div className="text-[46px] font-[800] mt-1 mb-6 tracking-tight text-text">Bhubaneswar</div>
          <div className="flex justify-between items-center border-b border-border/50 py-4 text-sm">
            <span className="flex items-center text-muted font-medium"><span className="inline-block w-2.5 h-2.5 rounded-full bg-green shadow-[0_0_8px_rgba(16,185,129,0.6)] mr-3 animate-pulse"></span>Data services online</span>
            <span className="text-green font-bold bg-green/10 px-2.5 py-1 rounded-md text-xs uppercase tracking-widest">Live</span>
          </div>
          <div className="flex justify-between items-center border-b border-border/50 py-4 text-sm text-muted">
            <span>Last refresh</span><strong className="text-text">5 min ago</strong>
          </div>
          <div className="flex justify-between items-center pt-4 text-sm text-muted">
            <span>Observation coverage</span><strong className="text-text">30 days</strong>
          </div>
        </div>
      </div>

      <div className="grid metrics">
        <MetricCard label="AIR QUALITY INDEX" value={aqiLoading ? '...' : aqiVal.toString()} sub={`PM2.5 · ${pm25} µg/m³`} type="aqi">
          <span className={`badge ${aqiVal > 100 ? 'high' : 'moderate'}`}>{aqiCat}</span>
        </MetricCard>
        <MetricCard label="HEAT RISK" value="HIGH" sub="Model-derived probability" type="heat">
          <span className="badge high">82% estimated</span>
        </MetricCard>
        <MetricCard label="AIR TEMPERATURE" value="38.4°C" sub="Feels like 40.1°C" type="temp" />
        <MetricCard label="VEGETATION" value="28%" sub="NDVI · 0.32" type="green" />
      </div>

      <div className="section-head">
        <div>
          <h2>Live urban heat</h2>
          <p>Current spatial pattern · illustrative static map</p>
        </div>
        <Link to="/map" className="btn small">Open full map</Link>
      </div>
      
      <div className="card map-card p-0 overflow-hidden">
        <RealMap />
      </div>

      <div className="section-head">
        <div>
          <h2>Recent conditions</h2>
          <p>Current trends from the selected city</p>
        </div>
      </div>
      <div className="content-grid">
        <div className="card chart-card">
          <h3>AQI · last 24 hours</h3>
          <BaseChart option={{
            xAxis: { data: Array(24).fill('').map((_, i) => i === 0 ? '00:00' : i === 23 ? 'Now' : '') },
            series: [{ data: aqiChartData, type: 'line', smooth: false, areaStyle: { opacity: 0.12 }, lineStyle: { width: 3 }, itemStyle: { color: '#2563eb' } }]
          }} />
        </div>
        <div className="card chart-card">
          <h3>Temperature · last 24 hours</h3>
          <BaseChart option={{
            xAxis: { data: Array(24).fill('').map((_, i) => i === 0 ? '00:00' : i === 23 ? 'Now' : '') },
            series: [{ data: tempChartData, type: 'line', smooth: false, areaStyle: { opacity: 0.12 }, lineStyle: { width: 3 }, itemStyle: { color: '#f97316' } }]
          }} />
        </div>
      </div>

      <div className="section-head">
        <div>
          <h2>Data sources</h2>
          <p>Each dataset retains its own update cadence.</p>
        </div>
      </div>
      <div className="grid source-grid">
        <div className="card source"><b>Air Quality</b><small>Updated 5 min ago</small></div>
        <div className="card source"><b>Weather</b><small>Updated 15 min ago</small></div>
        <div className="card source"><b>Satellite</b><small>Observation: 29 Aug</small></div>
        <div className="card source"><b>Vegetation</b><small>Observation: 29 Aug</small></div>
      </div>
    </>
  );
}
