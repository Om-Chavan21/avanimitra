from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, products, cart, orders
import uvicorn

app = FastAPI(title="Avanimitra Organic Fruits API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="", tags=["auth"])
app.include_router(products.router, prefix="", tags=["products"])
app.include_router(cart.router, prefix="", tags=["cart"])
app.include_router(orders.router, prefix="", tags=["orders"])

# if __name__ == "__main__":
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
