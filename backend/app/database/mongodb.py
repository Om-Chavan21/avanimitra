import motor.motor_asyncio
from app.config import MONGODB_URL, DATABASE_NAME

client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Collections
users = db.users
