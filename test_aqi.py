import httpx
import asyncio

async def test():
    lats = ",".join([str(20.2 + i*0.001) for i in range(100)])
    lons = ",".join([str(85.8 + i*0.001) for i in range(100)])
    url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lats}&longitude={lons}&current=us_aqi"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        print("AQI Status:", resp.status_code)
        if resp.status_code == 200:
            data = resp.json()
            print("Length of data:", len(data) if isinstance(data, list) else 1)

asyncio.run(test())
