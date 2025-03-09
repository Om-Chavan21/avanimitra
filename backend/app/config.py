import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ecommerce_db")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
