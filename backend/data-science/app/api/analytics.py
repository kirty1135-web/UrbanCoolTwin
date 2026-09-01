from fastapi import APIRouter
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class AttributionRequest(BaseModel):
    lat: float
    lon: float
    temp: float
    aqi: int
    ndvi: float
    building_density: float

@router.post("/attribution")
async def get_heat_attribution(req: AttributionRequest):
    api_key = os.environ.get("GEMINI_API_KEY")
    # Procedurally calculate structured data based on inputs
    expected_temp = 32.0 + (req.temp * 0.1)  # Rough baseline
    anomaly = req.temp - expected_temp
    
    # Calculate attribution weights
    base_weather = 40
    veg_weight = max(0, 30 - (req.ndvi * 60)) # low ndvi = high weight
    build_weight = req.building_density * 0.4
    imp_weight = build_weight * 0.4
    aqi_weight = req.aqi * 0.05
    other_weight = 3
    
    total = base_weather + veg_weight + build_weight + imp_weight + aqi_weight + other_weight
    
    pct_weather = int((base_weather / total) * 100)
    pct_veg = int((veg_weight / total) * 100)
    pct_build = int((build_weight / total) * 100)
    pct_imp = int((imp_weight / total) * 100)
    pct_aqi = int((aqi_weight / total) * 100)
    pct_other = 100 - (pct_weather + pct_veg + pct_build + pct_imp + pct_aqi)
    
    primary_factor = "Building Density" if pct_build > pct_veg else "Vegetation"

    response_data = {
        "surface_temp": round(req.temp, 1),
        "expected_temp": round(expected_temp, 1),
        "anomaly": round(anomaly, 1),
        "current_aqi": req.aqi,
        "attribution": {
            "season_weather": pct_weather,
            "vegetation": pct_veg,
            "building_density": pct_build,
            "impervious_surface": pct_imp,
            "aqi": pct_aqi,
            "other": pct_other,
            "primary_factor": primary_factor
        },
        "explanation": ""
    }

    # If no API key is provided, return a mock intelligent response
    if not api_key:
        response_data["explanation"] = f"At {req.lat:.4f}, {req.lon:.4f}, the temperature is elevated ({req.temp:.1f}°C). Given the extremely low NDVI ({req.ndvi:.2f}) and high building density ({req.building_density}%), this is highly indicative of localized Urban Heat Island (UHI) effects driven by lack of vegetative cooling and high thermal mass. The AQI of {req.aqi} also suggests poor air circulation in this dense built environment."
        return response_data
        
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are GeoNexus, an advanced Urban Environmental Intelligence AI.
        Analyze the following spatial data point and explain WHY the area might be experiencing its current temperature.
        Specifically, determine how much of the heat is attributable to localized Urban Heat Island factors (buildings/vegetation) versus general weather/pollution.
        
        Location: Latitude {req.lat}, Longitude {req.lon} (Bhubaneswar, India)
        Current Local Temperature: {req.temp}°C
        AQI (Air Quality Index): {req.aqi}
        NDVI (Vegetation Index 0 to 1): {req.ndvi}
        Building Density: {req.building_density}%
        
        Provide a concise, 2-3 sentence, highly analytical and professional explanation. Do not use formatting like bolding.
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        response_data["explanation"] = text
        return response_data
    except Exception as e:
        response_data["explanation"] = f"Failed to connect to AI engine: {str(e)}"
        return response_data
