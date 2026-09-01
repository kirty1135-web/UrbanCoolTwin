import RealMap from '../../components/map/RealMap';

export default function LiveMap() {
  return (
    <>
      <div className="page-title mb-6">
        <div className="eyebrow text-blue-400 text-sm font-semibold tracking-wider uppercase mb-2">Geospatial view</div>
        <h2 className="text-3xl font-bold text-white mb-2">Live environmental map</h2>
        <p className="text-slate-400">Switch between environmental layers and inspect representative locations.</p>
      </div>
      <div className="card map-card w-full">
        <RealMap />
      </div>
    </>
  );
}
