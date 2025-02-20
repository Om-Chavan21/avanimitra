from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_DETAILS = os.getenv("MONGODB_CONNECTION_URI")  # Update with your MongoDB URI
client = AsyncIOMotorClient(MONGO_DETAILS)
database = client[os.getenv("DB_NAME")]  # Change to your database name
customer_collection = database[
    os.getenv("CUSTOMERS_COLLECTION_NAME")
]  # Retrieve the collection


async def get_customer_by_phone_number(phone_number: str):
    return await customer_collection.find_one({"phone_number": phone_number})
