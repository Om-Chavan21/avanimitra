from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from models import ProductCreate, ProductResponse, ProductUpdate, UserInDB
from database import products_collection, serialize_doc_id, serialize_list
from routers.auth import get_current_user

router = APIRouter()


@router.get("/products", response_model=List[ProductResponse])
async def get_all_products(
    category: Optional[str] = None, status: Optional[str] = None
):
    # Filter products by category and status if provided
    filter_query = {}
    if category:
        filter_query["category"] = category
    if status:
        filter_query["status"] = status
    else:
        # By default, only show active products
        filter_query["status"] = "active"

    products = await products_collection.find(filter_query).to_list(1000)
    return serialize_list(products)


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    product = await products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    return serialize_doc_id(product)


@router.get("/admin/products", response_model=List[ProductResponse])
async def get_admin_products(current_user: UserInDB = Depends(get_current_user)):
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )
    # Retrieve all products, regardless of status
    cursor = products_collection.find({})
    products = await cursor.to_list(length=100)
    # Serialize the MongoDB documents
    serialized_products = [serialize_doc_id(product) for product in products]
    return serialized_products


@router.post("/admin/products", response_model=ProductResponse)
async def create_product(
    product: ProductCreate, current_user: UserInDB = Depends(get_current_user)
):
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )
    product_dict = product.dict()
    result = await products_collection.insert_one(product_dict)
    new_product = await products_collection.find_one({"_id": result.inserted_id})
    return serialize_doc_id(new_product)


@router.put("/admin/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product: ProductUpdate,
    current_user: UserInDB = Depends(get_current_user),
):
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )
    # Check if product exists
    existing_product = await products_collection.find_one({"_id": ObjectId(product_id)})
    if not existing_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    # Update product
    update_data = {k: v for k, v in product.dict().items() if v is not None}
    if update_data:
        await products_collection.update_one(
            {"_id": ObjectId(product_id)}, {"$set": update_data}
        )
    updated_product = await products_collection.find_one({"_id": ObjectId(product_id)})
    return serialize_doc_id(updated_product)


@router.delete("/admin/products/{product_id}", response_model=dict)
async def delete_product(
    product_id: str, current_user: UserInDB = Depends(get_current_user)
):
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )
    # Check if product exists
    existing_product = await products_collection.find_one({"_id": ObjectId(product_id)})
    if not existing_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    # Delete product
    await products_collection.delete_one({"_id": ObjectId(product_id)})
    return {"message": "Product deleted successfully"}


# Seed some products (for testing)
@router.post("/seed-products", include_in_schema=False)
async def seed_products():
    # Check if products already exist
    count = await products_collection.count_documents({})
    if count > 0:
        return {"message": f"{count} products already exist"}
    products = [
        {
            "name": "Organic Apples",
            "description": "Fresh, juicy organic apples sourced directly from our farms",
            "price": 150.0,  # ₹150 per kg
            "image_url": "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb",
            "category": "apples",
            "stock_quantity": 100,
            "status": "active",
        },
        {
            "name": "Organic Bananas",
            "description": "Sweet and nutritious organic bananas",
            "price": 80.0,  # ₹80 per dozen
            "image_url": "https://images.unsplash.com/photo-1587132137056-bfbf0166836e",
            "category": "bananas",
            "stock_quantity": 150,
            "status": "active",
        },
        {
            "name": "Organic Oranges",
            "description": "Citrusy and refreshing organic oranges",
            "price": 120.0,  # ₹120 per kg
            "image_url": "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b",
            "category": "citrus",
            "stock_quantity": 80,
            "status": "active",
        },
        {
            "name": "Organic Mangoes",
            "description": "Sweet and flavorful organic mangoes",
            "price": 200.0,  # ₹200 per kg
            "image_url": "https://images.unsplash.com/photo-1605027990121-cbae9e0642df",
            "category": "mangoes",
            "stock_quantity": 50,
            "status": "active",
        },
        {
            "name": "Organic Strawberries",
            "description": "Juicy and fragrant organic strawberries",
            "price": 250.0,  # ₹250 per box
            "image_url": "https://images.unsplash.com/photo-1518635017498-87f514b751ba",
            "category": "berries",
            "stock_quantity": 30,
            "status": "active",
        },
    ]
    result = await products_collection.insert_many(products)
    return {"message": f"{len(result.inserted_ids)} products created successfully"}
