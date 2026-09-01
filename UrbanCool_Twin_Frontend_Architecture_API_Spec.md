# UrbanCool Twin — Frontend Architecture, Design & API Integration Specification

**Document type:** Frontend implementation specification  
**Project:** UrbanCool Twin — Public Urban Environmental Intelligence Platform  
**Status:** Frontend prototype → API integration ready  
**Target:** Desktop + Android/mobile web  
**Authentication:** None  
**User dashboards:** None  
**Data mode:** Public read-only environmental data  
**Prototype:** `UrbanCool_Twin_frontend_preview.html`

---

## 1. Product Goal

UrbanCool Twin is a public-facing environmental intelligence application that combines:

- Air Quality Index (AQI)
- PM2.5 / PM10 / NO₂ / O₃ and other pollution indicators
- Weather observations and forecasts
- Land Surface Temperature (LST)
- Vegetation / NDVI
- Building density / built-up indicators
- Satellite observations
- Urban heat-risk indicators
- Historical observations
- Derived correlations and probabilistic insights

The frontend should make the relationship between **air quality, urban heating, vegetation, built density and weather** understandable without requiring technical knowledge.

The application is **not intended to claim direct causation** from observational overlap alone.

---

# 2. Core UX Principles

### 2.1 AQI and heat are the primary signals

The home page should immediately answer:

1. How is the air quality?
2. How hot is the area?
3. Where are the hotspots?
4. Is the heat/pollution situation getting better or worse?
5. What environmental factors may be associated with the observed pattern?

### 2.2 Observation vs inference must be visually separated

Use three levels:

| Level | Meaning | UI treatment |
|---|---|---|
| Observation | Direct API/satellite/weather measurement | Solid cards / normal text |
| Derived indicator | Calculated from multiple observations | Label as "Derived" |
| Probability / inference | Model or statistical estimate | "Estimated probability" + explanation |

Example:

> **Observed:** LST is 41.2°C in the selected zone.

> **Observed:** Vegetation index is relatively low.

> **Inference:** Low vegetation may be contributing to elevated surface temperature.

> **Probability:** Model estimates an 82% probability of high heat risk under current conditions.

Avoid:

> "Low vegetation caused the heat."

---

# 3. Frontend Information Architecture

```text
UrbanCool Twin
│
├── Home
│   ├── Current AQI
│   ├── Heat Risk
│   ├── Temperature
│   ├── Vegetation
│   ├── Live Environmental Map
│   ├── Recent AQI Trend
│   └── Data Source Status
│
├── Live Map
│   ├── Heat Layer
│   ├── AQI Layer
│   ├── Vegetation Layer
│   ├── Building Density Layer
│   ├── Weather Layer
│   ├── Satellite Layer
│   └── Location Inspector
│
├── Air Quality
│   ├── AQI
│   ├── PM2.5
│   ├── PM10
│   ├── NO₂
│   ├── O₃
│   └── Historical Trends
│
├── Environment
│   ├── Vegetation / NDVI
│   ├── LST
│   ├── Building Density
│   ├── Built-up Area
│   └── Environmental Relationships
│
├── Data Explorer
│   ├── Date Range
│   ├── Location
│   ├── Metric
│   ├── Search
│   ├── Sort
│   ├── Filter
│   └── Export
│       ├── CSV
│       ├── JSON
│       └── GeoJSON
│
└── Insights
    ├── Heat Risk
    ├── Weather Outlook
    ├── Anomalies
    ├── Correlations
    └── Explanation / Confidence
```

---

# 4. Recommended Tech Stack

## 4.1 Frontend

### Recommended production stack

```text
React
TypeScript
Vite
```

Alternative:

```text
Next.js
TypeScript
```

For this public data application, React + Vite is sufficient if SEO requirements are limited.

---

## 4.2 Styling

Recommended:

```text
Tailwind CSS
```

or:

```text
CSS Modules + CSS variables
```

The current prototype uses plain CSS variables. Keep the same design tokens when migrating to React.

---

## 4.3 Maps

Recommended:

```text
MapLibre GL JS
```

Possible alternatives:

```text
Leaflet
Mapbox GL JS
```

Prefer MapLibre if an open-source map stack is desired.

The frontend should support raster/vector layers supplied by the backend.

---

## 4.4 Charts

