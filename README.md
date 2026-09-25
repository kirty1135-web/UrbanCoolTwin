Hyperlocal Urban Heat and Air-Quality Digital Twin

This project was developed as part of Smart India Hackathon 2026 by Team Geo Nexus.

Problem Statement: SOAIDEATHON-S18
Theme: Clean and Green Technology

About the Project

Urban temperature and air quality can vary a lot even within the same city. However, available sensors and existing data sources often don't provide enough detail for making decisions at a local level.

Our idea is to build a hyperlocal digital twin of an urban area using satellite data, sensor data and machine learning.

The system divides the area into a 10m × 10m grid and uses the available data to estimate temperature, air quality and other environmental conditions in places where direct sensor data may not be available.

How it works

The proposed system combines:

- IoT sensor data
- Landsat and Sentinel-5P data
- Land surface temperature
- Building and vegetation information
- GIS data
- Machine learning models

The data is processed and combined to generate a more detailed view of heat and air-quality conditions across the area.

A Vulnerability-Weighted Impact Score is also used to help prioritize areas where interventions may have a greater impact.

The system also shows prediction uncertainty through a visual layer called "confidence fog", so users can understand how reliable a prediction is.

Main Features

- 10m × 10m environmental grid
- Heat and air-quality visualization
- Satellite and sensor data fusion
- Vulnerability-based prioritization
- Prediction confidence visualization
- Support for cooling and urban greening planning
- Scenario-based intervention planning

Tech Stack

Frontend

- React.js
- Mapbox GL JS
- deck.gl

Backend

- Python
- FastAPI
- Node.js / Next.js

Database

- PostgreSQL
- PostGIS

ML

- TensorFlow / PyTorch
- scikit-learn

Geospatial

- Google Earth Engine
- QGIS

Data

- Landsat
- Sentinel-5P
- Sensor / simulated sensor data

Infrastructure

- Docker
- AWS / GCP

Hardware

The proposed hardware setup uses:

- ESP32
- DHT22
- PMS5003
- LoRaWAN

For the prototype, hardware is not required and public or simulated sensor data can be used.

Why this project?

The main goal is to help planners move from reactive planning to predictive and location-specific planning.

The system can be used to identify areas that may need:

- Urban greening
- Heat reduction measures
- Air-quality interventions
- Better allocation of infrastructure resources

It also considers vulnerable populations while prioritizing areas for intervention.

My Contribution  
-Frontend development 
-UI implementation 
-map visualization 
-API integration

Future Scope

The initial system can be tested for a single city or zone and later expanded to larger areas.

Some possible future improvements are:

- Real-time sensor integration
- More detailed intervention simulations
- City-wide deployment
- Improved ML models
- Integration with urban planning systems

Team

Geo Nexus

Developed for Smart India Hackathon 2026.
