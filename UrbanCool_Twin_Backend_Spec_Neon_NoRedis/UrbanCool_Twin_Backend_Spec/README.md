# UrbanCool Twin Backend Specification Pack

Phased backend documentation matching the Vite frontend architecture.

## Files

- `00-BACKEND-OVERVIEW.md` — architecture
- `01-PHASE-1-NODE-EXPRESS.md` — Node/Express gateway
- `02-PHASE-2-FASTAPI-DATA-SCIENCE.md` — FastAPI scientific service
- `03-PHASE-3-ACTUAL-APIS.md` — concrete external APIs and data
- `04-PHASE-4-INGESTION-DATABASE.md` — ingestion and database
- `05-PHASE-5-SATELLITE-HEAT-ANALYTICS.md` — satellite/heat/analytics
- `06-PHASE-6-HISTORY-EXPORTS.md` — historical data/export
- `07-PHASE-7-DEPLOYMENT.md` — deployment/security
- `08-PHASE-8-ROADMAP.md` — implementation sequence
- `09-OFFICIAL-API-REFERENCE.md` — official provider documentation

## Runtime split

```text
Vite React
   ↓
Node.js + Express
   ↓
FastAPI
   ↓
Neon PostgreSQL +    ↓
Workers
   ↓
AQI / Weather / Satellite / OSM / MOSDAC providers
```
