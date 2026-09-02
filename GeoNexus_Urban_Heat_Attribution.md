
# GeoNexus — Urban Heat Attribution & Geospatial Intelligence

## 1. Vision

GeoNexus is an interactive urban intelligence platform focused initially on Bhubaneswar.

The platform should let a user:

1. View a fixed geographic area on an interactive map.
2. Dynamically zoom from city → zone → neighborhood → fine spatial grid.
3. Toggle independent geospatial layers.
4. View each layer as a colored heatmap/raster.
5. Click any location/grid cell and inspect all available environmental and urban metrics.
6. Determine whether excess urban heat is primarily associated with:
   - seasonal/weather conditions,
   - vegetation deficiency,
   - building density,
   - impervious/built-up surface,
   - roads,
   - water availability,
   - air pollution/AQI,
   - or other environmental factors.
7. Generate a human-readable explanation using an LLM such as Gemini.
8. Eventually simulate interventions such as increasing vegetation or reducing impervious surface.

The core concept is:

> **Map → Measurement → Heat Anomaly → Attribution → Explanation → Intervention Simulation**

---

# 2. Core Product Question

GeoNexus should not merely answer:

> "Is this area hot?"

It should answer:

> **"Why is this area hotter than expected, and how much of the excess heat is attributable to season/weather, vegetation, buildings, pollution, and other urban factors?"**

This distinction is critical.

AQI must not automatically be treated as a cause of heat simply because high AQI and high temperature occur together.

The system must account for confounding variables such as:

- season,
- month,
- solar radiation,
- humidity,
- wind,
- precipitation,
- cloud cover,
- time of day,
- elevation,
- land cover,
- and other weather conditions.

---

# 3. Initial Geographic Scope

## MVP

Start with:

**Bhubaneswar, Odisha, India**

Use a fixed city boundary/polygon.

The system should eventually support arbitrary cities, but Bhubaneswar is the first study area.

---

# 4. Spatial Model

The fundamental unit of GeoNexus should be a spatial grid cell.

Example hierarchy:

```text
Bhubaneswar
    ↓
City
    ↓
Zone
    ↓
Neighborhood
    ↓
500m × 500m grid
    ↓
100m × 100m grid
    ↓
Potentially finer resolution where data permits
```

Every grid cell should have a common set of attributes.

Example:

```json
{
  "cell_id": "BBSR_10293",
  "geometry": "...",

  "temperature": {},
  "vegetation": {},
  "buildings": {},
  "air_quality": {},
  "weather": {},
  "land_cover": {},

  "heat_anomaly": {},
  "attribution": {}
}
```

Using a common spatial grid makes different datasets comparable.

---

# 5. Map Requirements

The frontend should provide an interactive map.

Potential technology:

- MapLibre GL JS
- OpenStreetMap-based basemap
- Raster/vector tile layers
- WebGL rendering where useful

The user should be able to toggle layers independently.

## Initial layers

```text
☑ Base Map

☐ Urban Heat
☐ Air Quality
☐ Vegetation
☐ Building Density
☐ Impervious Surface
☐ Land Cover
☐ Tree Canopy
☐ Elevation
☐ Population Density
☐ Road Density
☐ Water Proximity
```

Each analytical layer should have its own color scale.

---

# 6. Heat Layer

The primary heat layer should represent land surface temperature (LST) rather than simply air temperature.

Example:

```text
Cool                          Hot

🟦 ─── 🟩 ─── 🟨 ─── 🟧 ─── 🟥
```

For every grid cell, store:

```json
{
  "lst": 41.7,
  "lst_unit": "C",
  "reference_temperature": 36.9,
  "anomaly": 4.8
}
```

The system should distinguish:

- absolute temperature,
- expected temperature,
- temperature anomaly.

---

# 7. Seasonal / Weather Baseline

This is one of the most important parts of the system.

A high temperature during May should not automatically be considered abnormal urban heat.

