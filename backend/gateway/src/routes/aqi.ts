import { Router } from 'express';
import { AqiQuerySchema } from '../schemas/aqi';
import { fetchFromFastAPI } from '../clients/fastapi';
import { logger } from '../app';

const router = Router();

router.get('/current', async (req, res) => {
  try {
    // 1. Validate Query Params
    const query = AqiQuerySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid or missing latitude/longitude parameters.",
          details: query.error.issues,
          retryable: false
        }
      });
    }

    // 2. Fetch from Internal FastAPI Service
    const data = await fetchFromFastAPI('/internal/v1/aqi/current', {
      lat: query.data.lat,
      lon: query.data.lon
    });

    // 3. Return shaped response
    return res.json(data);

  } catch (error) {
    logger.error({ error }, "Error in GET /api/v1/aqi/current");
    
    // Fallback Error Response for FastAPI failure
    return res.status(503).json({
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Internal Data Science service is currently unavailable.",
        retryable: true
      }
    });
  }
});

router.get('/history', async (req, res) => {
  try {
    const query = AqiQuerySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid parameters" } });
    }

    const data = await fetchFromFastAPI('/internal/v1/aqi/history', {
      lat: query.data.lat,
      lon: query.data.lon
    });

    return res.json(data);

  } catch (error) {
    console.log("HISTORY ERROR:", error);
    logger.error({ error }, "Error in GET /api/v1/aqi/history");
    return res.status(503).json({ error: { code: "SERVICE_UNAVAILABLE", message: "FastAPI down" } });
  }
});

export default router;
