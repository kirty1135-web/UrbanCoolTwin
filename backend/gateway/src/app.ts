import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'urbancool-gateway' });
});

// Import and use routes
import aqiRoutes from './routes/aqi';
import mapRoutes from './routes/map';
import forecastRoutes from './routes/forecast';
import explorerRoutes from './routes/explorer';
import analyticsRoutes from './routes/analytics';

app.use('/api/v1/aqi', aqiRoutes);
app.use('/api/v1/map', mapRoutes);
app.use('/api/v1/forecast', forecastRoutes);
app.use('/api/v1/explorer', explorerRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

export { logger };