Recommended:

```text
Apache ECharts
```

Alternative:

```text
Recharts
```

ECharts is preferable if the application will eventually display:

- multiple environmental variables
- anomaly bands
- heatmaps
- scatter plots
- time-series comparisons
- confidence intervals

---

## 4.5 Data fetching

Recommended:

```text
TanStack Query
```

Responsibilities:

- API requests
- caching
- refetching
- loading state
- stale-data handling
- retry logic
- request deduplication

---

## 4.6 Date handling

```text
date-fns
```

Use it for:

- date-range filters
- observation timestamps
- timezone formatting
- chart labels

---

## 4.7 Export

Client-side:

```text
CSV → custom serializer / Papa Parse
JSON → native JSON.stringify
GeoJSON → native JSON.stringify
```

For very large datasets, request a generated export file from the backend instead of downloading all records into the browser.

---

# 5. Application Architecture

Recommended architecture:

```text
                    ┌────────────────────────┐
                    │      React Frontend    │
                    │                        │
                    │ Pages / Components     │
                    │ Charts / Maps           │
                    │ Filters / Export UI    │
                    └───────────┬────────────┘
                                │
                         TanStack Query
                                │
                    ┌───────────▼────────────┐
                    │     API Client Layer   │
                    │                        │
                    │ apiClient.ts           │
                    │ aqiApi.ts              │
                    │ weatherApi.ts          │
                    │ satelliteApi.ts        │
                    │ environmentApi.ts      │
                    └───────────┬────────────┘
                                │
                         HTTPS / REST API
                                │
                    ┌───────────▼────────────┐
                    │       Backend API      │
                    └───────────┬────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
     AQI Sources          Weather Sources       Satellite Data
          │                     │                     │
     Sensors/API           Forecast API        Landsat/Sentinel
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │ Processing / Analytics │
                    │                        │
                    │ Aggregation             │
                    │ Spatial processing      │
                    │ Anomaly detection       │
                    │ Risk estimation         │
                    │ Correlation analysis    │
                    └────────────────────────┘
```

---

# 6. Frontend Folder Structure

```text
src/
│
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
│
├── pages/
│   ├── Home/
│   ├── LiveMap/
│   ├── AirQuality/
│   ├── Environment/
│   ├── DataExplorer/
│   └── Insights/
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   │
│   ├── cards/
│   │   ├── AQICard.tsx
│   │   ├── HeatRiskCard.tsx
│   │   ├── TemperatureCard.tsx
│   │   └── VegetationCard.tsx
│   │
│   ├── map/
│   │   ├── EnvironmentalMap.tsx
│   │   ├── MapControls.tsx
│   │   ├── MapLegend.tsx
│   │   ├── LocationPopup.tsx
│   │   └── LayerSelector.tsx
│   │
│   ├── charts/
│   │   ├── AQIChart.tsx
│   │   ├── TemperatureChart.tsx
│   │   ├── LSTChart.tsx
│   │   ├── NDVIChart.tsx
│   │   └── CorrelationChart.tsx
│   │
│   ├── data/
│   │   ├── DataTable.tsx
│   │   ├── FilterBar.tsx
│   │   ├── SortControls.tsx
│   │   └── ExportControls.tsx
│   │
│   └── insights/
│       ├── InsightCard.tsx
│       ├── ConfidenceBadge.tsx
│       └── ExplanationPanel.tsx
│
├── api/
│   ├── client.ts
│   ├── aqi.ts
│   ├── weather.ts
│   ├── satellite.ts
│   ├── vegetation.ts
│   ├── buildings.ts
│   ├── heat.ts
│   └── insights.ts
│
├── hooks/
│   ├── useAQI.ts
│   ├── useWeather.ts
│   ├── useSatellite.ts
│   ├── useEnvironmentalLayers.ts
│   └── useHistoricalData.ts
│
├── types/
│   ├── aqi.ts
│   ├── weather.ts
│   ├── satellite.ts
│   ├── environment.ts
│   ├── heat.ts
│   └── api.ts
│
├── utils/
│   ├── formatters.ts
│   ├── exports.ts
│   ├── anomaly.ts
│   └── risk.ts
│
└── styles/
    ├── globals.css
    └── theme.css
```

---

# 7. API Integration Strategy

