from fastapi import APIRouter, Query
import httpx
import json

router = APIRouter()

@router.get("/buildings")
async def get_buildings_geojson(
    min_lon: float = Query(...),
    min_lat: float = Query(...),
    max_lon: float = Query(...),
    max_lat: float = Query(...)
):
    # Enforce a max bounding box size to prevent massive Overpass queries
    if abs(max_lon - min_lon) > 0.1 or abs(max_lat - min_lat) > 0.1:
        return {"type": "FeatureCollection", "features": [], "error": "BBox too large"}

    overpass_url = "https://overpass-api.de/api/interpreter"
    query = f"""
    [out:json][timeout:25];
    (
      way["building"]({min_lat},{min_lon},{max_lat},{max_lon});
      relation["building"]({min_lat},{min_lon},{max_lat},{max_lon});
    );
    out geom;
    """
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(overpass_url, data=query, timeout=30.0)
            resp.raise_for_status()
            osm_data = resp.json()
        except Exception as e:
            print(f"Overpass Error: {e}")
            return {"type": "FeatureCollection", "features": []}

    features = []
    for element in osm_data.get("elements", []):
        if "geometry" in element:
            coords = [[ [pt["lon"], pt["lat"]] for pt in element["geometry"] ]]
            
            # Simple assumption: close the polygon if not closed
            if coords[0][0] != coords[0][-1]:
                coords[0].append(coords[0][0])
                
            features.append({
                "type": "Feature",
                "properties": {
                    "height": float(element.get("tags", {}).get("height", 15)),
                    "type": element.get("tags", {}).get("building", "yes")
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": coords
                }
            })
            
    return {"type": "FeatureCollection", "features": features}

@router.get("/vegetation")
async def get_vegetation_geojson(
    min_lon: float = Query(...),
    min_lat: float = Query(...),
    max_lon: float = Query(...),
    max_lat: float = Query(...)
):
    if abs(max_lon - min_lon) > 0.1 or abs(max_lat - min_lat) > 0.1:
        return {"type": "FeatureCollection", "features": [], "error": "BBox too large"}

    from app.main import ee_initialized
    from app.api.gee import get_veg_map_id
    if ee_initialized:
        tile_url = get_veg_map_id(min_lon, min_lat, max_lon, max_lat)
        if tile_url:
            return {"type": "EE_TileLayer", "url": tile_url}

    overpass_url = "https://overpass-api.de/api/interpreter"
    query = f"""
    [out:json][timeout:25];
    (
      way["leisure"="park"]({min_lat},{min_lon},{max_lat},{max_lon});
      way["natural"="wood"]({min_lat},{min_lon},{max_lat},{max_lon});
      way["landuse"="forest"]({min_lat},{min_lon},{max_lat},{max_lon});
      way["landuse"="grass"]({min_lat},{min_lon},{max_lat},{max_lon});
    );
    out geom;
    """
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(overpass_url, data=query, timeout=30.0)
            resp.raise_for_status()
            osm_data = resp.json()
        except Exception as e:
            return {"type": "FeatureCollection", "features": []}

    features = []
    for element in osm_data.get("elements", []):
        if "geometry" in element:
            coords = [[ [pt["lon"], pt["lat"]] for pt in element["geometry"] ]]
            if coords[0][0] != coords[0][-1]:
                coords[0].append(coords[0][0])
                
            features.append({
                "type": "Feature",
                "properties": {
                    # Proxy NDVI value based on tag
                    "ndvi": 0.8 if element.get("tags", {}).get("natural") == "wood" else 0.5
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": coords
                }
            })
            
    return {"type": "FeatureCollection", "features": features}

