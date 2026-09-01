from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="UrbanCool Twin - Data Science Service",
    description="Internal FastAPI service for geospatial processing and analytics",
    version="1.0.0"
)

from app.api.gee import init_ee
ee_initialized = init_ee()

# In production this would be restricted to the internal network/gateway
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "urbancool-data-science"}

# Import and include routers
from app.api.aqi import router as aqi_router
from app.api.map import router as map_router
from app.api.forecast import router as forecast_router
from app.api.explorer import router as explorer_router
from app.api.analytics import router as analytics_router

app.include_router(aqi_router, prefix="/internal/v1/aqi")
app.include_router(map_router, prefix="/internal/v1/map")
app.include_router(forecast_router, prefix="/internal/v1/forecast")
app.include_router(explorer_router, prefix="/internal/v1/explorer")
app.include_router(analytics_router, prefix="/internal/v1/analytics")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
