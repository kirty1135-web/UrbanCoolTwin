# UrbanCool Twin — Backend Architecture, API & Data Platform Specification

**Document type:** Backend implementation specification  
**Project:** UrbanCool Twin — Public Urban Environmental Intelligence Platform  
**Frontend counterpart:** `UrbanCool_Twin_Frontend_Architecture_API_Spec.md`  
**Status:** Architecture → implementation ready  
**Target region:** India-first, extensible globally  
**Authentication:** None for public read-only frontend APIs  
**Primary responsibility:** Ingest, normalize, store, process, analyze and serve environmental data  
**Frontend contract:** REST/JSON API under `/v1`

---

# 1. Backend Goal

The UrbanCool Twin backend acts as the central data and analytics layer between the public frontend and multiple environmental data providers.

It should:

- ingest real-time/near-real-time sensor and weather data
- ingest interval-updated satellite observations
- normalize data from different providers
- standardize timestamps, units and geographic formats
- store historical observations
- generate map-ready spatial datasets
- calculate environmental indicators
- detect anomalies
- calculate statistical associations/correlations
- provide probabilistic heat-risk estimates
- expose clean REST APIs to the frontend
- provide exportable datasets
- protect external API credentials
- cache expensive/slow provider requests
- continue operating when individual providers are unavailable

The backend should **not claim causal relationships from observational overlap alone**.

---

# 2. High-Level Architecture

```text
                         PUBLIC USERS
                              │
                              ▼
                    ┌───────────────────┐
                    │ React + Vite App  │
                    └─────────┬─────────┘
                              │ HTTPS
                              ▼
                    ┌───────────────────┐
                    │ API Gateway /     │
                    │ Load Balancer     │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ UrbanCool Backend │
                    │ REST API          │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   Query Services       Analytics Services     Export Service
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Cache / Database  │
                    └─────────┬─────────┘
                              │
                ┌─────────────┼──────────────┐
                │             │              │
                ▼             ▼              ▼
             AQI/IoT       Weather       Satellite
             Providers     Providers      Providers
                │             │              │
                └─────────────┼──────────────┘
                              ▼
                    Ingestion Workers
                              │
                              ▼
                    Normalization Layer
                              │
                              ▼
                    Spatial Processing
                              │
                              ▼
                    Analytics / Models
```

---

# 3. Recommended Backend Stack

## 3.1 Primary language

```text
Python 3.12+
```

Python is recommended because the project will eventually require:

- geospatial processing
- statistics
- anomaly detection
- machine learning
- satellite processing
- scientific data processing
- data validation

---

# 4. API Framework

Recommended:

```text
FastAPI
```

Why:

- high-performance async API
- automatic OpenAPI documentation
- Pydantic validation
- strong typing
- easy integration with Python scientific tooling
- clean REST architecture

Development API:

```text
http://localhost:8000
```

OpenAPI:

```text
/docs
```

---

# 5. Database

Recommended primary database:

```text
PostgreSQL
+
PostGIS
```

PostGIS is important because UrbanCool is fundamentally a spatial application.

Required capabilities include:

- points
- polygons
- bounding boxes
- spatial intersections
- geographic aggregation
- map tiles
- distance queries
- spatial joins

---

# 6. Time-Series Storage

Recommended initial architecture:

```text
PostgreSQL
+
TimescaleDB extension
```

Use time-series tables for:

- AQI
- PM2.5
- PM10
- weather
- temperature
- humidity
- wind
- sensor observations

This keeps the first architecture simpler than operating a separate time-series database.

---

# 7. Object Storage

Use object storage for large files:

```text
S3-compatible storage
```

Examples:

```text
AWS S3
Cloudflare R2
MinIO
Google Cloud Storage
Azure Blob Storage
```

Store:

- raw satellite files
- GeoTIFF
- GeoJSON exports
- large CSV exports
- NetCDF
- model artifacts
- processing outputs

Do not store large raster files directly inside PostgreSQL.

---

# 8. Cache

Recommended:

```text
Redis
```

Use Redis for:

- API response caching
- provider response caching
- rate limiting
- short-lived jobs
- frequently requested map layers
- forecast caching
- distributed locks

Example:

```text
aqi:20.2961:85.8245
weather:20.2961:85.8245
heat-map:bbsr:latest
```

---

# 9. Background Processing

Recommended:

```text
Celery
+
Redis
```

Alternative:

```text
RQ
Dramatiq
Arq
```

Background workers handle:

- provider polling
- satellite ingestion
- data cleaning
- spatial aggregation
- anomaly calculation
- exports
- model inference

