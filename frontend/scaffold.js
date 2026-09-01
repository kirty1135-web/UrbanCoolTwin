import fs from 'fs';
import path from 'path';

const pages = ['Home', 'LiveMap', 'AirQuality', 'Environment', 'DataExplorer', 'Insights'];
pages.forEach(page => {
  const content = `import React from 'react';

export default function ${page}() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">${page}</h1>
      <p className="text-muted">Content for ${page} goes here.</p>
    </div>
  );
}
`;
  fs.writeFileSync(path.join('src', 'pages', page, 'index.tsx'), content);
  // Also create index.ts for export
  fs.writeFileSync(path.join('src', 'pages', page, 'index.ts'), `export { default } from './index.tsx';\n`);
});

const components = [
  { dir: 'layout', name: 'Layout' },
  { dir: 'layout', name: 'Header' },
  { dir: 'layout', name: 'Footer' },
  { dir: 'layout', name: 'MobileNav' },
  { dir: 'cards', name: 'AQICard' },
  { dir: 'cards', name: 'HeatRiskCard' },
  { dir: 'cards', name: 'TemperatureCard' },
  { dir: 'cards', name: 'VegetationCard' },
];

components.forEach(comp => {
  const content = `import React from 'react';

export default function ${comp.name}() {
  return (
    <div className="border border-border p-4 rounded-lg bg-surface">
      <h3 className="font-semibold">${comp.name}</h3>
    </div>
  );
}
`;
  fs.writeFileSync(path.join('src', 'components', comp.dir, `${comp.name}.tsx`), content);
});

// Update Layout.tsx specifically
const layoutContent = `import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <nav className="w-64 bg-surface border-r border-border p-4 space-y-2 hidden md:block">
          <Link to="/" className="block p-2 hover:bg-surface-2 rounded">Home</Link>
          <Link to="/map" className="block p-2 hover:bg-surface-2 rounded">Live Map</Link>
          <Link to="/air-quality" className="block p-2 hover:bg-surface-2 rounded">Air Quality</Link>
          <Link to="/environment" className="block p-2 hover:bg-surface-2 rounded">Environment</Link>
          <Link to="/data-explorer" className="block p-2 hover:bg-surface-2 rounded">Data Explorer</Link>
          <Link to="/insights" className="block p-2 hover:bg-surface-2 rounded">Insights</Link>
        </nav>
        <main className="flex-1 bg-bg">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
`;
fs.writeFileSync(path.join('src', 'components', 'layout', 'Layout.tsx'), layoutContent);

console.log('Scaffolding complete.');