The model should estimate:

```text
Expected temperature under prevailing
seasonal + meteorological conditions
```

Then:

```text
Heat anomaly =
Observed temperature
-
Expected temperature
```

Example:

```text
Observed LST       = 41.2°C
Expected LST       = 36.8°C

Heat anomaly       = +4.4°C
```

Potential baseline variables:

- month
- season
- time of day
- solar radiation
- humidity
- wind speed
- precipitation
- cloud cover
- elevation
- recent rainfall
- atmospheric conditions

The exact feature set should be validated experimentally.

---

# 8. Vegetation Layer

Potential indicators:

- NDVI
- EVI
- vegetation percentage
- tree canopy percentage
- vegetation density
- distance to vegetation
- vegetation fragmentation

Example:

```json
{
  "ndvi": 0.18,
  "vegetation_cover_percent": 17,
  "tree_canopy_percent": 11
}
```

Vegetation is expected to influence heat through mechanisms such as:

- shade,
- evapotranspiration,
- reduced surface heating,
- moisture availability.

---

# 9. Building Layer

Potential indicators:

- building coverage
- building density
- building height
- building volume
- floor-area-related density where data allows
- distance between buildings
- built-up surface
- impervious surface

Example:

```json
{
  "building_coverage_percent": 72,
  "average_building_height_m": 11.2,
  "building_density": 0.67,
  "impervious_surface_percent": 76
}
```

Building density can affect heat through:

- reduced ventilation,
- heat storage,
- reduced vegetation,
- increased impervious surfaces,
- urban canyon effects.

Do not assume causality from correlation alone.

---

# 10. Air Quality Layer

Potential metrics:

- AQI
- PM2.5
- PM10
- NO2
- SO2
- CO
- O3
- other available pollutants

Important distinction:

> AQI is an air-quality indicator. It should not automatically be interpreted as a direct cause of local surface temperature.

Pollution may correlate with temperature because both are affected by:

- atmospheric stability,
- wind,
- traffic,
- urban density,
- season,
- weather,
- industrial activity.

The model should determine whether pollution adds meaningful explanatory power after controlling for these factors.

---

# 11. Data Sources

A likely initial architecture is:

## Google Earth Engine

Use Earth Engine as the primary geospatial processing/data platform.

Potential datasets include:

- Sentinel-2
- Landsat
- MODIS
- Sentinel-5P
- DEM/elevation datasets
- land-cover datasets
- Open Buildings
- GHSL
- other public Earth observation datasets

## Air Quality

For consumer-style/current AQI, evaluate a dedicated air-quality API such as Google Air Quality API.

For atmospheric satellite measurements, evaluate Sentinel-5P datasets through Earth Engine.

## Base Map

Possible options:

- OpenStreetMap
- MapLibre-compatible tile provider
- Google Maps Platform, if its licensing/product requirements fit the project

Do not assume all data sources have identical licensing or resolution.

---

# 12. Backend Architecture

Recommended conceptual architecture:

```text
                         GeoNexus Frontend
                                │
                                ▼
                         MapLibre GL JS
                                │
             ┌──────────────────┴──────────────────┐
             │                                     │
        Tile Requests                         Click Analysis
             │                                     │
             ▼                                     ▼
        Tile Service                         GeoNexus API
                                                   │
                         ┌─────────────────────────┼───────────────────────┐
                         │                         │                       │
                         ▼                         ▼                       ▼
                    Earth Engine              PostGIS                Weather/AQI
                         │                         │                       │
                         └─────────────────────────┼───────────────────────┘
                                                   │
                                                   ▼
                                           Feature Extraction
                                                   │
                                                   ▼
                                            Heat Model
                                                   │
                                                   ▼
                                           Attribution Model
                                                   │
                                                   ▼
                                              Gemini/LLM
                                                   │
                                                   ▼
                                             Explanation
```

---

# 13. Tile Architecture