Do not perform heavy satellite processing inside a normal API request.

---

# 10. Backend Repository Structure

```text
backend/
│
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   └── v1/
│   │       ├── aqi.py
│   │       ├── weather.py
│   │       ├── satellite.py
│   │       ├── vegetation.py
│   │       ├── buildings.py
│   │       ├── heat.py
│   │       ├── analytics.py
│   │       └── exports.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── logging.py
│   │   ├── security.py
│   │   └── exceptions.py
│   │
│   ├── models/
│   │   ├── aqi.py
│   │   ├── weather.py
│   │   ├── satellite.py
│   │   ├── vegetation.py
│   │   ├── buildings.py
│   │   ├── heat.py
│   │   └── location.py
│   │
│   ├── schemas/
│   │   ├── aqi.py
│   │   ├── weather.py
│   │   ├── satellite.py
│   │   ├── environment.py
│   │   └── analytics.py
│   │
│   ├── services/
│   │   ├── aqi_service.py
│   │   ├── weather_service.py
│   │   ├── satellite_service.py
│   │   ├── vegetation_service.py
│   │   ├── building_service.py
│   │   ├── heat_service.py
│   │   └── analytics_service.py
│   │
│   ├── providers/
│   │   ├── aqi/
│   │   ├── weather/
│   │   ├── satellite/
│   │   └── maps/
│   │
│   ├── ingestion/
│   │   ├── jobs/
│   │   ├── pipelines/
│   │   └── normalizers/
│   │
│   ├── analytics/
│   │   ├── anomalies.py
│   │   ├── correlations.py
│   │   ├── heat_risk.py
│   │   └── validation.py
│   │
│   ├── workers/
│   │   ├── celery_app.py
│   │   └── tasks.py
│   │
│   └── db/
│       ├── session.py
│       ├── migrations/
│       └── repositories/
│
├── tests/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example
```

---

# 11. Provider-Abstraction Architecture

External providers must never be tightly coupled to API endpoints.

Use:

```text
Provider Adapter
       ↓
Raw Data
       ↓
Normalizer
       ↓
Canonical Data Model
       ↓
Database
       ↓
API
```

Example:

```text
OpenWeather adapter
Weather provider B adapter
Weather provider C adapter
        │
        ▼
WeatherNormalizer
        │
        ▼
CanonicalWeatherObservation
```

This means the provider can be replaced without rewriting the frontend.

---

# 12. Canonical Data Model

All providers should ultimately map into common internal fields.

Example environmental observation:

```json
{
  "location_id": "bbsr-grid-001",
  "latitude": 20.2961,
  "longitude": 85.8245,
  "observed_at": "2026-08-30T10:30:00Z",
  "temperature_c": 38.4,
  "lst_c": 41.2,
  "aqi": 72,
  "pm25_ug_m3": 31,
  "pm10_ug_m3": 64,
  "ndvi": 0.32,
  "vegetation_cover_percent": 28,
  "building_density_percent": 67
}
```

---

# 13. Data Provenance

Every observation must retain provenance.

Minimum metadata:

```text
source
provider
source_record_id
observed_at
received_at
processed_at
quality
resolution
units
processing_version
```

Example:

```json
{
  "source": "satellite-provider",
  "provider": "provider-name",
  "source_record_id": "abc123",
  "observed_at": "2026-08-29T05:30:00Z",
  "received_at": "2026-08-29T08:10:00Z",
  "processed_at": "2026-08-29T08:15:00Z",
  "quality": "good",
  "resolution_m": 30,
  "processing_version": "lst-v1"
}
```

This is essential for scientific traceability.

---

# 14. Location Model

UrbanCool should use a consistent spatial hierarchy.

```text
Country
  ↓
State
  ↓
District
  ↓
City
  ↓
Ward / Zone
  ↓
Grid Cell
  ↓
Sensor / Observation Point
```

Example:

```text
India
└── Odisha
    └── Khordha
        └── Bhubaneswar
            └── Ward
                └── Grid cell
                    └── Observation
```

---

# 15. Grid-Based Spatial Model

For environmental map comparisons, a common spatial grid is recommended.

Example:

```text
City
┌────┬────┬────┬────┐
│ G1 │ G2 │ G3 │ G4 │
├────┼────┼────┼────┤
│ G5 │ G6 │ G7 │ G8 │
├────┼────┼────┼────┤
│ G9 │G10 │G11 │G12 │
└────┴────┴────┴────┘
```

Different observations can be aggregated to the same grid:

```text
AQI
Weather
LST
NDVI
Buildings
Heat risk
```

This makes cross-dataset analysis much easier.

---

