import { Router } from 'express';
import { z } from 'zod';
import { fetchFromFastAPI } from '../clients/fastapi';
import { logger } from '../app';

const router = Router();

const ForecastQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180)
});

router.get('/', async (req, res) => {
  try {
    const query = ForecastQuerySchema.safeParse(req.query);
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

    const data = await fetchFromFastAPI('/internal/v1/forecast', {
      lat: query.data.lat,
      lon: query.data.lon
    });

    return res.json(data);

  } catch (error) {
    logger.error({ error }, "Error in GET /api/v1/forecast");
    
    return res.status(503).json({
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Internal Data Science service is currently unavailable.",
        retryable: true
      }
    });
  }
});

export default router;
