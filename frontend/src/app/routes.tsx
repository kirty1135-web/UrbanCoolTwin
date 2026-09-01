import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import LiveMap from '../pages/LiveMap';
import AirQuality from '../pages/AirQuality';
import Environment from '../pages/Environment';
import DataExplorer from '../pages/DataExplorer';
import Layout from '../components/layout/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/map', element: <LiveMap /> },
      { path: '/air-quality', element: <AirQuality /> },
      { path: '/environment', element: <Environment /> },
      { path: '/data-explorer', element: <DataExplorer /> }
    ]
  }
]);
