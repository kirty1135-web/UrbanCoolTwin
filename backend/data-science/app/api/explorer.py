from fastapi import APIRouter, Query
import httpx
import asyncio
import random

router = APIRouter()

@router.get("/points")
async def get_explorer_points(
    min_lon: float = Query(85.78),
    min_lat: float = Query(20.25),
    max_lon: float = Query(85.88),
    max_lat: float = Query(20.34)
):
    num_points = 500
    random.seed(int(min_lat * 100))
    
    points = []
    for _ in range(num_points):
        lat = min_lat + random.random() * (max_lat - min_lat)
        lon = min_lon + random.random() * (max_lon - min_lon)
        points.append((lat, lon))
        
    chunk_size = 90
    chunks = [points[i:i + chunk_size] for i in range(0, len(points), chunk_size)]
    
    async def fetch_weather_chunk(client, chunk):
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
            
    async def fetch_aqi_chunk(client, chunk):
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
        # Fetch weather for all chunks
        weather_tasks = [fetch_weather_chunk(client, chunk) for chunk in chunks]
        # Fetch aqi for all chunks
        aqi_tasks = [fetch_aqi_chunk(client, chunk) for chunk in chunks]
        
        all_tasks = weather_tasks + aqi_tasks
        results = await asyncio.gather(*all_tasks)
        
        weather_results = results[:len(chunks)]
        aqi_results = results[len(chunks):]
        
    temps = [temp for chunk_result in weather_results for temp in chunk_result]
    aqis = [aqi for chunk_result in aqi_results for aqi in chunk_result]
    
    features = []
    for i, (lat, lon) in enumerate(points):
        temp = temps[i] if i < len(temps) and temps[i] is not None else 35.0
        aqi = aqis[i] if i < len(aqis) and aqis[i] is not None else 50
        
        # Procedural NDVI based on coordinate noise
        ndvi = 0.2 + (random.random() * 0.4)
        
        features.append({
            "type": "Feature",
            "properties": {
                "temp": temp,
                "aqi": aqi,
                "ndvi": round(ndvi, 2),
                "uid": f"pt-{random.randint(10000, 99999)}"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            }
        })

    return {"type": "FeatureCollection", "features": features}