# 16. AQI Ingestion

Provider adapter:

```text
providers/aqi/
```

The ingestion process:

```text
AQI Provider
    ↓
Fetch
    ↓
Validate
    ↓
Normalize units
    ↓
Normalize AQI
    ↓
Attach coordinates
    ↓
Quality checks
    ↓
Database
```

Important:

Different providers/countries may use different AQI methodologies.

The backend should retain:

```text
provider_aqi
aqi_standard
aqi_calculated
```

rather than silently mixing incompatible values.

---

# 17. AQI API

## Current

```http
GET /v1/aqi/current
```

Parameters:

```text
lat
lon
radius
```

Response:

```json
{
  "data": {
    "aqi": 72,
    "category": "Moderate",
    "pm25_ug_m3": 31,
    "pm10_ug_m3": 64,
    "no2_ug_m3": 28,
    "o3_ug_m3": 34
  },
  "meta": {
    "observed_at": "2026-08-30T10:25:00Z",
    "source": "normalized-provider",
    "quality": "validated"
  }
}
```

---

# 18. Historical AQI

```http
GET /v1/aqi/history
```

Parameters:

```text
lat
lon
from
to
interval
```

Example:

```http
GET /v1/aqi/history?lat=20.2961&lon=85.8245&from=2026-08-01&to=2026-08-30&interval=hour
```

Support:

```text
hour
day
week
month
```

Aggregation should happen server-side.

---

# 19. Weather Ingestion

```text
Weather Provider
       ↓
Provider Adapter
       ↓
Validation
       ↓
Unit normalization
       ↓
Canonical Weather Model
       ↓
Timeseries DB
```

Fields:

```text
temperature
feels_like
humidity
pressure
wind_speed
wind_direction
rain
rain_probability
cloud_cover
solar_radiation
```

---

# 20. Weather APIs

```http
GET /v1/weather/current
GET /v1/weather/forecast
GET /v1/weather/history
```

Current:

```json
{
  "data": {
    "temperature_c": 38.4,
    "feels_like_c": 40.1,
    "humidity_percent": 62,
    "wind_speed_ms": 1.5,
    "rain_probability_percent": 18
  },
  "meta": {
    "observed_at": "2026-08-30T10:30:00Z"
  }
}
```

Forecast:

```json
{
  "data": [
    {
      "timestamp": "2026-08-30T12:00:00Z",
      "temperature_c": 38.8,
      "wind_speed_ms": 1.4,
      "rain_probability_percent": 12
    }
  ]
}
```

---

# 21. Satellite Architecture

Satellite data should be treated differently from real-time sensor data.

```text
Satellite Provider
       ↓
Observation availability
       ↓
Download
       ↓
Cloud / quality filtering
       ↓
Geospatial processing
       ↓
Raster / vector generation
       ↓
Object storage
       ↓
Map layer service
```

The backend should store:

```text
acquisition time
processing time
satellite/platform
sensor/instrument
resolution
cloud coverage
quality
```

---

# 22. LST Pipeline

```text
Satellite observation
        ↓
Quality filtering
        ↓
Cloud masking
        ↓
LST retrieval / source product
        ↓
Temperature unit conversion
        ↓
Spatial clipping
        ↓
Grid aggregation
        ↓
Database + raster storage
```

API:

```http
GET /v1/satellite/lst
```

---

# 23. Vegetation / NDVI Pipeline

```text
Satellite imagery
       ↓
Cloud masking
       ↓
Vegetation index calculation/product
       ↓
Spatial aggregation
       ↓
NDVI
       ↓
Vegetation cover estimate
```

API:

```http
GET /v1/environment/vegetation
```

Response:

```json
{
  "data": {
    "ndvi": 0.32,
    "vegetation_cover_percent": 28
  },
  "meta": {
    "observed_at": "2026-08-29T05:30:00Z",
    "resolution_m": 10
  }
}
```

---

# 24. Building Density Pipeline

Possible data sources:

```text
Building footprints
Open geospatial datasets
Satellite-derived built-up products
Government/open datasets
```

Pipeline:

```text
Building data
      ↓
Geometry validation
      ↓
Spatial intersection
      ↓
Grid aggregation
      ↓
Building density %
      ↓
Map layer
```

API:

```http
GET /v1/environment/buildings
GET /v1/environment/buildings/layer
```

---

# 25. Heat Map Service

The heat map should combine available signals.

Possible inputs:

```text
LST
air temperature
humidity
wind
solar radiation
AQI
NDVI
building density
historical baseline
```

Architecture:

```text
                  LST
                   │
Temperature ───────┤
Humidity ──────────┤
Wind ──────────────┤
NDVI ──────────────┤
Buildings ─────────┤
Baseline ──────────┤
                   ▼
             Feature Builder
                   │
                   ▼
              Heat Model
                   │
          ┌────────┴────────┐
          ▼                 ▼
     Heat score        Probability
          │                 │
          └────────┬────────┘
                   ▼
                Map API
```

---

# 26. Heat API

```http
GET /v1/heat/current
GET /v1/heat/map
GET /v1/heat/history
```

Example:

```json
{
  "data": {
    "heat_risk_probability": 0.82,
    "category": "high",
    "heat_score": 78
  },
  "meta": {
    "generated_at": "2026-08-30T10:30:00Z",
    "model_version": "heat-risk-v1"
  }
}
```

---

# 27. Heat Model Design

Initial model:

```text
Rule-based baseline
```

Then evolve toward:

```text
Statistical model
       ↓
Validated ML model
       ↓
Probabilistic model
```

Do not jump directly to complex ML without sufficient historical data.

A baseline can combine standardized features:

```text
z(LST)
z(air_temperature)
z(humidity)
z(wind)
z(NDVI)
z(building_density)
```

The actual weighting must be empirically validated rather than assumed.

---

# 28. Probability and Confidence

Return separate values:

```text
risk probability
confidence
data quality
```

Example:

```json
{
  "heat_risk_probability": 0.82,
  "confidence": 0.74,
  "data_quality": "good"
}
```

Do not represent model probability as certainty.

Frontend wording:

> Estimated probability of high heat risk: 82%.

---

# 29. Anomaly Detection

API:

```http
GET /v1/analytics/anomalies
```

Possible methods:

```text
Historical z-score
Rolling baseline
Percentile threshold
Seasonal baseline
Isolation Forest
Other validated anomaly models
```

Example:

```json
{
  "metric": "lst",
  "value": 43.2,
  "baseline": 38.4,
  "anomaly": 4.8,
  "z_score": 2.4,
  "severity": "high"
}
```

---

# 30. Baseline Construction

Anomalies should not always compare against the previous day.

Prefer:

```text
same location
same season
same time-of-day
historical observations
```

Example:

```text
Current LST:
43.2°C

Historical comparable baseline:
38.4°C

Anomaly:
+4.8°C
```

The baseline definition must be returned in metadata.

---

# 31. Correlation Analysis

API:

```http
GET /v1/analytics/correlations
```

Possible variables:

```text
NDVI ↔ LST
Building density ↔ LST
Wind ↔ AQI
Temperature ↔ LST
Rain ↔ AQI
Temperature ↔ AQI
```

Example:

```json
{
  "data": [
    {
      "variable_x": "ndvi",
      "variable_y": "lst",
      "correlation": -0.71,
      "sample_size": 128,
      "method": "pearson",
      "period": {
        "from": "2026-08-01",
        "to": "2026-08-30"
      }
    }
  ]
}
```

---

# 32. Scientific Interpretation Rules

Backend analytics must distinguish:

```text
Observation
     ↓
Association
     ↓
Prediction
     ↓
Causal inference
```

Correlation does not establish causation.

For example:

```text
NDVI ↓
LST ↑
```

can support:

> Lower vegetation is associated with higher LST in the selected observations.

It should not automatically produce:

> Lower vegetation caused the high LST.

---

# 33. Multivariable Analysis

If multiple factors overlap:

```text
Low NDVI
High building density
High temperature
Low wind
High LST
```

the backend should support multivariable models.

Potential approaches:

```text
Multiple linear regression
Generalized additive models
Random forest
Gradient boosting
Bayesian models
```

The selected method should be documented and validated.

Return:

```text
model version
features
training period
sample size
performance metrics
confidence/uncertainty
```

---

# 34. Insight API

```http
GET /v1/analytics/insights
```

Example:

```json
{
  "data": [
    {
      "type": "heat-risk",
      "title": "Elevated heat risk",
      "probability": 0.82,
      "confidence": 0.74,
      "signals": [
        "high_lst",
        "high_temperature",
        "low_ndvi",
        "high_building_density",
        "low_wind"
      ],
      "interpretation": "Current conditions are consistent with elevated heat risk.",
      "causal_claim": false
    }
  ]
}
```

---

# 35. Map Data Delivery

Do not return huge GeoJSON objects for every request.

Recommended options:

```text
Vector tiles
Raster tiles
Cloud-optimized GeoTIFF
Simplified GeoJSON
```

For initial MVP:

```text
GeoJSON
```

is acceptable for small areas.

For production city-scale high-resolution layers:

```text
Map tiles
```

should be used.

---

# 36. Map Layer Endpoint

Example:

```http
GET /v1/heat/map?bbox=85.78,20.25,85.88,20.34
```

Possible response:

```json
{
  "data": {
    "type": "FeatureCollection",
    "features": []
  },
  "meta": {
    "generated_at": "2026-08-30T10:30:00Z",
    "resolution_m": 100,
    "model_version": "heat-risk-v1"
  }
}
```

---

# 37. Data Explorer API

Endpoint:

```http
GET /v1/environment/history
```

Parameters:

```text
location
from
to
metric
interval
sort
order
page
page_size
```

Example:

```http
GET /v1/environment/history?location=bbsr&from=2026-08-01&to=2026-08-30&metric=aqi&interval=day&page=1&page_size=50
```

Response:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 50,
    "count": 50,
    "total": 30
  }
}
```

---

# 38. Filtering API

Support server-side filters:

```text
aqi_min
aqi_max
lst_min
lst_max
temperature_min
temperature_max
ndvi_min
ndvi_max
building_density_min
building_density_max
risk
```

Example:

```http
GET /v1/environment/history?
from=2026-08-01
&to=2026-08-30
&lst_min=40
&ndvi_max=0.30
```

---

# 39. Export Service

For small data:

```text
Frontend generates CSV/JSON
```

For large data:

```text
Frontend
   ↓
POST /v1/exports
   ↓
Export job
   ↓
Worker
   ↓
Object storage
   ↓
Download URL
```

Request:

```json
{
  "format": "csv",
  "location": "bbsr",
  "from": "2026-08-01",
  "to": "2026-08-30",
  "metrics": [
    "aqi",
    "temperature",
    "lst",
    "ndvi",
    "building_density"
  ]
}
```

Response:

```json
{
  "export_id": "exp_123",
  "status": "queued"
}
```

---

# 40. Export Status

```http
GET /v1/exports/{export_id}
```

Response:

```json
{
  "data": {
    "id": "exp_123",
    "status": "completed",
    "format": "csv",
    "download_url": "https://storage.example/export.csv",
    "expires_at": "2026-08-31T10:30:00Z"
  }
}
```

Download URLs should be temporary/signed where appropriate.

---

# 41. Provider Polling Schedule

Different datasets require different update frequencies.

Suggested architecture:

```text
AQI / IoT
Every 1–5 minutes

Weather observations
Every 5–15 minutes

Weather forecasts
Every 15–60 minutes

Satellite
When new observations become available

Vegetation
When new imagery/product becomes available

Building density
Periodic / static dataset
```

Do not poll a satellite API every minute if new observations are only available periodically.

---

# 42. Job Scheduler

Use:

```text
Celery Beat
```

Example conceptual schedule:

```text
aqi_ingestion          */5 minutes
weather_ingestion      */10 minutes
forecast_ingestion     */30 minutes
satellite_discovery    every hour
satellite_processing   event/job based
daily_aggregation      daily
anomaly_processing     hourly/daily
```

Actual intervals should be based on provider availability and cost.

---

# 43. Data Quality Pipeline

Every ingestion job should execute:

```text
Fetch
 ↓
Schema validation
 ↓
Coordinate validation
 ↓
Timestamp validation
 ↓
Unit validation
 ↓
Range validation
 ↓
Duplicate detection
 ↓
Outlier detection
 ↓
Quality score
 ↓
Store
```

Example:

```text
Temperature = 500°C
```

should be rejected or flagged.

---

# 44. Missing Data

Never replace missing environmental data with fake values.

Use:

```json
{
  "value": null,
  "quality": "missing",
  "reason": "provider_unavailable"
}
```

Possible states:

```text
valid
estimated
missing
invalid
stale
cloud_affected
low_quality
```

---

# 45. Provider Failure Handling

If one provider fails:

```text
Provider A ✕
Provider B ✓
```

The ingestion system should continue.

Architecture:

```text
Provider
    ↓
Adapter
    ↓
Retry
    ↓
Fallback provider
    ↓
Cache
    ↓
Database
```

Do not let one external provider failure take down the entire public API.

---

# 46. API Freshness

Backend should expose:

```text
observed_at
received_at
processed_at
expires_at
```

Frontend can then calculate:

```text
Updated 5 minutes ago
```

or:

```text
Data may be delayed
```

---

# 47. API Caching

Example policies:

```text
Current AQI:
1–5 min

Weather:
10 min

Forecast:
30 min

Satellite:
until new observation

Historical:
hours/days