Do not send the entire Bhubaneswar dataset to the browser.

Use tiles.

Conceptually:

```http
GET /tiles/heat/{z}/{x}/{y}
GET /tiles/aqi/{z}/{x}/{y}
GET /tiles/vegetation/{z}/{x}/{y}
GET /tiles/buildings/{z}/{x}/{y}
```

The map requests only the tiles required for the current viewport and zoom level.

This allows dynamic zooming.

---

# 14. Location Click API

When the user clicks a location:

```http
GET /api/location/{lat}/{lon}
```

or:

```http
GET /api/cell/{cell_id}
```

Return all relevant metrics.

Example:

```json
{
  "location": {
    "lat": 20.2961,
    "lon": 85.8245
  },

  "heat": {
    "surface_temperature_c": 41.2,
    "expected_temperature_c": 36.8,
    "anomaly_c": 4.4
  },

  "vegetation": {
    "ndvi": 0.18,
    "cover_percent": 17,
    "tree_canopy_percent": 11
  },

  "buildings": {
    "coverage_percent": 72,
    "average_height_m": 11.2,
    "impervious_surface_percent": 76
  },

  "air_quality": {
    "aqi": 164,
    "pm25": 91
  },

  "weather": {
    "humidity": 68,
    "wind_speed": 2.1,
    "solar_radiation":  ...
  }
}
```

---

# 15. Heat Attribution

This is the central analytical feature.

The system should estimate how much each factor contributes to the observed heat anomaly.

Example:

```text
Observed LST                41.2°C
Expected LST                36.8°C
Heat anomaly                +4.4°C
```

Possible attribution:

```text
Season / Weather       48%
Low vegetation         27%
Building density       18%
Impervious surface      5%
Road density            1%
Air pollution           1%
```

Important:

These percentages are illustrative only.

The actual system must derive them from validated statistical/ML methods.

---

# 16. Why Simple Rules Are Not Enough

Avoid relying on a large collection of manually written conditions such as:

```text
IF NDVI < 0.2
AND building density > 70%
AND AQI > 150
THEN pollution causes heat
```

This will produce misleading conclusions.

Instead, construct a dataset where each spatial cell/time observation contains:

```text
Target:
    Land Surface Temperature / Heat Anomaly

Features:
    NDVI
    Tree canopy
    Building coverage
    Building height
    Impervious surface
    Road density
    Water proximity
    AQI
    PM2.5
    Weather
    Season
    Month
    Solar radiation
    Humidity
    Wind
    Rainfall
    Elevation
    etc.
```

---

# 17. Initial ML Approach

A practical initial experiment:

```text
XGBoost / Gradient Boosted Trees
```

Predict:

```text
Heat anomaly
```

from environmental and urban features.

Then use:

```text
SHAP
```

or another explainability method to determine feature contributions to individual predictions.

Example:

```text
Heat anomaly: +4.4°C

Feature contribution

Low vegetation          +1.2°C
Building density        +0.8°C
Impervious surface      +0.3°C
Road density            +0.1°C
AQI                      +0.1°C
Weather/season          +1.9°C
```

Again, these values are examples, not expected results.

---

# 18. Important Causal-Inference Warning

SHAP/feature importance does NOT automatically establish causality.

For example:

```text
AQI ↑
Temperature ↑
```

does not prove:

```text
AQI → Temperature
```

Both could be caused by:

```text
Low wind
    ↓
Pollution accumulates
    +
Heat remains trapped
```

Therefore, if GeoNexus eventually makes statements such as:

> "Increasing tree canopy by 10% would reduce LST by 1.5°C."

the system should use a causal/counterfactual methodology rather than treating SHAP as proof.

Potential future methods:

- causal inference
- panel data
- matched comparisons
- difference-in-differences
- causal forests
- counterfactual modeling
- spatial statistics
- controlled scenario models

---

# 19. Gemini's Role

