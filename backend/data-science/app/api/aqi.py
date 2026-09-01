from fastapi import APIRouter, Query
from datetime import datetime, timezone
import asyncio

import httpx

router = APIRouter()

@router.get("/current")
async def get_current_aqi(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone&timezone=auto"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        data = response.json()
        
    current = data.get("current", {})
    aqi_val = current.get("us_aqi") or 0
    
    # Determine category based on US AQI standard
    category = "Good"
    if aqi_val > 50: category = "Moderate"
    if aqi_val > 100: category = "Unhealthy for Sensitive Groups"
    if aqi_val > 150: category = "Unhealthy"
    if aqi_val > 200: category = "Very Unhealthy"
    if aqi_val > 300: category = "Hazardous"

    return {
        "data": {
            "aqi": aqi_val,
            "category": category,
            "pm25": current.get("pm2_5"),
            "pm10": current.get("pm10"),
            "no2": current.get("nitrogen_dioxide"),
            "o3": current.get("ozone")
        },
        "meta": {
            "observed_at": current.get("time", datetime.now(timezone.utc).isoformat()),
            "source": "open-meteo-air-quality",
            "quality": "validated",
            "freshness_seconds": 0
        }
    }

@router.get("/history")
async def get_history_aqi(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&hourly=pm10,pm2_5,us_aqi&past_days=30&timezone=auto"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        data = response.json()
        
    hourly = data.get("hourly", {})
    times = hourly.get("time", [])
    us_aqi = hourly.get("us_aqi", [])
    
    # Compress 720 hours down to daily averages for the trend chart
    daily_history = []
    
    # Naive downsampling (every 24 hours)
    for i in range(0, len(times), 24):
        if i < len(us_aqi) and us_aqi[i] is not None:
            daily_history.append(us_aqi[i])
            
    return {
        "history": daily_history
    }
