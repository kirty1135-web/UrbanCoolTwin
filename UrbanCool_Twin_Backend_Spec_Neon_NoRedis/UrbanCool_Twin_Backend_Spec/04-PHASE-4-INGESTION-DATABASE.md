# Phase 4 — Ingestion, Normalization and Neon PostgreSQL

## Pipeline

```text
Provider API
  ↓
Adapter
  ↓
Raw response
  ↓
Schema validation
  ↓
Normalization
  ↓
Quality checks
  ↓
Canonical observation
  ↓
Neon PostgreSQL
  ↓
API / FastAPI / Workers
```

## Database

Use **Neon PostgreSQL** as the central persistent store.

Recommended environment:

```env
DATABASE_URL=postgresql://<user>:<password>@<neon-host>/<database>?sslmode=require
```

Use SSL and keep the connection string server-side.

## Tables

```text
locations
grid_cells
aqi_observations
weather_observations
weather_forecasts
air_quality_model
satellite_items
lst_observations
vegetation_observations
building_density
heat_scores
anomalies
correlations
model_runs
data_quality_events
export_jobs
```

## AQI table

```sql
CREATE TABLE aqi_observations (
  id BIGSERIAL PRIMARY KEY,
  location_id BIGINT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  pollutant TEXT,
  value DOUBLE PRECISION,
  unit TEXT,
  aqi DOUBLE PRECISION,
  source TEXT NOT NULL,
  provider TEXT NOT NULL,
  quality TEXT NOT NULL,
  raw_record_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX aqi_location_time_idx
ON aqi_observations(location_id, observed_at DESC);
```

## Common grid

All major variables should be mapped to a common spatial grid:

```text
AQI
Weather
LST
NDVI
Buildings
Heat
```

A 100–250 m analysis grid can be a useful starting point, but native data resolution must always remain visible.

## Caching without Redis

The initial implementation should avoid a separate cache database.

Use:

1. provider-aware refresh intervals
2. indexed Neon queries
3. materialized/summary tables for expensive aggregates
4. HTTP cache headers where appropriate
5. in-process short-lived caching only for non-critical metadata if needed

Do not use in-process memory as the source of truth.

## Freshness

Store:

```text
observed_at
received_at
processed_at
source
quality
resolution
processing_version
```

## Missing data

Return:

```json
{
  "value": null,
  "quality": "missing",
  "reason": "provider_unavailable"
}
```

Do not substitute fake values.

## Stale data

If the provider fails:

```json
{
  "value": 72,
  "quality": "stale",
  "provider_status": "unavailable"
}
```

The frontend must be able to distinguish stale from live data.