Gemini should NOT be responsible for calculating scientific results.

Bad architecture:

```text
Raw data
   ↓
Gemini
   ↓
"Pollution caused the heat"
```

Preferred architecture:

```text
Raw geospatial data
       ↓
Feature extraction
       ↓
Statistical/ML model
       ↓
Attribution
       ↓
Structured evidence
       ↓
Gemini
       ↓
Human-readable explanation
```

Gemini becomes the explanation layer.

---

# 20. AI Explanation Example

Input to Gemini:

```json
{
  "observed_temperature": 41.2,
  "expected_temperature": 36.8,
  "heat_anomaly": 4.4,

  "attribution": {
    "weather_season": 1.9,
    "vegetation": 1.2,
    "building_density": 0.8,
    "impervious_surface": 0.3,
    "road_density": 0.1,
    "air_pollution": 0.1
  },

  "confidence": {
    "overall": 0.82
  }
}
```

Expected explanation:

> This location is approximately 4.4°C warmer than the modeled baseline. Seasonal and weather conditions explain a substantial portion of the temperature, while low vegetation and high building density appear to be the strongest urban contributors. Air pollution has comparatively little explanatory contribution in this model, so the elevated AQI should not be interpreted as the primary cause of the heat.

Gemini should be instructed to:

- only use supplied evidence,
- distinguish correlation from causation,
- state uncertainty,
- avoid inventing measurements,
- avoid claiming causality unless the underlying model supports it.

---

# 21. UI Design

Clicking a location should open a side panel.

```text
┌────────────────────────────────────────────┐
│ Selected Area                              │
│                                            │
│ Surface Temperature        41.2°C          │
│ Expected Temperature       36.8°C          │
│ Heat Anomaly               +4.4°C 🔴       │
│                                            │
│ ─────────────────────────────────────────  │
│                                            │
│ WHY IS THIS AREA HOT?                      │
│                                            │
│ Season / Weather             43%           │
│ Vegetation                   27%           │
│ Building Density             18%           │
│ Impervious Surface            7%           │
│ AQI                            2%           │
│ Other                          3%           │
│                                            │
│ Primary urban factor: Vegetation           │
│                                            │
│ ─────────────────────────────────────────  │
│                                            │
│ AI Explanation                             │
│                                            │
│ Low vegetation appears to be the strongest │
│ urban contributor to the excess heat...    │
└────────────────────────────────────────────┘
```

The panel should clearly distinguish:

- measured values,
- model predictions,
- model attribution,
- AI-generated explanation.

---

# 22. Confidence

Every attribution should have a confidence/uncertainty indicator.

Example:

```text
Overall confidence       82%

Vegetation contribution  High confidence
Buildings                Medium confidence
AQI                      Low confidence
Season/weather            High confidence
```

This is especially important when data resolution or temporal alignment is weak.

---

# 23. Temporal Analysis

Do not restrict the model to a single snapshot.

Potential views:

```text
Today
↓
7 days
↓
30 days
↓
Season
↓
Year
↓
Multi-year trend
```

Example:

```text
Temperature anomaly
2022 ────────╮
2023 ────────┼────╮
2024 ────────┼────┼──╮
2025 ────────┼────┼──┼──
2026 ────────┼────┼──┼──╮
```

This allows the platform to distinguish temporary weather effects from persistent urban changes.

---

# 24. Scenario Engine

Future feature:

## "What if?"

Example:

```text
Current vegetation:
18%

Scenario:
Increase vegetation to 30%

Model:
Predicted LST change = -X°C
```

Other scenarios:

```text
+10% tree canopy
+20% vegetation
-10% impervious surface
Reduce building density
Add water bodies
Increase reflective surfaces
Reduce road surface
```

The scenario engine should eventually use causal/counterfactual models.

It should never present hypothetical outputs as measured facts.

---

# 25. Recommended Development Phases

## Phase 1 — Map Foundation

