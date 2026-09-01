# Phase 5 — Satellite, Heat Maps and Analytics

## NDVI

For Sentinel-2:

```text
NDVI = (NIR - Red) / (NIR + Red)
```

Use the correct bands for the selected product. Preserve:

```text
scene
timestamp
cloud fraction
resolution
source
processing version
```

## LST

Use an actual thermal/LST product. Do not infer LST from RGB/NIR alone.

For Landsat, retain:

```text
collection/product
thermal band
scale factor
quality flags
algorithm
processing version
```

## Heat score

Initial transparent model:

```text
heat_score =
  w1*z(LST)
+ w2*z(air_temperature)
+ w3*z(humidity)
- w4*z(wind)
- w5*z(NDVI)
+ w6*z(building_density)
```

Weights are configuration/model parameters, not scientific facts. Validate them against historical observations.

## Probability

Do not call a weighted score a probability.

Use:

```text
features
  ↓
validated model
  ↓
calibration
  ↓
probability
```

Return:

```json
{
  "probability": 0.82,
  "confidence": 0.74,
  "model_version": "heat-risk-v1"
}
```

## Anomaly

Use comparable baselines:

```text
same location
same season
same time-of-day
historical observations
```

Return:

```text
value
baseline
difference
percentile
z_score
baseline_definition
sample_size
```

## Correlation API

```http
GET /api/v1/analytics/correlations?x=ndvi&y=lst&location=bbsr&from=2026-01-01&to=2026-08-31
```

Example:

```json
{
  "x": "ndvi",
  "y": "lst",
  "method": "pearson",
  "correlation": -0.71,
  "p_value": 0.002,
  "sample_size": 128
}
```

Correlation is association, not proof of causation.

## Multivariable models

Candidate methods:

```text
OLS
GLM
GAM
Random Forest
Gradient Boosting
Bayesian models
```

Potential features:

```text
LST
air_temperature
humidity
wind
NDVI
building_density
rain
solar_radiation
```

Use hold-out periods and cross-validation.

## Public insight

Preferred:

> Higher building density was associated with higher LST in the selected observations.

Avoid:

> Building density caused higher LST.

unless a separate causal study actually supports that claim.
