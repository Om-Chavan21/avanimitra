from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import users

app = FastAPI(title="Ecommerce API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="", tags=["Users"])
