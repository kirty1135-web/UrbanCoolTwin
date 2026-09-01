# Phase 8 — Implementation Roadmap

## Phase 1
Build:

```text
Node + Express + TypeScript
FastAPI
Neon PostgreSQL
Docker
```

## Phase 2
Connect:

```text
CPCB/India OGD
OpenAQ
Open-Meteo Forecast
Open-Meteo Historical
Open-Meteo Air Quality
```

Deliver:

```text
AQI
weather
forecast
historical charts
```

## Phase 3
Connect:

```text
Copernicus Data Space
Sentinel Hub
USGS Landsat
Planetary Computer
```

Deliver:

```text
satellite discovery
NDVI
LST
cloud filtering
scene metadata
```

## Phase 4
Connect:

```text
OSM Overpass
```

Deliver:

```text
building footprints
building area
building density
```

## Phase 5

Deliver:

```text
AQI map
temperature map
LST map
NDVI map
building map
heat map
```

Start with GeoJSON; move to raster/vector tiles when scale requires it.

## Phase 6

Deliver:

```text
date filters
metric filters
sorting
pagination
CSV
JSON
GeoJSON
```

## Phase 7

Deliver:

```text
anomalies
correlations
multivariable analysis
heat-risk probability
confidence
model metadata
```

## Phase 8

Deliver:

```text
monitoring
alerts
provider fallback
backups
load tests
security hardening
```

## Final boundary

```text
React + Vite
   ↓
Node + Express public API
   ↓
PostgreSQL +    ↓
FastAPI scientific service
   ↓
Workers
   ↓
Environmental APIs
```
