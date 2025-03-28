# backend/routers/cart.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId

from models import CartItem, CartResponse, CartItemResponse, UserInDB, ProductResponse
from database import (
    get_user_cart,
    add_to_cart,
    update_cart_item,
    clear_cart,
    products_collection,
    serialize_doc_id,
)
from routers.auth import get_current_user

router = APIRouter()


@router.get("/cart", response_model=CartResponse)
async def get_cart(current_user: UserInDB = Depends(get_current_user)):
    cart = await get_user_cart(current_user.id)

    # Get product details for each item
    items = []
    total_price = 0

    if "items" in cart and cart["items"]:
        for item in cart["items"]:
            product = await products_collection.find_one(
                {"_id": ObjectId(item["product_id"])}
            )
            if product:
                product = serialize_doc_id(product)
                # Get price from item if it has custom price
                price_per_unit = item.get("price_per_unit", product["price"])
                
                cart_item = CartItemResponse(
                    product_id=item["product_id"],
                    product=ProductResponse(**product),
                    quantity=item["quantity"],
                    selected_size=item.get("selected_size"),
                    pricePerUnit=price_per_unit,
                    unit=item.get("unit", "box")
                )
                items.append(cart_item)
                total_price += price_per_unit * item["quantity"]

    return CartResponse(items=items, total_price=total_price)


@router.post("/cart/items", response_model=CartResponse)
async def add_item_to_cart(
    item: CartItem, current_user: UserInDB = Depends(get_current_user)
):
    # Check if product exists
    product = await products_collection.find_one({"_id": ObjectId(item.product_id)})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    # Add to cart with custom options
    await add_to_cart(
        current_user.id, 
        item.product_id, 
        item.quantity,
        item.selected_size,
        item.price_per_unit,
        item.unit
    )

    # Return updated cart
    return await get_cart(current_user)


@router.put("/cart/items/{product_id}", response_model=CartResponse)
async def update_item_in_cart(
    product_id: str, item: CartItem, current_user: UserInDB = Depends(get_current_user)
):
    # Check if product exists
    product = await products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    # Update cart item with custom options
    await update_cart_item(
        current_user.id, 
        product_id, 
        item.quantity,
        item.selected_size,
        item.price_per_unit,
        item.unit
    )

    # Return updated cart
    return await get_cart(current_user)


@router.delete("/cart/items/{product_id}", response_model=CartResponse)
async def remove_item_from_cart(
    product_id: str, current_user: UserInDB = Depends(get_current_user)
):
    # Update quantity to 0 to remove item
    await update_cart_item(current_user.id, product_id, 0)

    # Return updated cart
    return await get_cart(current_user)


@router.delete("/cart", response_model=CartResponse)
async def clear_user_cart(current_user: UserInDB = Depends(get_current_user)):
    # Clear cart
    await clear_cart(current_user.id)

    # Return empty cart
    return CartResponse(items=[], total_price=0)