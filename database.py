from motor.motor_asyncio import AsyncIOMotorClient
import os
from typing import Optional

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'nanacafe')

client: Optional[AsyncIOMotorClient] = None
database = None

async def connect_to_mongo():
    """Create database connection"""
    global client, database
    client = AsyncIOMotorClient(MONGO_URL)
    database = client[DB_NAME]
    print(f"Connected to MongoDB database: {DB_NAME}")

async def close_mongo_connection():
    """Close database connection"""
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB")

def get_database():
    """Get database instance"""
    return database

# Collection names
COLLECTIONS = {
    'users': 'users',
    'products': 'products', 
    'orders': 'orders',
    'events': 'events',
    'settings': 'settings'
}