Building density:
weeks/months
```

Use Redis.

Cache key example:

```text
aqi:current:{grid_id}
weather:forecast:{grid_id}
heat:map:{bbox_hash}:{timestamp}
```

---

# 48. Rate Limiting

Public API should have limits.

Example:

```text
Anonymous:
100 requests/min/IP
```

For expensive endpoints:

```text
Heat map:
lower rate limit

Export:
job-based limits
```

Exact values should be determined through load testing.

---

# 49. API Security

No login is required for the public frontend.

However:

```text
HTTPS
CORS
rate limiting
request validation
input sanitization
provider-secret protection
```

must still be implemented.

External provider secrets stay server-side.

---

# 50. CORS

Allow only known frontend origins.

Development:

```text
http://localhost:5173
```

Production:

```text
https://urbancool.example
```

Avoid:

```text
Access-Control-Allow-Origin: *
```

for production unless there is a specific reason.

---

# 51. Environment Configuration

Backend `.env`:

```env
APP_ENV=development

DATABASE_URL=postgresql://...
REDIS_URL=redis://...

OBJECT_STORAGE_ENDPOINT=...
OBJECT_STORAGE_BUCKET=...
OBJECT_STORAGE_ACCESS_KEY=...
OBJECT_STORAGE_SECRET_KEY=...

AQI_PROVIDER_API_KEY=...
WEATHER_PROVIDER_API_KEY=...
SATELLITE_PROVIDER_API_KEY=...

SECRET_KEY=...
```

Never commit `.env`.

Provide:

```text
.env.example
```

without real secrets.

---

# 52. Database Tables

Recommended initial tables:

```text
locations
grid_cells
sensors
aqi_observations
weather_observations
weather_forecasts
satellite_observations
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

---

# 53. Example AQI Table

Conceptual schema:

```text
aqi_observations
----------------------------
id
location_id
sensor_id
observed_at
aqi
pm25
pm10
no2
o3
source
provider
quality
created_at
```

Indexes:

```text
(location_id, observed_at)
(sensor_id, observed_at)
```

---

# 54. Example Spatial Observation

```text
grid_environment
---------------------------------
grid_id
observed_at
temperature_c
lst_c
aqi
pm25
ndvi
vegetation_cover_percent
building_density_percent
humidity_percent
wind_speed_ms
heat_score
heat_probability
quality
```

This table can power much of the map and analytics layer.

---

# 55. Database Aggregation

Raw:

```text
Sensor readings every 5 minutes
```

Derived:

```text
Hourly average
Daily average
Daily maximum
Daily minimum
Percentiles
```

Keep raw data where feasible and generate derived aggregates separately.

---

# 56. India-First Geographic Design

The backend should support:

```text
India
├── States
├── Union Territories
├── Districts
├── Municipal areas
├── Wards
└── Grid cells
```

Coordinates should use standard geographic representations internally.

For web maps:

```text
WGS84 / EPSG:4326
```

For spatial processing, use suitable projected coordinate systems where required.

---

# 57. API Versioning

All public APIs should be versioned:

```text
/v1/aqi/current
/v1/weather/current
/v1/heat/map
```

When breaking changes occur:

```text
/v2/...
```

Do not silently break the frontend.

---

# 58. OpenAPI

FastAPI should automatically expose:

```text
OpenAPI schema
Swagger UI
ReDoc
```

The OpenAPI document becomes the contract between backend and frontend.

Recommended workflow:

```text
Backend schema
      ↓
OpenAPI
      ↓
TypeScript API types
      ↓
Frontend
```

---

# 59. Testing Strategy

## Unit tests

Test:

```text
normalizers
unit conversions
AQI calculations
quality checks
anomaly calculations
risk calculations
```

## Integration tests

Test:

```text
API → database
provider → ingestion
map endpoint
historical endpoint
export jobs
```

## End-to-end tests

Test:

```text
Frontend
   ↓
API
   ↓
Database
```

---

# 60. Observability

Production backend should expose:

```text
request latency
API error rate
provider failures
ingestion failures
queue length
database health
cache hit rate
data freshness
```

Useful tooling:

```text
Prometheus
Grafana
OpenTelemetry
Sentry
```

---

# 61. Logging

Structured logs:

```json
{
  "timestamp": "2026-08-30T10:30:00Z",
  "level": "ERROR",
  "service": "aqi-ingestion",
  "provider": "provider-name",
  "job_id": "job_123",
  "message": "Provider request failed"
}
```

Never log:

```text
API keys
passwords
secrets
```

---

# 62. Deployment

Recommended initial production deployment:

```text
                     Internet
                        │
                        ▼
                  Load Balancer
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
        API Server              API Server
            │                       │
            └───────────┬───────────┘
                        │
                     Redis
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
        PostgreSQL              Workers
         + PostGIS
```

Docker should be used from the beginning.

---

# 63. Development Docker Stack

```text
docker-compose
│
├── api
├── worker
├── scheduler
├── postgres
├── redis
└── minio
```

This allows the team to develop without requiring production cloud infrastructure.

---

# 64. Production Scaling

Start simple:

```text
1 API service
1 worker
1 scheduler
PostgreSQL
Redis
Object storage
```

Scale only when required:

```text
API replicas ↑
Worker replicas ↑
Database resources ↑
Read replicas
Tile server
Dedicated analytics workers
```

---

# 65. Recommended Tile Architecture

For production map scale:

```text
Environmental data
       ↓
Spatial processing
       ↓
Raster/vector tiles
       ↓
Tile storage/server
       ↓
MapLibre
```

Potential technologies:

```text
Martin
TiTiler
GeoServer
PMTiles
Cloud Optimized GeoTIFF
```

Choose based on the final data formats and infrastructure.

---

# 66. Data Lifecycle

```text
External source
      ↓
Raw ingestion
      ↓
Validation
      ↓
Normalized data
      ↓
Spatial aggregation
      ↓
Analytics
      ↓
API
      ↓
Frontend
      ↓
Export
```

Raw and normalized data should remain traceable to their source.

---

# 67. Data Retention

Suggested:

```text
Raw sensor observations:
Long-term where storage allows

Aggregated observations:
Long-term

Satellite source files:
Based on storage/cost policy

Derived heat maps:
Regenerate/cache as required

Exports:
Temporary
```

Retention should be configurable.

---

# 68. Backend-to-Frontend Contract

The backend must directly support the frontend specification.

| Frontend requirement | Backend |
|---|---|
| AQI card | `/v1/aqi/current` |
| AQI history | `/v1/aqi/history` |
| Current weather | `/v1/weather/current` |
| Forecast | `/v1/weather/forecast` |
| Heat map | `/v1/heat/map` |
| LST | `/v1/satellite/lst` |
| NDVI | `/v1/environment/vegetation` |
| Building density | `/v1/environment/buildings` |
| Historical table | `/v1/environment/history` |
| Anomalies | `/v1/analytics/anomalies` |
| Correlations | `/v1/analytics/correlations` |
| Insights | `/v1/analytics/insights` |
| Export | `/v1/exports` |

---

# 69. Phase-Based Backend Development

## Phase 1 — Backend Foundation

Implement:

- FastAPI
- PostgreSQL
- PostGIS
- Redis
- Docker
- environment configuration
- logging
- health endpoints
- OpenAPI

Endpoints:

```text
GET /health
GET /v1/status
```

---

## Phase 2 — AQI + Weather

Implement:

- provider adapters
- ingestion workers
- normalized models
- current APIs
- historical APIs
- caching
- data freshness

Connect frontend:

```text
AQI
Weather
Forecast
```

---

## Phase 3 — Satellite

Implement:

- satellite discovery
- download pipeline
- cloud/quality filtering
- LST processing
- NDVI processing
- object storage
- spatial aggregation

---

## Phase 4 — Urban Form

Implement:

- building density
- built-up percentage
- land cover
- grid aggregation

---

## Phase 5 — Live Environmental Map

Implement:

```text
Heat
AQI
Temperature
NDVI
Buildings
Satellite
```

Add:

- GeoJSON
- raster tiles
- vector tiles where required

---

## Phase 6 — Historical Data Platform

Implement:

- date filtering
- metric filtering
- location filtering
- server-side sorting
- pagination
- aggregation
- export

---

## Phase 7 — Analytics

Implement:

```text
Anomalies
Correlations
Heat-risk probability
Multivariable analysis
```

Add model metadata and validation.

---

## Phase 8 — Production

Implement:

- monitoring
- alerting
- backups
- scaling
- security hardening
- provider failover
- performance optimization

---

# 70. Minimum Viable Backend

For the first working version, do NOT build every advanced component.

MVP:

```text
FastAPI
PostgreSQL + PostGIS
Redis
Celery
Docker

AQI provider
Weather provider
Satellite data pipeline
Basic vegetation data
Basic building-density data

Current APIs
Historical APIs
Heat map API
Export API
```

Then add advanced analytics after sufficient data has accumulated.

---

# 71. Recommended MVP API List

