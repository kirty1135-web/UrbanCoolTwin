# Phase 3 — Actual External APIs and Data

These are concrete provider APIs/catalogues to implement. Provider resource IDs, collection IDs, quotas and authentication requirements must be checked against the official documentation before deployment.

## 1. India AQI — OGD/CPCB

Official Real Time AQI catalogue:

```text
https://ap.data.gov.in/catalog/real-time-air-quality-index
```

It contains National AQI values from monitoring stations across India and pollutants such as SO2, NO2, PM10, PM2.5, CO and O3.

OGD resource requests use the documented pattern:

```text
https://api.data.gov.in/resource/<CURRENT_RESOURCE_ID>?api-key=<DATA_GOV_IN_API_KEY>&format=json&limit=100
```

Environment:

```env
DATA_GOV_IN_API_KEY=
```

Do not hard-code an old resource ID; obtain the current resource ID from the catalogue's Catalog API.

Normalize:

```text
station
city
state
latitude
longitude
pollutant
value
unit
last_update
```

## 2. OpenAQ v3

Base:

```text
https://api.openaq.org/v3
```

Docs:

```text
https://api.openaq.org/docs
```

Useful endpoints:

```http
GET https://api.openaq.org/v3/locations
GET https://api.openaq.org/v3/locations/{locations_id}
GET https://api.openaq.org/v3/sensors/{sensors_id}/measurements
GET https://api.openaq.org/v3/sensors/{sensors_id}/measurements/hourly
```

Environment:

```env
OPENAQ_API_KEY=
```

Use for open air-quality observations and cross-provider checks.

## 3. Open-Meteo current/forecast

```text
https://api.open-meteo.com/v1/forecast
```

Example:

```text
https://api.open-meteo.com/v1/forecast?latitude=20.2961&longitude=85.8245&current=temperature_2m,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,shortwave_radiation&timezone=auto
```

Useful variables:

```text
temperature_2m
relative_humidity_2m
apparent_temperature
wind_speed_10m
wind_direction_10m
precipitation
precipitation_probability
cloud_cover
shortwave_radiation
surface_temperature
```

## 4. Open-Meteo historical

```text
https://archive-api.open-meteo.com/v1/archive
```

Example:

```text
https://archive-api.open-meteo.com/v1/archive?latitude=20.2961&longitude=85.8245&start_date=2026-08-01&end_date=2026-08-31&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,shortwave_radiation&timezone=auto
```

Use for historical baselines. It is model/reanalysis data, not necessarily a local station observation.

## 5. Open-Meteo air quality

```text
https://air-quality-api.open-meteo.com/v1/air-quality
```

Example:

```text
https://air-quality-api.open-meteo.com/v1/air-quality?latitude=20.2961&longitude=85.8245&hourly=pm10,pm2_5,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide&timezone=auto
```

Treat this as modeled atmospheric data, not CPCB station AQI.

## 6. Open-Meteo geocoding

```text
https://geocoding-api.open-meteo.com/v1/search?name=Bhubaneswar&count=5&language=en&format=json
```

Use for city search.

## 7. Copernicus Data Space STAC

STAC:

```text
https://stac.dataspace.copernicus.eu/v1/
```

Collections:

```text
https://stac.dataspace.copernicus.eu/v1/collections
```

Search:

```http
POST https://stac.dataspace.copernicus.eu/v1/search
```

Example:

```json
{
  "bbox": [85.78, 20.25, 85.88, 20.34],
  "datetime": "2026-08-01T00:00:00Z/2026-08-31T23:59:59Z",
  "collections": ["sentinel-2-l2a"],
  "limit": 10
}
```

Use STAC to discover currently available Copernicus collections rather than assuming an old collection ID.

## 8. Sentinel Hub / Copernicus Data Space

Catalog:

```text
https://sh.dataspace.copernicus.eu/catalog/v1/search
```

Processing:

```text
https://sh.dataspace.copernicus.eu/process/v1/process
```

Statistics:

```text
https://sh.dataspace.copernicus.eu/statistics/v1/statistics
```

Use Processing for NDVI/raster products and Statistical API for time-series statistics.

Authentication is required for Sentinel Hub service usage; keep OAuth credentials server-side.

## 9. Sentinel-5P

Use the Copernicus Data Space catalogue/Sentinel Hub atmospheric collections for Sentinel-5P products.

First query:

```text
https://stac.dataspace.copernicus.eu/v1/collections
```

Target atmospheric variables can include:

```text
NO2
SO2
CO
O3
aerosols
```

Do not label satellite atmospheric observations as ground AQI.

## 10. USGS Landsat STAC

Official:

```text
https://landsatlook.usgs.gov/stac-server/
```

Search:

```text
https://landsatlook.usgs.gov/stac-server/search
```

Use Landsat Collection 2 products suitable for thermal/LST analysis and preserve product, band, quality and algorithm metadata.

## 11. Microsoft Planetary Computer

STAC:

```text
https://planetarycomputer.microsoft.com/api/stac/v1/
```

Search:

```http
POST https://planetarycomputer.microsoft.com/api/stac/v1/search
```

Useful collections include:

```text
landsat-c2-l2
sentinel-2-l2a
```

Data API:

```text
https://planetarycomputer.microsoft.com/api/data/v1/
```

The STAC API is publicly accessible. Some assets require signing; follow the official Planetary Computer SDK workflow.

## 12. OpenStreetMap Overpass

Endpoint:

```text
https://overpass-api.de/api/interpreter
```

Example building query:

```text
[out:json][timeout:60];
(
  way["building"](20.25,85.78,20.34,85.88);
  relation["building"](20.25,85.78,20.34,85.88);
);
out geom;
```

Use for building footprints/density. Cache results; do not repeatedly download an entire city from public Overpass in production.

## 13. MOSDAC / ISRO

Portal:

```text
https://mosdac.gov.in/
```

Download API manual:

```text
https://mosdac.gov.in/downloadapi-manual
```

The documented download workflow uses:

```text
datasetId
startTime
endTime
count
boundingBox
gId
```

Example India bounding box:

```text
70.0,8.0,90.0,28.0
```

MOSDAC supports near-real-time and archived satellite data, but downloads require applicable MOSDAC authentication and access depends on the dataset/user profile.

## Provider strategy

```text
AQI:
  primary   = CPCB/India OGD
  secondary = OpenAQ
  context   = Open-Meteo Air Quality

Weather:
  primary   = Open-Meteo

Sentinel:
  primary   = Copernicus Data Space

Landsat:
  primary   = USGS Landsat STAC
  alternative = Planetary Computer

Buildings:
  primary   = OSM/Overpass

India satellite/NRT:
  primary where appropriate = MOSDAC
```
