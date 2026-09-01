import { request } from 'undici';
import { logger } from '../app';

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000';

export async function fetchFromFastAPI(endpoint: string, queryParams?: Record<string, string | number>) {
  const url = new URL(`${FASTAPI_BASE_URL}${endpoint}`);
  
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  try {
    const { statusCode, body } = await request(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      bodyTimeout: 30000,
      headersTimeout: 30000,
    });

    const data = await body.json();

    if (statusCode !== 200) {
      logger.error({ data }, `FastAPI returned status ${statusCode}`);
      throw new Error('FastAPI Error');
    }

    return data;
  } catch (error) {
    logger.error({ error }, `Failed to fetch from FastAPI at ${url.toString()}`);
    throw error;
  }
}