The frontend should **never directly contain provider API keys**.

Recommended flow:

```text
External Provider
       ↓
Backend ingestion
       ↓
Normalization
       ↓
Database / cache
       ↓
UrbanCool API
       ↓
Frontend
```

The browser should communicate with:

```text
https://api.urbancool.example/v1/...
```

rather than directly calling every external provider.

This gives the project:

- consistent data formats
- provider replacement flexibility
- rate-limit protection
- API key protection
- caching
- centralized validation
- unified timestamps
- unified geographic formats

---

# 8. Environment Variables

Frontend `.env`:

```env
VITE_API_BASE_URL=https://api.urbancool.example/v1
VITE_MAP_STYLE_URL=https://maps.example/style.json
VITE_APP_ENV=production
```

Never place secret provider keys in:

```env
VITE_...
```

Anything beginning with `VITE_` is potentially exposed to the browser.

Provider credentials belong on the backend.

---

# 9. API Contract

All frontend APIs should return a consistent envelope.

Example:

```json
{
  "data": {},
  "meta": {
    "location": "Bhubaneswar",
    "timestamp": "2026-08-30T10:30:00Z",
    "source": "provider-name",
    "observed_at": "2026-08-30T10:15:00Z"
  }
}
```

For lists:

```json
{
  "data": [],
  "meta": {
    "count": 100,
    "page": 1,
    "page_size": 100,
    "from": "2026-08-01T00:00:00Z",
    "to": "2026-08-30T23:59:59Z"
  }
}
```

---

# 10. AQI API Placeholder

## Endpoint

```http
GET /aqi/current
```

Query parameters:

```text
lat
lon
radius
```

Example:

```http
GET /aqi/current?lat=20.2961&lon=85.8245&radius=10
```

Response:

```json
{
  "data": {
    "aqi": 72,
    "category": "Moderate",
    "pm25": 31,
    "pm10": 64,
    "no2": 28,
    "o3": 34
  },
  "meta": {
    "observed_at": "2026-08-30T10:25:00Z",
    "source": "air-quality-provider",
    "quality": "validated"
  }
}
```

Frontend component:

```text
AQICard
```

Should display:

```text
AQI
72

Moderate

PM2.5
31 µg/m³

Updated 5 min ago
```

---

# 11. Historical AQI API

```http
GET /aqi/history
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
GET /aqi/history?lat=20.2961&lon=85.8245&from=2026-08-01&to=2026-08-30&interval=hour
```

Response:

```json
{
  "data": [
    {
      "timestamp": "2026-08-30T08:00:00Z",
      "aqi": 72,
      "pm25": 31
    }
  ]
}
```

---

# 12. Weather API Placeholder

## Current weather

```http
GET /weather/current
```

Response:

```json
{
  "data": {
    "temperature": 38.4,
    "feels_like": 40.1,
    "humidity": 62,
    "wind_speed": 1.5,
    "rain_probability": 18
  },
  "meta": {
    "observed_at": "2026-08-30T10:30:00Z"
  }
}
```

## Forecast

```http
GET /weather/forecast
```

Parameters:

```text
lat
lon
hours
```

Example:

```json
{
  "data": [
    {
      "timestamp": "2026-08-30T12:00:00Z",
      "temperature": 38.8,
      "wind_speed": 1.4,
      "rain_probability": 12
    }
  ]
}
```

---

# 13. Satellite / LST API Placeholder

```http
GET /satellite/lst
```

Parameters:

```text
bbox
from
to
resolution
```

Example:

```http
GET /satellite/lst?bbox=85.78,20.25,85.88,20.34&from=2026-08-01&to=2026-08-30
```

Response:

```json
{
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": []
        },
        "properties": {
          "lst_c": 41.2,
          "observed_at": "2026-08-29T05:30:00Z"
        }
      }
    ]
  }
}
```

The map should render this as a raster/vector heat layer depending on the backend output.

---

# 14. Vegetation API Placeholder

```http
GET /environment/vegetation
```

Parameters:

```text
bbox
from
to
index
```

Example:

```http
GET /environment/vegetation?bbox=85.78,20.25,85.88,20.34&from=2026-08-01&to=2026-08-30&index=ndvi
```

Response:

