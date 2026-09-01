# UrbanCool Twin Backend — Master Architecture

## Architecture

UrbanCool uses **Node.js + Express.js** as the public API gateway and **Python + FastAPI** as the scientific/geospatial service.

```text
React + Vite
    |
    v
Node.js + Express.js
Public API Gateway / BFF
    |
    +---- Neon PostgreSQL
    |
    v
FastAPI Scientific/Data Service
    |
    +---- geospatial processing
    +---- satellite processing
    +---- statistics
    +---- anomaly detection
    +---- heat-risk models
    |
    v
Background Workers
    |
    +---- AQI
    +---- Weather
    +---- Satellite
    +---- OSM
    +---- Exports

External sources:
CPCB/India OGD | OpenAQ | Open-Meteo | Copernicus Data Space |
USGS Landsat | Microsoft Planetary Computer | OSM Overpass | MOSDAC
```

## Roles

### Node + Express

- public `/api/v1` contract
- CORS
- rate limiting
- response shaping
- API versioning
- export job submission
- frontend-facing validation
- provider orchestration

### FastAPI

- scientific calculations
- raster/vector processing
- satellite processing
- anomaly detection
- correlation/statistical analysis
- ML/model inference
- geospatial operations

### Database

**Neon PostgreSQL** is the primary persistent database.

Use it for:

```text
observations
time series
locations
grid cells
satellite metadata
derived metrics
analytics results
export jobs
data quality records
```

Use PostGIS/geospatial capabilities where supported by the selected Neon PostgreSQL setup.

For large raster files, store the files in object storage and keep metadata/object paths in Neon rather than placing large raster binaries directly in normal API tables.

## Public endpoints

```text
GET  /api/v1/aqi/current
GET  /api/v1/aqi/history
GET  /api/v1/weather/current
GET  /api/v1/weather/forecast
GET  /api/v1/satellite/lst
GET  /api/v1/environment/vegetation
GET  /api/v1/environment/buildings
GET  /api/v1/heat/current
GET  /api/v1/heat/map
GET  /api/v1/heat/history
GET  /api/v1/analytics/anomalies
GET  /api/v1/analytics/correlations
GET  /api/v1/analytics/insights
POST /api/v1/exports
GET  /api/v1/exports/:id
```

## Internal FastAPI endpoints

```text
/internal/v1/aqi/fetch
/internal/v1/weather/fetch
/internal/v1/satellite/search
/internal/v1/satellite/process
/internal/v1/environment/ndvi
/internal/v1/environment/building-density
/internal/v1/analytics/anomaly
/internal/v1/analytics/correlation
/internal/v1/analytics/heat-risk
```

FastAPI should remain private; Express is the public boundary.

## Scientific rule

The system must distinguish:

```text
observation → association → prediction → causal inference
```

Correlation must not automatically be reported as causation. Derived results must carry source, timestamp, quality, sample size, method and model version.