Goal:

Get Bhubaneswar on an interactive map.

Implement:

- city boundary
- MapLibre
- basemap
- zoom/pan
- layer switcher
- grid overlay

Deliverable:

A working interactive Bhubaneswar map.

---

## Phase 2 — Heat Layer

Implement:

- Landsat/MODIS/other appropriate LST source
- spatial aggregation
- heat raster
- color scale
- tile rendering

Deliverable:

Bhubaneswar heatmap.

---

## Phase 3 — Vegetation

Implement:

- Sentinel-2
- NDVI
- vegetation coverage
- vegetation heatmap

Deliverable:

Independent vegetation layer.

---

## Phase 4 — Building Density

Implement:

- Open Buildings / GHSL
- building coverage
- building height/density where available
- built-up surface

Deliverable:

Building-density layer.

---

## Phase 5 — Air Quality

Implement:

- AQI source
- PM2.5/PM10
- temporal alignment
- AQI layer

Deliverable:

Air-quality map.

---

## Phase 6 — Click Analysis

Implement:

```text
Map click
    ↓
Find grid cell
    ↓
Retrieve all metrics
    ↓
Display panel
```

Deliverable:

A user can click anywhere and inspect the location.

---

## Phase 7 — Seasonal Baseline

Implement:

- historical temperature data
- seasonal features
- weather variables
- expected temperature model
- heat anomaly

Deliverable:

System can distinguish:

```text
Hot because it is summer
```

from:

```text
Hot beyond what is expected for this season/weather
```

---

## Phase 8 — Attribution Model

Train initial ML model.

Start with:

- XGBoost
- feature engineering
- cross-validation
- spatial validation
- SHAP

Deliverable:

Quantitative feature contribution estimates.

---

## Phase 9 — Gemini Explanation

Build an explanation service.

Input:

```json
{
  "measurements": {},
  "baseline": {},
  "attribution": {},
  "confidence": {}
}
```

Output:

Human-readable explanation.

Deliverable:

"Why is this area hot?" feature.

---

## Phase 10 — Validation

This phase is critical.

Test whether:

- heat predictions generalize spatially,
- heat predictions generalize temporally,
- vegetation contribution is stable,
- building contribution is stable,
- AQI contribution changes under different weather conditions,
- the model behaves sensibly in known urban/rural areas.

Avoid releasing causal claims before validation.

---

## Phase 11 — Scenario Engine

Add counterfactual simulation.

Example:

```text
What if vegetation increased by 20%?

Current:
    LST = X

Scenario:
    LST = Y

Estimated change:
    Y - X
```

---

## Phase 12 — Multi-City Platform

After Bhubaneswar works:

```text
Bhubaneswar
Delhi
Mumbai
Bengaluru
Hyderabad
Kolkata
Chennai
Pune
...
```

Generalize the pipeline so a city is defined by:

```json
{
  "city": "...",
  "boundary": "...",
  "grid_resolution": "...",
  "data_sources": {},
  "model": {}
}
```

---

# 26. Suggested Technology Stack

## Frontend

```text
React / Next.js
MapLibre GL JS
TypeScript
```

## Backend

Potential options:

```text
Python + FastAPI
```

Python is particularly useful for:

- geospatial processing,
- ML,
- Earth Engine integration,
- scientific libraries.

Alternative:

```text
Java/Spring Boot
```

for API/business logic, with a separate Python ML service.

A hybrid architecture is perfectly reasonable.

---

# 27. Geospatial Storage

Potential:

```text
PostgreSQL
    +
PostGIS
```

Use PostGIS for:

- city boundaries,
- grid cells,
- spatial queries,
- geometry,
- vector features.

Large raster data should generally remain in appropriate cloud/object/geospatial storage rather than being unnecessarily loaded into PostGIS.

---

# 28. Data Processing

Potential architecture:

