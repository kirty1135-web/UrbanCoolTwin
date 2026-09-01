# Phase 2 — FastAPI Scientific/Data Service

## Stack

```text
Python 3.12+
FastAPI
Pydantic
NumPy
Pandas
GeoPandas
Shapely
Rasterio
rioxarray
xarray
SciPy
statsmodels
scikit-learn
pystac-client
```

## Structure

```text
services/data-science/
├── app/
│   ├── main.py
│   ├── api/
│   ├── providers/
│   │   ├── openaq.py
│   │   ├── openmeteo.py
│   │   ├── copernicus.py
│   │   ├── landsat.py
│   │   ├── overpass.py
│   │   └── mosdac.py
│   ├── ingestion/
│   ├── geospatial/
│   ├── analytics/
│   └── schemas/
└── requirements.txt
```

## Internal endpoints

```http
GET  /internal/v1/aqi/fetch
GET  /internal/v1/weather/fetch
POST /internal/v1/satellite/search
POST /internal/v1/satellite/process
POST /internal/v1/environment/ndvi
POST /internal/v1/environment/building-density
POST /internal/v1/analytics/anomaly
POST /internal/v1/analytics/correlation
POST /internal/v1/analytics/heat-risk
```

## Canonical observation

Every normalized observation should contain:

```text
location_id
latitude
longitude
observed_at
received_at
source
provider
metric
value
unit
resolution
quality
processing_version
```

## Quality states

```text
valid
estimated
missing
invalid
stale
cloud_affected
low_quality
```

Never replace missing environmental measurements with fabricated values.