```json
{
  "data": {
    "ndvi": 0.32,
    "vegetation_cover_percent": 28,
    "observed_at": "2026-08-29T05:30:00Z"
  }
}
```

---

# 15. Building Density API Placeholder

```http
GET /environment/buildings
```

Response:

```json
{
  "data": {
    "building_density_percent": 67,
    "built_up_percent": 61,
    "observed_at": "2026-08-29T00:00:00Z"
  }
}
```

For map visualization, prefer a GeoJSON or raster endpoint:

```http
GET /environment/buildings/layer
```

---

# 16. Heat Map API

The heat map should ideally be generated from backend-normalized data rather than being calculated entirely in the browser.

```http
GET /heat/map
```

Parameters:

```text
bbox
timestamp
resolution
```

Response:

```json
{
  "data": {
    "type": "FeatureCollection",
    "features": []
  },
  "meta": {
    "generated_at": "2026-08-30T10:30:00Z",
    "model_version": "heat-risk-v1"
  }
}
```

Possible properties:

```json
{
  "lst": 41.2,
  "air_temperature": 38.4,
  "aqi": 82,
  "ndvi": 0.21,
  "building_density": 74,
  "heat_risk_probability": 0.82
}
```

---

# 17. Environmental Layers

The map should support:

```text
Layer
├── Heat / LST
├── AQI
├── Temperature
├── Vegetation / NDVI
├── Building Density
├── Built-up Area
├── Weather
└── Satellite observation
```

Each layer needs:

```text
name
unit
timestamp
source
resolution
legend
availability
```

Example:

```json
{
  "name": "Land Surface Temperature",
  "unit": "°C",
  "timestamp": "2026-08-29T05:30:00Z",
  "resolution": "30m",
  "source": "satellite",
  "available": true
}
```

---

# 18. Map UX

Desktop:

```text
┌─────────────────────────────────────────────────────┐
│ Header                                               │
├─────────────────────────────────────────────────────┤
│ Layer controls                                       │
│                                                     │
│              ENVIRONMENTAL MAP                      │
│                                                     │
│                                     Legend          │
│                                                     │
│             hotspot ●                              │
│                                                     │
│                           Location inspector        │
└─────────────────────────────────────────────────────┘
```

Mobile:

```text
┌───────────────────┐
│ Header            │
├───────────────────┤
│ AQI / Heat toggle │
├───────────────────┤
│                   │
│       MAP         │
│                   │
│                   │
├───────────────────┤
│ Location details  │
├───────────────────┤
│ Layer selector    │
└───────────────────┘
```

Avoid putting too many map controls on mobile simultaneously.

---

# 19. Data Explorer

The Data Explorer is the main historical-data interface.

Required controls:

```text
Location
Date From
Date To
Metric
Frequency
Search
Sort
```

Example:

```text
[ Bhubaneswar ▼ ]
[ 01 Aug 2026 ] → [ 30 Aug 2026 ]
[ AQI ▼ ]
[ Daily ▼ ]
[ Search...                 ]
```

Table:

```text
Date       AQI   Temp    LST     NDVI   Buildings   Risk
----------------------------------------------------------------
Aug 01     68    35.2    39.1    .42    61%         Moderate
Aug 05     81    37.4    41.7    .40    62%         High
Aug 10     92    38.7    43.0    .36    64%         High
```

---

# 20. Sorting

The frontend should support:

```text
Date
AQI
Temperature
LST
NDVI
Building Density
```

The API should handle sorting for large datasets.

Example:

```http
GET /environment/history?sort=lst&order=desc
```

For small datasets, client-side sorting is acceptable.

---

# 21. Filtering

Supported filters:

```text
Date range
Location
AQI range
Temperature range
LST range
NDVI range
Building density range
Heat-risk category
Data source
```

Example:

```http
GET /environment/history?
from=2026-08-01
&to=2026-08-30
&aqi_min=80
&lst_min=40
&ndvi_max=0.30
```

---

# 22. Export Requirements

Users should be able to collect public data for a selected period.

Required formats:

```text
CSV
JSON
GeoJSON
```

Optional future formats:

```text
Parquet
NetCDF
GeoTIFF
```

For large exports:

```text
Browser
   ↓
POST /exports
   ↓
Backend creates export
   ↓
GET /exports/{id}
   ↓
Download
```

Example:

```json
{
  "format": "csv",
  "location": "Bhubaneswar",
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

---

# 23. API Status / Data Freshness

Every live dataset should show its freshness.

Example:

```text
AQI
72
Updated 5 min ago
```

Satellite:

```text
LST
41.2°C
Observed 29 Aug
```

This is important because satellite observations are not real-time in the same way as IoT/weather feeds.

Use labels such as:

```text
LIVE
Updated 5 min ago

RECENT
Updated 2 hours ago

SATELLITE
Observed 29 Aug

HISTORICAL
30-day dataset
```

Do not label satellite data as "live" unless the source actually supports near-real-time observations.

---

# 24. Loading States

Every API-backed component needs:

```text
Loading
Success
Empty
Error
Stale
```

Example loading:

```text
AQI
----
Loading current air quality...
```

Example error:

```text
AQI unavailable

The air-quality service is temporarily unavailable.

[Retry]
```

Example stale:

```text
AQI 72

Updated 2h 14m ago
Data may be delayed.
```

---

# 25. API Failure Strategy

The frontend should not fail entirely if one source is unavailable.

Example:

```text
AQI       ✓
Weather   ✓
LST       ✓
NDVI      ✕
Buildings ✓
```

The map should continue rendering available layers.

The UI should say:

> Vegetation data is temporarily unavailable.

rather than showing fabricated values.

---

# 26. Data Normalization

External sources may use different:

- units
- timestamps
- coordinate systems
- naming conventions
- AQI standards
- spatial resolutions

The backend should normalize them before the frontend receives them.

Frontend should receive consistent fields such as:

```text
temperature_c
lst_c
pm25_ug_m3
pm10_ug_m3
ndvi
building_density_percent
aqi
latitude
longitude
observed_at
```

---

# 27. Time Handling

Store timestamps in:

```text
UTC / ISO 8601
```

Example:

```text
2026-08-30T10:30:00Z
```

Display according to the selected location's timezone.

Never infer the observation time from the browser's local clock.

---

# 28. Heat-Risk Logic

The frontend should display a backend-provided probability rather than pretending that a simple temperature threshold is a scientific model.

Example:

```json
{
  "heat_risk_probability": 0.82,
  "category": "high",
  "confidence": 0.74,
  "model_version": "heat-risk-v1"
}
```

UI:

```text
HIGH HEAT RISK

82%

Estimated probability

Confidence: Moderate

Main signals:
• High air temperature
• High LST
• Low vegetation
• High building density
• Low wind
```

---

# 29. Probabilistic Insights

The application should support observations involving multiple simultaneous factors.

Example:

```text
Observed hotspot
       │
       ├── LST ↑
       ├── Temperature ↑
       ├── NDVI ↓
       ├── Building density ↑
       └── Wind speed ↓
                │
                ▼
       Heat-risk probability ↑
```

Do not automatically interpret this as causation.

Use language:

```text
associated with
consistent with
may contribute to
possible contributing factor
correlated with
estimated probability
```

Avoid:

```text
caused by
proven to cause
definitely caused by
```

unless supported by an appropriate causal study/model.

---

# 30. Anomaly API

Future backend endpoint:

```http
GET /analytics/anomalies
```

Example:

```json
{
  "data": [
    {
      "metric": "lst",
      "value": 43.2,
      "baseline": 38.4,
      "anomaly": 4.8,
      "z_score": 2.4,
      "severity": "high"
    }
  ]
}
```

Frontend:

```text
LST anomaly

+4.8°C
above baseline