```text
GET  /health

GET  /v1/aqi/current
GET  /v1/aqi/history

GET  /v1/weather/current
GET  /v1/weather/forecast

GET  /v1/satellite/lst

GET  /v1/environment/vegetation
GET  /v1/environment/buildings

GET  /v1/heat/current
GET  /v1/heat/map
GET  /v1/heat/history

GET  /v1/environment/history

GET  /v1/analytics/anomalies
GET  /v1/analytics/correlations
GET  /v1/analytics/insights

POST /v1/exports
GET  /v1/exports/{id}
```

---

# 72. Final Architecture

```text
                         ┌───────────────────┐
                         │    PUBLIC WEB     │
                         │ React + Vite      │
                         └─────────┬─────────┘
                                   │
                                  HTTPS
                                   │
                         ┌─────────▼─────────┐
                         │    FastAPI API    │
                         │       /v1         │
                         └─────────┬─────────┘
                                   │
                  ┌────────────────┼────────────────┐
                  │                │                │
                  ▼                ▼                ▼
              Query Layer     Analytics Layer   Export Layer
                  │                │                │
                  └────────────────┼────────────────┘
                                   │
                   ┌───────────────┴───────────────┐
                   │                               │
                   ▼                               ▼
              Redis Cache                   PostgreSQL
                                                 +
                                               PostGIS
                                                 +
                                             TimescaleDB
                   │                               │
                   └───────────────┬───────────────┘
                                   │
                         ┌─────────▼─────────┐
                         │ Background Worker │
                         │ Celery            │
                         └─────────┬─────────┘
                                   │
               ┌───────────────────┼───────────────────┐
               │                   │                   │
               ▼                   ▼                   ▼
          AQI / IoT             Weather           Satellite
          Providers             Providers          Providers
               │                   │                   │
               └───────────────────┼───────────────────┘
                                   ▼
                          Normalization Layer
                                   │
                                   ▼
                         Spatial Processing
                                   │
                                   ▼
                         Analytics / Models
                                   │
                                   ▼
                           Object Storage
```

---

# 73. Key Architectural Decisions

### Decision 1 — Separate frontend and backend

```text
Vite frontend
       ↓
FastAPI backend
```

This keeps provider credentials and data processing server-side.

### Decision 2 — PostgreSQL + PostGIS

The application is spatial and time-series heavy, so a relational geospatial database is the preferred starting point.

### Decision 3 — Provider abstraction

Never allow a provider's response schema to become the application's permanent schema.

### Decision 4 — Backend-generated environmental layers

Large geospatial processing belongs on the backend, not in the browser.

### Decision 5 — Scientific transparency

Every derived result should expose enough metadata to understand:

```text
what was measured
when it was measured
where it was measured
where it came from
how it was processed
what model produced the result
how certain the result is
```

### Decision 6 — No fabricated real-time data

If a provider has not updated:

```text
show stale
```

If data is unavailable:

```text
show unavailable
```

Never silently generate a fake value.

---

# 74. Definition of Done

## Infrastructure

- [ ] Dockerized
- [ ] PostgreSQL + PostGIS
- [ ] Redis
- [ ] Celery worker
- [ ] Object storage
- [ ] Environment configuration

## API

- [ ] FastAPI
- [ ] `/v1` versioning
- [ ] OpenAPI
- [ ] Validation
- [ ] CORS
- [ ] Rate limiting
- [ ] Error handling

## Data

- [ ] AQI ingestion
- [ ] Weather ingestion
- [ ] Forecast ingestion
- [ ] Satellite ingestion
- [ ] LST
- [ ] NDVI
- [ ] Building density
- [ ] Historical aggregation
- [ ] Provenance
- [ ] Quality metadata

## Analytics

- [ ] Heat map
- [ ] Heat-risk probability
- [ ] Anomaly detection
- [ ] Correlation analysis
- [ ] Model metadata
- [ ] Uncertainty/confidence

## Exports

- [ ] CSV
- [ ] JSON
- [ ] GeoJSON
- [ ] Large export jobs
- [ ] Temporary download links

## Production

- [ ] Monitoring
- [ ] Logging
- [ ] Backups
- [ ] Provider failure handling
- [ ] Performance testing
- [ ] Security review

---

# 75. Backend Implementation Principle

The most important architectural boundary is:

```text
External Data Providers
          ↓
       BACKEND
          ↓
Canonical UrbanCool Data Model
          ↓
       FRONTEND
```

The frontend should never need to know whether a value came from:

```text
IoT sensor
weather API
satellite
government dataset
open geospatial dataset
analytics model
```

It should receive a consistent representation containing:

```text
value
unit
location
timestamp
source
quality
resolution
```

This makes the frontend stable while the backend can evolve from an MVP with a few providers into a full environmental data platform.
