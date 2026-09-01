import { Router } from 'express';
import { request } from 'undici';

const router = Router();
const DS_URL = process.env.DATA_SCIENCE_URL || 'http://localhost:8000';

router.get('/points', async (req, res) => {
  try {
    const min_lon = req.query.min_lon || 85.78;
    const min_lat = req.query.min_lat || 20.25;
    const max_lon = req.query.max_lon || 85.88;
    const max_lat = req.query.max_lat || 20.34;

    const { statusCode, body } = await request(`${DS_URL}/internal/v1/explorer/points?min_lon=${min_lon}&min_lat=${min_lat}&max_lon=${max_lon}&max_lat=${max_lat}`, {
      method: 'GET'
    });

    if (statusCode !== 200) {
      throw new Error(`Data Science Service returned ${statusCode}`);
    }

    const data = await body.json();
    res.json(data);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: 'Failed to fetch points data' });
  }
});

export default router;
