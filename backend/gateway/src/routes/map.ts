import { Router } from 'express';
import { BboxQuerySchema } from '../schemas/map';
import { fetchFromFastAPI } from '../clients/fastapi';
import { logger } from '../app';

const router = Router();

const MAP_LAYERS = ['buildings', 'vegetation', 'heat', 'aqi'];

router.get('/:layer', async (req, res) => {
  const { layer } = req.params;
  
  if (!MAP_LAYERS.includes(layer)) {
    return res.status(404).json({ error: { message: "Layer not found" } });
  }

  try {
    const query = BboxQuerySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid bounding box parameters.",
          details: query.error.issues,
          retryable: false
        }
      });
    }

    const data = await fetchFromFastAPI(`/internal/v1/map/${layer}`, {
      min_lon: query.data.min_lon,
      min_lat: query.data.min_lat,
      max_lon: query.data.max_lon,
      max_lat: query.data.max_lat
    });

    return res.json(data);

  } catch (error) {
    logger.error({ error }, `Error in GET /api/v1/map/${layer}`);
    
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
