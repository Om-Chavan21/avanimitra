import motor.motor_asyncio
from os import environ
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = environ.get("MONGODB_URI")
DATABASE_NAME = environ.get("DATABASE_NAME")

if not MONGODB_URI or not DATABASE_NAME:
    raise ValueError("MONGODB_URI and DATABASE_NAME must be set in the environment")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
database = client[DATABASE_NAME]

users_collection = database["users"]