High anomaly
```

---

# 31. Correlation API

Future endpoint:

```http
GET /analytics/correlations
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
      "period": "2026-08-01/2026-08-30"
    },
    {
      "variable_x": "building_density",
      "variable_y": "lst",
      "correlation": 0.64,
      "sample_size": 128,
      "period": "2026-08-01/2026-08-30"
    }
  ]
}
```

Frontend should describe this as:

> "The selected sample shows a negative association between vegetation and LST."

Not:

> "Vegetation reduction caused higher LST."

---

# 32. Design System

## Color hierarchy

### AQI

```text
Good       → Green
Moderate   → Yellow
Unhealthy  → Orange
Very High  → Red
```

### Heat

```text
Low        → Green
Moderate   → Yellow
High       → Orange
Extreme    → Red
```

### General UI

Light:

```text
Background: #F5F7FA
Surface:    #FFFFFF
Text:       #17202A
Muted:      #66727E
Border:     #DBE2E8
```

Dark:

```text
Background: #0B0F14
Surface:    #111820
Surface 2:  #17212B
Text:       #F5F7FA
Muted:      #9AA6B2
Border:     #26313C
```

Use color as an information signal, not decoration.

---

# 33. Typography

Recommended:

```text
Inter
system-ui
sans-serif
```

Hierarchy:

```text
H1 → 40–58px desktop
H2 → 24–30px
H3 → 16–18px
Body → 14–17px
Metadata → 11–13px
```

On Android:

```text
H1 → 34–40px
H2 → 22–26px
Body → 14–16px
```

---

# 34. Responsive Breakpoints

```text
Mobile:
< 650px

Tablet:
650px – 1000px

Desktop:
> 1000px

Large desktop:
> 1400px
```

Mobile priorities:

```text
AQI
↓
Heat
↓
Temperature
↓
Map
↓
Trend
↓
Detailed environmental variables
```

---

# 35. Accessibility

Required:

- WCAG-aware contrast
- Keyboard navigation
- Visible focus states
- ARIA labels for map controls
- Accessible table headers
- Do not communicate status using color alone
- Screen-reader labels for charts
- Touch targets preferably ≥44px
- Responsive text scaling

Example:

```html
<button aria-label="Toggle heat map layer">
  Heat
</button>
```

---

# 36. Performance

Target:

```text
Initial page load < 3 seconds on reasonable mobile connection
```

Use:

- lazy-loaded pages
- lazy-loaded charts
- map only initialized when needed
- API caching
- debounced search
- server-side pagination
- compressed GeoJSON
- vector/raster tiles for large spatial datasets

Avoid downloading an entire city's high-resolution satellite layer to the browser.

---

# 37. Caching Strategy

Suggested freshness:

```text
AQI:
1–5 minutes

Weather:
10–15 minutes

Forecast:
15–60 minutes

Satellite:
Until new observation

Vegetation:
Until new observation

Building density:
Long-term cache

Historical data:
Long cache
```

TanStack Query should manage most frontend caching.

---

# 38. Mock → Real API Migration

The existing prototype currently contains:

```javascript
const rows = [...]
```

This should eventually become:

```javascript
const { data, isLoading, error } = useHistoricalData({
  from,
  to,
  location
});
```

Current:

```text
Static HTML
    ↓
Hardcoded JavaScript data
    ↓
Charts
    ↓
Table
```

Production:

```text
React
   ↓
TanStack Query
   ↓
API client
   ↓
UrbanCool backend
   ↓
Normalized data
```

---

# 39. API Client Example

Recommended structure:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {

  const query = params
    ? "?" + new URLSearchParams(params).toString()
    : "";

  const response = await fetch(
    `${API_BASE_URL}${endpoint}${query}`
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
```

AQI:

```typescript
export function getCurrentAQI(lat: number, lon: number) {
  return apiFetch("/aqi/current", {
    lat: String(lat),
    lon: String(lon)
  });
}
```

---

# 40. React Query Example

```typescript
export function useCurrentAQI(lat: number, lon: number) {
  return useQuery({
    queryKey: ["aqi", "current", lat, lon],
    queryFn: () => getCurrentAQI(lat, lon),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  });
}
```

Component:

```tsx
function AQICard({ lat, lon }) {

  const {
    data,
    isLoading,
    error
  } = useCurrentAQI(lat, lon);

  if (isLoading) {
    return <AQICardSkeleton />;
  }

  if (error) {
    return <AQIError />;
  }

  return (
    <AQICardView
      aqi={data.data.aqi}
      category={data.data.category}
      pm25={data.data.pm25}
    />
  );
}
```

---

# 41. Map API Architecture

Do not make the map component responsible for fetching every API.

Use:

```text
useEnvironmentalLayers()
```

which returns:

```typescript
{
  heatLayer,
  aqiLayer,
  vegetationLayer,
  buildingLayer,
  weatherLayer,
  satelliteLayer
}
```

The map only decides:

```text
Which layers are visible?
```

The API layer decides:

```text
Where data comes from.
```

---

