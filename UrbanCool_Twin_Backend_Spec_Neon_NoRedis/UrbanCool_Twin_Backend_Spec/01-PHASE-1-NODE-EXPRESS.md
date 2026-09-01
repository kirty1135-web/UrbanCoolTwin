# Phase 1 — Node.js + Express.js API Gateway

## Stack

```text
Node.js 22+
Express 5
TypeScript
Zod
undici
Pino
Helmet
cors
express-rate-limit
```

## Structure

```text
services/api-gateway/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config.ts
│   ├── middleware/
│   ├── routes/
│   │   ├── aqi.ts
│   │   ├── weather.ts
│   │   ├── satellite.ts
│   │   ├── environment.ts
│   │   ├── heat.ts
│   │   ├── analytics.ts
│   │   └── exports.ts
│   ├── services/
│   ├── clients/fastapi.ts
│   └── schemas/
└── package.json
```

## Public API

```http
GET /api/v1/aqi/current?lat=20.2961&lon=85.8245
GET /api/v1/aqi/history?lat=20.2961&lon=85.8245&from=2026-08-01&to=2026-08-31

GET /api/v1/weather/current?lat=20.2961&lon=85.8245
GET /api/v1/weather/forecast?lat=20.2961&lon=85.8245

GET /api/v1/satellite/lst?bbox=85.78,20.25,85.88,20.34
GET /api/v1/environment/vegetation?bbox=85.78,20.25,85.88,20.34
GET /api/v1/environment/buildings?bbox=85.78,20.25,85.88,20.34

GET /api/v1/heat/current?lat=20.2961&lon=85.8245
GET /api/v1/heat/map?bbox=85.78,20.25,85.88,20.34

GET /api/v1/analytics/anomalies?metric=lst&location=bbsr
GET /api/v1/analytics/correlations?x=ndvi&y=lst&location=bbsr
GET /api/v1/analytics/insights?location=bbsr

POST /api/v1/exports
GET /api/v1/exports/:id
```

## Response contract

```json
{
  "data": {},
  "meta": {
    "observed_at": "2026-08-30T10:30:00Z",
    "source": "openaq",
    "quality": "validated",
    "freshness_seconds": 240
  }
}
```

## Errors

```json
{
  "error": {
    "code": "DATA_STALE",
    "message": "Latest provider data is stale.",
    "retryable": false
  }
}
```

## Database connection

Use Neon PostgreSQL through a server-side connection string:

```env
DATABASE_URL=postgresql://...
```

Do not expose `DATABASE_URL` to Vite/client-side code.

## Security

Use:

```text
Helmet
strict CORS
rate limiting
Zod validation
HTTPS
request-size limits
server-side provider secrets
```

No public user login is required.
