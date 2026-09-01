from fastapi import APIRouter, Query, HTTPException
import httpx

router = APIRouter()

@router.get("/")
async def get_forecast(
    lat: float = Query(...),
    lon: float = Query(...)
):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,precipitation_probability_max,wind_speed_10m_max&timezone=auto"
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail="Open-Meteo API unreachable")
            
    daily = data.get("daily", {})
    
    return {
        "dates": daily.get("time", []),
        "temp_max": daily.get("temperature_2m_max", []),
        "precip_prob": daily.get("precipitation_probability_max", []),
        "wind_speed": daily.get("wind_speed_10m_max", [])
    }