# 42. Suggested Backend API Namespace

```text
/v1
│
├── /aqi
│   ├── /current
│   └── /history
│
├── /weather
│   ├── /current
│   └── /forecast
│
├── /satellite
│   ├── /lst
│   ├── /imagery
│   └── /observations
│
├── /environment
│   ├── /vegetation
│   ├── /buildings
│   └── /landcover
│
├── /heat
│   ├── /map
│   ├── /current
│   └── /history
│
├── /analytics
│   ├── /anomalies
│   ├── /correlations
│   └── /risk
│
└── /exports
    ├── POST /
    └── GET /{id}
```

---

# 43. Security

Because this is a public application:

### Frontend can expose

```text
Public API base URL
Map public style/token where applicable
Public configuration
```

### Frontend must NOT expose

```text
Provider secret keys
Database credentials
Cloud credentials
Private API keys
Service-account credentials
```

Backend should handle all secret provider communication.

---

# 44. Rate Limiting

Public APIs should have backend rate limiting.

Example:

```text
Anonymous public client
100 requests / minute / IP
```

The exact limits should be determined after load testing.

Use caching aggressively so repeated users do not trigger repeated external provider requests.

---

# 45. Error and Data Quality Model

Every dataset should have:

```text
source
observed_at
received_at
processed_at
quality
resolution
coverage
```

Example:

```json
{
  "source": "satellite-provider",
  "observed_at": "2026-08-29T05:30:00Z",
  "received_at": "2026-08-29T08:10:00Z",
  "processed_at": "2026-08-29T08:15:00Z",
  "quality": "good",
  "resolution": "30m"
}
```

This lets the UI explain why two datasets have different timestamps.

---

# 46. Phase-Based Development Plan

## Phase 1 — Frontend foundation

Deliver:

- React + TypeScript + Vite
- routing
- design tokens
- light/dark theme
- responsive navigation
- reusable cards
- mobile layout
- accessibility baseline

---

## Phase 2 — Live environmental map

Deliver:

- MapLibre/Leaflet
- map controls
- heat layer
- AQI layer
- vegetation layer
- building-density layer
- map legend
- location popup

Replace:

```text
Static map
```

with:

```text
GET /heat/map
GET /aqi/current
GET /environment/vegetation
GET /environment/buildings
```

---

## Phase 3 — Real-time environmental data

Connect:

```text
AQI API
Weather API
Forecast API
```

Add:

- automatic refresh
- timestamps
- stale indicators
- loading states
- errors
- retry

---

## Phase 4 — Satellite integration

Connect:

```text
LST
NDVI
Land cover
Satellite observations
```

Add:

- observation timestamp
- cloud/data-quality indicator
- spatial resolution
- satellite layer controls

---

## Phase 5 — Historical Data Explorer

Deliver:

- date-range filtering
- metric filtering
- location filtering
- sorting
- pagination
- search
- chart/table toggle

---

## Phase 6 — Export

Deliver:

```text
CSV
JSON
GeoJSON
```

For large datasets:

```text
Backend-generated export jobs
```

---

## Phase 7 — Analytics

Deliver:

```text
Anomaly detection
Correlation analysis
Heat-risk probability
Environmental relationships
```

Every analytical result should expose:

```text
period
sample size
method
confidence
model version
```

where applicable.

---

## Phase 8 — Production hardening

Deliver:

- API monitoring
- performance optimization
- accessibility audit
- mobile testing
- browser testing
- rate-limit handling
- error telemetry
- caching
- security review

---

# 47. Recommended Page Priority

The navigation should remain simple.

### Primary

```text
Home
Live Map
Data Explorer
```

### Secondary

```text
Air Quality
Environment
Insights
```

This prevents the public site from feeling like an enterprise dashboard.

---

# 48. Home Page Layout

```text
┌─────────────────────────────────────────────┐
│ UrbanCool Twin       Map Data Insights  ☾  │
├─────────────────────────────────────────────┤
│                                             │
│ Understand your city's environmental state  │
│                                             │
│ [Explore live map] [Explore historical]     │
│                                             │
├──────────┬──────────┬──────────┬────────────┤
│ AQI      │ Heat     │ Temp     │ Vegetation │
│ 72       │ HIGH     │ 38.4°C   │ 28%        │
├──────────┴──────────┴──────────┴────────────┤
│                                             │
│              LIVE HEAT MAP                  │
│                                             │
├───────────────────────┬─────────────────────┤
│ AQI TREND             │ TEMP TREND          │
│                       │                     │
├───────────────────────┴─────────────────────┤
│ Data source / freshness                     │
└─────────────────────────────────────────────┘
```

