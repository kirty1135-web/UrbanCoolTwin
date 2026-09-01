import { z } from 'zod';

export const BboxQuerySchema = z.object({
  min_lon: z.coerce.number().min(-180).max(180),
  min_lat: z.coerce.number().min(-90).max(90),
  max_lon: z.coerce.number().min(-180).max(180),
  max_lat: z.coerce.number().min(-90).max(90),
});

export type BboxQuery = z.infer<typeof BboxQuerySchema>;
