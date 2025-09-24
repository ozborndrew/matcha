from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
from pathlib import Path

# Import database
from database import connect_to_mongo, close_mongo_connection

# Import routes
from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.orders import router as orders_router
from routes.events import router as events_router
from routes.settings import router as settings_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Nana Cafe API Server...")
    await connect_to_mongo()
    
    # Initialize default data
    await initialize_default_data()
    
    yield
    
    # Shutdown
    logger.info("Shutting down Nana Cafe API Server...")
    await close_mongo_connection()

# Create the main app
app = FastAPI(
    title="Nana Cafe API",
    description="Complete API for Nana Cafe - Coffee & Pastries Delivery/Pickup Service",
    version="1.0.0",
    lifespan=lifespan
)

# Create API router with prefix
api_router = APIRouter(prefix="/api")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
api_router.include_router(auth_router)
api_router.include_router(products_router)
api_router.include_router(orders_router)
api_router.include_router(events_router)
api_router.include_router(settings_router)

# Add root endpoint
@api_router.get("/")
async def root():
    return {
        "message": "Welcome to Nana Cafe API",
        "version": "1.0.0",
        "status": "running"
    }

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Nana Cafe API"
    }

# Include the API router
app.include_router(api_router)

async def initialize_default_data():
    """Initialize default data for the application"""
    try:
        from database import get_database, COLLECTIONS
        from models.product import Product, ProductCategory
        from models.event import Event, EventStatus
        from models.settings import CafeSettings
        from datetime import date, timedelta
        
        db = get_database()
        
        # Initialize default products if none exist
        product_count = await db[COLLECTIONS['products']].count_documents({})
        if product_count == 0:
            logger.info("Initializing default products...")
            
            default_products = [
                Product(
                    name="Espresso",
                    description="Strong and bold coffee shot",
                    price=3.50,
                    category=ProductCategory.COFFEE,
                    image_url="https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop",
                    stock_quantity=100
                ),
                Product(
                    name="Cappuccino", 
                    description="Espresso with steamed milk foam",
                    price=4.50,
                    category=ProductCategory.COFFEE,
                    image_url="https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop",
                    stock_quantity=100
                ),
                Product(
                    name="Croissant",
                    description="Buttery, flaky pastry",
                    price=3.00,
                    category=ProductCategory.PASTRY,
                    image_url="https://images.unsplash.com/photo-1555507036-ab794f4aaec3?w=400&h=300&fit=crop",
                    stock_quantity=50
                ),
                Product(
                    name="Latte Art Special",
                    description="Beautifully crafted latte with artistic foam",
                    price=5.00,
                    category=ProductCategory.COFFEE,
                    image_url="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop",
                    stock_quantity=100
                )
            ]
            
            for product in default_products:
                await db[COLLECTIONS['products']].insert_one(product.dict())
            
            logger.info(f"Initialized {len(default_products)} default products")
        
        # Initialize default events if none exist
        event_count = await db[COLLECTIONS['events']].count_documents({})
        if event_count == 0:
            logger.info("Initializing default events...")
            
            today = date.today()
            default_events = [
                Event(
                    title="Downtown Pop-Up",
                    description="Join us at our downtown location for a special weekend coffee experience",
                    event_date=today + timedelta(days=7),
                    start_time="9:00 AM",
                    end_time="5:00 PM",
                    location="Downtown Plaza, Main Street",
                    is_featured=True,
                    status=EventStatus.UPCOMING
                ),
                Event(
                    title="Art District Event",
                    description="Coffee and art combine at our art district pop-up featuring local artists",
                    event_date=today + timedelta(days=14),
                    start_time="10:00 AM", 
                    end_time="6:00 PM",
                    location="Art District Gallery, Creative Avenue",
                    is_featured=True,
                    status=EventStatus.UPCOMING
                ),
                Event(
                    title="Holiday Special",
                    description="Festive drinks and treats at our holiday-themed pop-up event",
                    event_date=today + timedelta(days=21),
                    start_time="8:00 AM",
                    end_time="7:00 PM", 
                    location="Community Center, Festival Park",
                    is_featured=False,
                    status=EventStatus.UPCOMING
                )
            ]
            
            for event in default_events:
                await db[COLLECTIONS['events']].insert_one(event.dict())
            
            logger.info(f"Initialized {len(default_events)} default events")
        
        # Initialize default settings if none exist
        settings_count = await db[COLLECTIONS['settings']].count_documents({})
        if settings_count == 0:
            logger.info("Initializing default settings...")
            
            default_settings = CafeSettings(
                contact_email="admin@nanacafe.com",
                contact_phone="+63 912 345 6789",
                address="Pop-up locations across the city"
            )
            
            await db[COLLECTIONS['settings']].insert_one(default_settings.dict())
            logger.info("Initialized default settings")
        
        logger.info("Default data initialization completed")
        
    except Exception as e:
        logger.error(f"Error initializing default data: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
