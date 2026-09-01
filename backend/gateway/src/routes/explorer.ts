import { Router } from 'express';
import { request } from 'undici';

const router = Router();
const DS_URL = process.env.DATA_SCIENCE_URL || 'http://localhost:8000';

router.get('/history', async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'Missing from or to parameters' });
    }

    const { statusCode, body } = await request(`${DS_URL}/internal/v1/explorer/history?from_date=${from}&to_date=${to}`, {
      method: 'GET'
    });

    if (statusCode !== 200) {
      throw new Error(`Data Science Service returned ${statusCode}`);
    }

    const data = await body.json();
    res.json(data);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

export default router;
