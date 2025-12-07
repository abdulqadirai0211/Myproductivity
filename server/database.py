from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client = None
database = None


async def connect_to_mongo():
    """Connect to MongoDB"""
    global client, database
    try:
        client = AsyncIOMotorClient(settings.mongodb_uri)
        database = client.myassistant
        # Test connection
        await client.admin.command('ping')
        print("✅ MongoDB Connected successfully")
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")


def get_database():
    """Get database instance"""
    return database
