import { Router } from 'express';
import { request } from 'undici';
import { logger } from '../app';

const router = Router();
const DS_URL = process.env.DATA_SCIENCE_URL || 'http://localhost:8000';

router.post('/attribution', async (req, res) => {
  try {
    const { lat, lon, temp, aqi, ndvi, building_density } = req.body;
    
    if (lat === undefined || lon === undefined || temp === undefined || aqi === undefined || ndvi === undefined || building_density === undefined) {
      return res.status(400).json({ error: 'Missing required spatial parameters' });
    }

    const { statusCode, body } = await request(`${DS_URL}/internal/v1/analytics/attribution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ lat, lon, temp, aqi, ndvi, building_density }),
      bodyTimeout: 30000,
      headersTimeout: 30000
    });

    if (statusCode !== 200) {
      throw new Error(`Data Science Service returned ${statusCode}`);
    }

    const data = await body.json();
    res.json(data);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Failed to fetch AI attribution' });
  }
});

export default router;
