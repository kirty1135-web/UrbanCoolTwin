# Phase 6 — Historical Explorer and Exports

## History

```http
GET /api/v1/environment/history
```

Parameters:

```text
location
bbox
from
to
metric / metrics
interval
sort
order
page
page_size
```

Example:

```http
GET /api/v1/environment/history?location=bbsr&from=2026-08-01&to=2026-08-31&metrics=aqi,temperature,lst,ndvi,building_density&interval=day&page=1&page_size=50
```

Response:

```json
{
  "data": [
    {
      "observed_at": "2026-08-30T10:00:00Z",
      "aqi": 72,
      "temperature_c": 38.4,
      "lst_c": 41.2,
      "ndvi": 0.32,
      "building_density_percent": 67
    }
  ],
  "meta": {
    "page": 1,
    "page_size": 50,
    "total": 720
  }
}
```

## Filters

```text
aqi_min / aqi_max
temperature_min / temperature_max
lst_min / lst_max
ndvi_min / ndvi_max
building_density_min / building_density_max
risk
quality
source
```

## Export

```http
POST /api/v1/exports
```

```json
{
  "format": "csv",
  "location": "bbsr",
  "from": "2026-08-01",
  "to": "2026-08-31",
  "metrics": [
    "aqi",
    "temperature",
    "lst",
    "ndvi",
    "building_density"
  ]
}
```

Formats:

```text
csv
json
geojson
```

Large exports are asynchronous.

```http
GET /api/v1/exports/:id
```

States:

```text
queued
processing
completed
failed
expired
```

Export metadata should include:

```text
source
provider
retrieval date
observation date
processing version
units
quality
```