```text
Earth Engine
      ↓
Preprocessing
      ↓
Common spatial grid
      ↓
Feature extraction
      ↓
PostGIS / analytical storage
      ↓
ML pipeline
```

The exact storage strategy should be optimized after measuring data volume and query patterns.

---

# 29. Important Data Alignment Problem

Different datasets have different:

- spatial resolutions,
- timestamps,
- revisit frequencies,
- measurement methods,
- uncertainties.

For example:

```text
Dataset A:
10m resolution

Dataset B:
30m resolution

Dataset C:
1km resolution
```

Do not pretend they all have 10m accuracy.

The system should retain metadata:

```json
{
  "source": "...",
  "resolution": "...",
  "timestamp": "...",
  "quality": "...",
  "uncertainty": "..."
}
```

---

# 30. Key Scientific Principle

GeoNexus should separate four concepts:

### Measurement

What was observed?

```text
LST = 41.2°C
```

### Baseline

What would be expected?

```text
Expected LST = 36.8°C
```

### Attribution

What factors explain the anomaly?

```text
Vegetation = major contributor
Buildings = secondary contributor
AQI = minor contributor
```

### Explanation

How do we communicate the result?

```text
Gemini-generated narrative
```

Never mix these layers.

---

# 31. Product Positioning

GeoNexus is not simply:

- an AQI app,
- a weather app,
- a satellite map,
- a heatmap,
- or a vegetation viewer.

The differentiating feature is:

> **An interactive urban heat attribution platform that combines environmental, satellite, and urban-form data to explain why specific areas experience excess heat.**

The long-term product can evolve into:

> **An urban decision-support system that identifies environmental drivers of urban heat and evaluates potential interventions.**

---

# 32. MVP Definition

Do not attempt everything initially.

The first working version should contain only:

```text
Bhubaneswar
    │
    ├── Heat map
    ├── Vegetation map
    ├── Building-density map
    ├── AQI map
    │
    └── Click location
            │
            ├── Temperature
            ├── Vegetation
            ├── Buildings
            ├── AQI
            ├── Seasonal baseline
            │
            └── "Why is this hot?"
                    │
                    ├── Quantitative attribution
                    └── Gemini explanation
```

This is enough to prove the central concept.

---

# 33. MVP Success Criteria

The MVP is successful if a user can:

1. Open Bhubaneswar.
2. Toggle between heat, AQI, vegetation, and building-density layers.
3. Zoom smoothly.
4. Click any location.
5. See the environmental/urban metrics for that location.
6. See whether the temperature is anomalous for the relevant season/weather conditions.
7. See an attribution breakdown.
8. Understand whether vegetation, buildings, pollution, or weather appears to be the dominant factor.
9. See an AI explanation that is grounded in the quantitative analysis.

---

# 34. Final Architecture

```text
                         GEO NEXUS
                             │
                             ▼
                    Interactive City Map
                             │
        ┌────────────────────┼─────────────────────┐
        │                    │                     │
      HEAT                  AQI              VEGETATION
        │                    │                     │
        └────────────────────┼─────────────────────┘
                             │
                       BUILDINGS
                             │
                             ▼
                     Common Grid Cells
                             │
                             ▼
                   Seasonal/Weather Model
                             │
                             ▼
                      Heat Anomaly
                             │
                             ▼
                    Attribution Model
                             │
             ┌───────────────┼────────────────┐
             │               │                │
        Vegetation       Buildings           AQI
             │               │                │
             └───────────────┼────────────────┘
                             │
                             ▼
                    Confidence / Evidence
                             │
                             ▼
                         Gemini
                             │
                             ▼
                   Human Explanation
                             │
                             ▼
                     "Why is it hot?"
                             │
                             ▼
                     Future Scenario
                     / Counterfactual
                         Engine
```

## Guiding principle

**Use geospatial science and ML to determine the answer. Use Gemini to explain the answer.**

Do not use Gemini as the scientific attribution engine.