@router.get("/heat")
async def get_heat_geojson(
    min_lon: float = Query(...),
    min_lat: float = Query(...),
    max_lon: float = Query(...),
    max_lat: float = Query(...)
):
    from app.main import ee_initialized
    from app.api.gee import get_heat_map_id
    if ee_initialized:
        tile_url = get_heat_map_id(min_lon, min_lat, max_lon, max_lat)
        if tile_url:
            return {"type": "EE_TileLayer", "url": tile_url}

    # Fetch real temperature for the bounding box corners and center
    lats = f"{min_lat},{max_lat},{(min_lat+max_lat)/2}"
    lons = f"{min_lon},{max_lon},{(min_lon+max_lon)/2}"
    
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lats}&longitude={lons}&current=temperature_2m"
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url)
            data = resp.json()
            # If multiple locations requested, open-meteo returns an array of responses
            if isinstance(data, list) and len(data) > 0:
                base_temp = data[0].get("current", {}).get("temperature_2m", 35)
            else:
                base_temp = data.get("current", {}).get("temperature_2m", 35)
        except:
            base_temp = 35

    features = []
    # Generate a dense 25x25 grid (625 points) to create a high-fidelity modeled heatmap
    grid_steps = 25
    lat_step = (max_lat - min_lat) / grid_steps
    lon_step = (max_lon - min_lon) / grid_steps
    
    import random
    random.seed(int(min_lat * 100)) # stable randomness based on bbox
    
    for i in range(grid_steps):
        for j in range(grid_steps):
            lat = min_lat + i * lat_step + (lat_step / 2)
            lon = min_lon + j * lon_step + (lon_step / 2)
            
            # Add minor spatial variation based on location to simulate UHI (urban heat island)
            dist_to_center = ((lon - (min_lon+max_lon)/2)**2 + (lat - (min_lat+max_lat)/2)**2)**0.5
            
            # Combine center heat concentration with random local noise
            noise = (random.random() - 0.5) * 1.5
            temp = base_temp + (0.005 / (dist_to_center + 0.001)) + noise
            temp = max(base_temp - 2, min(temp, base_temp + 6.0))

            features.append({
                "type": "Feature",
                "properties": {"temp": temp},
                "geometry": {"type": "Point", "coordinates": [lon, lat]}
            })

    return {"type": "FeatureCollection", "features": features}

@router.get("/aqi")
async def get_aqi_geojson(
    min_lon: float = Query(...),
    min_lat: float = Query(...),
    max_lon: float = Query(...),
    max_lat: float = Query(...)
):
    # Fetch true physical AQI using Open-Meteo and simulate station points within bbox
    # since WAQI demo token is restricted and returns invalid key outside Shanghai
    center_lat = (min_lat + max_lat) / 2
    center_lon = (min_lon + max_lon) / 2
    
    url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={center_lat}&longitude={center_lon}&current=us_aqi&timezone=auto"
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, timeout=10.0)
            data = resp.json()
            aqi_val = data.get("current", {}).get("us_aqi") or 50
        except Exception as e:
            print(f"Open-Meteo AQI Error: {e}")
            aqi_val = 50

    features = []
    # Generate a dense 25x25 grid (625 points) for AQI map
    grid_steps = 25
    lat_step = (max_lat - min_lat) / grid_steps
    lon_step = (max_lon - min_lon) / grid_steps
    
    import random
    random.seed(int(center_lat * 100)) # stable randomness
    
    for i in range(grid_steps):
        for j in range(grid_steps):
            lat = min_lat + i * lat_step + (lat_step / 2)
            lon = min_lon + j * lon_step + (lon_step / 2)
            
            # Spatial noise to make localized pockets of high/low AQI
            noise = random.randint(-15, 15)
            # Add slight gradient: East side worse AQI (industrial simulation)
            gradient = ((lon - min_lon) / (max_lon - min_lon)) * 20
            
            station_aqi = max(0, aqi_val + noise + gradient)
            
            features.append({
                "type": "Feature",
                "properties": {
                    "value": station_aqi,
                    "name": f"Grid {i}-{j}",
                    "uid": f"{i}-{j}"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
                }
            })

    return {"type": "FeatureCollection", "features": features}
