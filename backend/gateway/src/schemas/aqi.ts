import { z } from 'zod';

export const AqiQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export type AqiQuery = z.infer<typeof AqiQuerySchema>;
