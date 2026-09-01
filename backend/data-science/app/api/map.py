from fastapi import APIRouter, Query
import httpx
import json
import asyncio
import random

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

    # Generate 676 organic scattered points
    num_points = 676
    random.seed(int(min_lat * 100)) # stable randomness based on bbox
    
    points = []
    for _ in range(num_points):
        lat = min_lat + random.random() * (max_lat - min_lat)
        lon = min_lon + random.random() * (max_lon - min_lon)
        points.append((lat, lon))
        
    chunk_size = 90
    chunks = [points[i:i + chunk_size] for i in range(0, len(points), chunk_size)]
    
    async def fetch_chunk(client, chunk):
        lats = ",".join([f"{p[0]:.4f}" for p in chunk])
        lons = ",".join([f"{p[1]:.4f}" for p in chunk])
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lats}&longitude={lons}&current=temperature_2m"
        try:
            resp = await client.get(url, timeout=10.0)
            data = resp.json()
            if isinstance(data, list):
                return [d.get("current", {}).get("temperature_2m", 35.0) for d in data]
            else:
                return [data.get("current", {}).get("temperature_2m", 35.0)] * len(chunk)
        except Exception:
            return [35.0] * len(chunk)

    async with httpx.AsyncClient() as client:
        tasks = [fetch_chunk(client, chunk) for chunk in chunks]
        results = await asyncio.gather(*tasks)
        
    # Flatten results
    temps = [temp for chunk_result in results for temp in chunk_result]
    
    features = []
    for i, (lat, lon) in enumerate(points):
        temp = temps[i] if i < len(temps) and temps[i] is not None else 35.0
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
    # Generate 676 organic scattered points
    num_points = 676
    random.seed(int(min_lat * 100))
    
    points = []
    for _ in range(num_points):
        lat = min_lat + random.random() * (max_lat - min_lat)
        lon = min_lon + random.random() * (max_lon - min_lon)
        points.append((lat, lon))
        
    chunk_size = 90
    chunks = [points[i:i + chunk_size] for i in range(0, len(points), chunk_size)]
    
    async def fetch_chunk(client, chunk):
        lats = ",".join([f"{p[0]:.4f}" for p in chunk])
        lons = ",".join([f"{p[1]:.4f}" for p in chunk])
        url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lats}&longitude={lons}&current=us_aqi&timezone=auto"
        try:
            resp = await client.get(url, timeout=10.0)
            data = resp.json()
            if isinstance(data, list):
                return [d.get("current", {}).get("us_aqi", 50) for d in data]
            else:
                return [data.get("current", {}).get("us_aqi", 50)] * len(chunk)
        except Exception:
            return [50] * len(chunk)

    async with httpx.AsyncClient() as client:
        tasks = [fetch_chunk(client, chunk) for chunk in chunks]
        results = await asyncio.gather(*tasks)
        
    # Flatten results
    aqis = [aqi for chunk_result in results for aqi in chunk_result]
    
    features = []
    for i, (lat, lon) in enumerate(points):
        aqi_val = aqis[i] if i < len(aqis) and aqis[i] is not None else 50
        features.append({
            "type": "Feature",
            "properties": {
                "value": aqi_val,
                "name": "Live Station",
                "uid": str(random.randint(1000, 9999))
            },
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            }
        })

    return {"type": "FeatureCollection", "features": features}
