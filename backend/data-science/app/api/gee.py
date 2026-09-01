import ee
import os

# Initialize Earth Engine
def init_ee():
    try:
        # Check if service account file exists
        key_file = os.environ.get("EE_SERVICE_ACCOUNT_JSON", "service-account.json")
        if os.path.exists(key_file):
            credentials = ee.ServiceAccountCredentials('', key_file)
            ee.Initialize(credentials)
            print("Earth Engine Initialized Successfully using Service Account.")
            return True
        else:
            print("Earth Engine Initialization skipped: service-account.json not found.")
            return False
    except Exception as e:
        print(f"Failed to initialize Earth Engine: {e}")
        return False

# Function to get Earth Engine Tile URL for LST (Heat)
def get_heat_map_id(min_lon, min_lat, max_lon, max_lat):
    try:
        # Landsat 8 Surface Temperature
        dataset = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")\
            .filterBounds(ee.Geometry.BBox(min_lon, min_lat, max_lon, max_lat))\
            .filterDate('2023-01-01', '2023-12-31')\
            .sort('CLOUD_COVER')\
            .first()
            
        if not dataset:
            return None

        # Convert to Celsius: ST_B10 * 0.00341802 + 149.0 - 273.15
        st = dataset.select('ST_B10')
        temp_c = st.multiply(0.00341802).add(149.0).subtract(273.15)
        
        vis_params = {
            'min': 20,
            'max': 45,
            'palette': ['0000ff', '00ffff', 'ffff00', 'ff0000']
        }
        
        map_id = ee.Image(temp_c).getMapId(vis_params)
        return map_id['tile_fetcher'].url_format
    except Exception as e:
        print(f"EE Heat Error: {e}")
        return None

# Function to get Earth Engine Tile URL for NDVI (Vegetation)
def get_veg_map_id(min_lon, min_lat, max_lon, max_lat):
    try:
        # Sentinel-2 NDVI
        dataset = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")\
            .filterBounds(ee.Geometry.BBox(min_lon, min_lat, max_lon, max_lat))\
            .filterDate('2023-01-01', '2023-12-31')\
            .sort('CLOUDY_PIXEL_PERCENTAGE')\
            .first()
            
        if not dataset:
            return None

        ndvi = dataset.normalizedDifference(['B8', 'B4'])
        
        vis_params = {
            'min': 0,
            'max': 1,
            'palette': ['white', 'green']
        }
        
        map_id = ee.Image(ndvi).getMapId(vis_params)
        return map_id['tile_fetcher'].url_format
    except Exception as e:
        print(f"EE Veg Error: {e}")
        return None