---

# 49. Mobile Home Page

```text
Header
   ↓
AQI
   ↓
Heat Risk
   ↓
Temperature
   ↓
Live Map
   ↓
AQI Trend
   ↓
Heat Trend
   ↓
Environmental factors
   ↓
Data freshness
```

Do not put four large charts above the map on mobile.

---

# 50. Definition of Done

The frontend is ready for production when:

### Architecture

- [ ] React + TypeScript implemented
- [ ] API client separated from components
- [ ] Type-safe API models
- [ ] Environment configuration implemented

### Data

- [ ] Static data removed
- [ ] AQI API connected
- [ ] Weather API connected
- [ ] Satellite API connected
- [ ] Vegetation API connected
- [ ] Building-density API connected
- [ ] Heat API connected

### UX

- [ ] Light mode
- [ ] Dark mode
- [ ] Desktop responsive
- [ ] Android responsive
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Data freshness labels

### Map

- [ ] Heat layer
- [ ] AQI layer
- [ ] Vegetation layer
- [ ] Building layer
- [ ] Layer legend
- [ ] Location inspection

### Data Explorer

- [ ] Search
- [ ] Sort
- [ ] Filters
- [ ] Date ranges
- [ ] Pagination
- [ ] CSV
- [ ] JSON
- [ ] GeoJSON

### Analytics

- [ ] Anomaly display
- [ ] Correlation display
- [ ] Probability display
- [ ] Confidence indicator
- [ ] Explanation of contributing signals
- [ ] Observation/inference distinction

---

# 51. Important Scientific UX Rule

The frontend should make it impossible—or at least difficult—for users to confuse:

```text
Measurement
     ↓
Correlation
     ↓
Model inference
     ↓
Causal conclusion
```

These are not equivalent.

Recommended presentation:

> **Observation:** The hotspot has high LST and low vegetation.

> **Association:** Across the selected observations, lower NDVI is associated with higher LST.

> **Possible explanation:** Vegetation can influence surface energy balance and cooling.

> **Model estimate:** Current conditions correspond to an estimated 82% high-heat-risk probability.

> **Caution:** This does not by itself establish that vegetation loss caused the hotspot.

This distinction is especially important when combining satellite, weather, pollution and urban-form datasets.

---

# 52. Final Production Architecture

```text
                    PUBLIC USER
                         │
                         ▼
              ┌─────────────────────┐
              │ Responsive Web App   │
              │ React + TypeScript   │
              └──────────┬──────────┘
                         │
                 TanStack Query
                         │
                         ▼
              ┌─────────────────────┐
              │ UrbanCool API       │
              │ REST / JSON         │
              └──────────┬──────────┘
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
   AQI/IoT           Weather          Satellite
   Sources           Sources          Sources
       │                 │                 │
       └─────────────────┼─────────────────┘
                         ▼
              ┌─────────────────────┐
              │ Data Processing     │
              │ Normalization       │
              │ Spatial Processing  │
              │ Aggregation         │
              └──────────┬──────────┘
                         ▼
              ┌─────────────────────┐
              │ Analytics Engine    │
              │ Anomalies           │
              │ Correlations        │
              │ Heat Risk           │
              └──────────┬──────────┘
                         ▼
              ┌─────────────────────┐
              │ Database / Cache    │
              └─────────────────────┘
```

---

# 53. Immediate Next Step

The existing HTML prototype should be treated as the **visual reference**, not the final architecture.

Migration path:

```text
Existing HTML/CSS/JS
        ↓
Extract design system
        ↓
React components
        ↓
TypeScript types
        ↓
API client
        ↓
TanStack Query
        ↓
Real backend endpoints
        ↓
MapLibre environmental layers
        ↓
Production deployment
```

The most important architectural decision is to keep **the frontend independent of individual data providers**. The backend should normalize AQI, weather, satellite, vegetation and urban-form data into one consistent API so that providers can be changed later without rewriting the frontend.
