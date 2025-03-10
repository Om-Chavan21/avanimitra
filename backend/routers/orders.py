from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from models import (
    OrderCreate,
    OrderResponse,
    OrderUpdate,
    OrderStatus,
    PaymentStatus,
    UserInDB,
    ProductResponse,
    OrderItemResponse,
    AdminOrderCreate,
    OrderItem,
)
from database import (
    orders_collection,
    products_collection,
    get_user_cart,
    clear_cart,
    serialize_doc_id,
    serialize_list,
    users_collection,
)
from routers.auth import get_current_user

router = APIRouter()


@router.post("/orders", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate, current_user: UserInDB = Depends(get_current_user)
):
    # Create new order
    order = {
        "user_id": current_user.id,
        "order_date": datetime.utcnow(),
        "delivery_address": order_data.delivery_address,
        "receiver_phone": order_data.receiver_phone,
        "items": [],
        "total_amount": 0,
        "order_status": OrderStatus.PENDING,
        "payment_status": PaymentStatus.PENDING,
    }

    # Process order items
    items = []
    total_amount = 0

    for item in order_data.items:
        # Get product details
        product = await products_collection.find_one({"_id": ObjectId(item.product_id)})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item.product_id} not found",
            )

        product = serialize_doc_id(product)

        # Add item to order
        order_item = {
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price_at_purchase": product["price"],
        }

        items.append(order_item)
        total_amount += product["price"] * item.quantity

    order["items"] = items
    order["total_amount"] = total_amount

    # Save order to database
    result = await orders_collection.insert_one(order)
    order["id"] = str(result.inserted_id)

    # Clear user's cart
    await clear_cart(current_user.id)

    # Format response
    order_response = await get_order_with_products(order["id"])

    return order_response


@router.get("/orders", response_model=List[OrderResponse])
async def get_user_orders(current_user: UserInDB = Depends(get_current_user)):
    orders = (
        await orders_collection.find({"user_id": current_user.id})
        .sort("order_date", -1)
        .to_list(1000)
    )
    orders = serialize_list(orders)

    # Format response with product details
    order_responses = []
    for order in orders:
        order_with_products = await format_order_response(order)
        order_responses.append(order_with_products)

    return order_responses


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, current_user: UserInDB = Depends(get_current_user)):
    # Get order
    order = await orders_collection.find_one(
        {"_id": ObjectId(order_id), "user_id": current_user.id}
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )

    # Format response with product details
    order_response = await format_order_response(serialize_doc_id(order))

    return order_response


@router.post("/orders/{order_id}/repeat", response_model=OrderResponse)
async def repeat_order(
    order_id: str, current_user: UserInDB = Depends(get_current_user)
):
    # Get original order
    original_order = await orders_collection.find_one(
        {"_id": ObjectId(order_id), "user_id": current_user.id}
    )

    if not original_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )

    # Create new order based on the original
    new_order = {
        "user_id": current_user.id,
        "order_date": datetime.utcnow(),
        "delivery_address": original_order["delivery_address"],
        "receiver_phone": original_order["receiver_phone"],
        "items": original_order["items"],
        "total_amount": original_order["total_amount"],
        "order_status": OrderStatus.PENDING,
        "payment_status": PaymentStatus.PENDING,
    }

    # Save new order to database
    result = await orders_collection.insert_one(new_order)
    new_order["id"] = str(result.inserted_id)

    # Format response
    order_response = await format_order_response(new_order)

    return order_response


# Admin routes


@router.get("/admin/orders", response_model=List[OrderResponse])
async def get_all_orders(
    status: Optional[str] = None, current_user: UserInDB = Depends(get_current_user)
):
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )

    # Filter by status if provided
    filter_query = {}
    if status:
        if status == "active":
            filter_query["order_status"] = {
                "$in": [
                    OrderStatus.PENDING,
                    OrderStatus.PROCESSING,
                    OrderStatus.SHIPPED,
                ]
            }
        elif status == "past":
            filter_query["order_status"] = {
                "$in": [OrderStatus.DELIVERED, OrderStatus.CANCELLED]
            }

    orders = (
        await orders_collection.find(filter_query).sort("order_date", -1).to_list(1000)
    )
    orders = serialize_list(orders)

    # Format response with product details
    order_responses = []
    for order in orders:
        order_with_products = await format_order_response(order)
        order_responses.append(order_with_products)

    return order_responses


@router.put("/admin/orders/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: str,
    order_update: OrderUpdate,
    current_user: UserInDB = Depends(get_current_user),
):
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )

    # Get order
    order = await orders_collection.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )

    # Prepare update data
    update_data = {}
    if order_update.order_status is not None:
        update_data["order_status"] = order_update.order_status

    if order_update.payment_status is not None:
        update_data["payment_status"] = order_update.payment_status

    if order_update.delivery_address is not None:
        update_data["delivery_address"] = order_update.delivery_address

    if order_update.receiver_phone is not None:
        update_data["receiver_phone"] = order_update.receiver_phone

    # Handle items update if provided
    if order_update.items is not None:
        items_data = []
        total_amount = 0

        # Process each item
        for item in order_update.items:
            # Verify the product exists
            product = await products_collection.find_one(
                {"_id": ObjectId(item.product_id)}
            )
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with id {item.product_id} not found",
                )

            # Add item to order
            order_item = {
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price_at_purchase": item.price_at_purchase,
            }

            items_data.append(order_item)
            total_amount += item.price_at_purchase * item.quantity

        update_data["items"] = items_data
        update_data["total_amount"] = total_amount

    if update_data:
        await orders_collection.update_one(
            {"_id": ObjectId(order_id)}, {"$set": update_data}
        )

    # Get updated order
    updated_order = await orders_collection.find_one({"_id": ObjectId(order_id)})

    # Format response
    order_response = await format_order_response(serialize_doc_id(updated_order))

    return order_response


@router.delete("/admin/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    order_id: str, current_user: UserInDB = Depends(get_current_user)
):
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )

    # Check if order exists
    order = await orders_collection.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )

    # Delete order
    await orders_collection.delete_one({"_id": ObjectId(order_id)})


@router.post("/admin/custom-orders", response_model=OrderResponse)
async def create_custom_order(
    order_data: AdminOrderCreate, current_user: UserInDB = Depends(get_current_user)
):
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )

    # Check if user exists
    user = await users_collection.find_one({"_id": ObjectId(order_data.user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Create new order
    order = {
        "user_id": order_data.user_id,
        "order_date": datetime.utcnow(),
        "delivery_address": order_data.delivery_address,
        "receiver_phone": order_data.receiver_phone,
        "items": order_data.items,
        "total_amount": sum(
            item.price_at_purchase * item.quantity for item in order_data.items
        ),
        "order_status": order_data.order_status,
        "payment_status": order_data.payment_status,
    }

    # Save order to database
    result = await orders_collection.insert_one(order)
    order["id"] = str(result.inserted_id)

    # Format response
    order_response = await format_order_response(order)

    return order_response


# Helper functions


async def get_order_with_products(order_id):
    order = await orders_collection.find_one({"_id": ObjectId(order_id)})
    if not order:
        return None

    return await format_order_response(serialize_doc_id(order))


async def format_order_response(order):
    # Get product details for each item
    items_with_products = []

    for item in order["items"]:
        product = await products_collection.find_one(
            {"_id": ObjectId(item["product_id"])}
        )
        if product:
            product = serialize_doc_id(product)
            item_with_product = OrderItemResponse(
                product_id=item["product_id"],
                quantity=item["quantity"],
                price_at_purchase=item["price_at_purchase"],
                product=ProductResponse(**product),
            )
            items_with_products.append(item_with_product)

    # Create order response
    order_response = OrderResponse(
        id=order["id"],
        user_id=order["user_id"],
        order_date=order["order_date"],
        delivery_address=order["delivery_address"],
        receiver_phone=order["receiver_phone"],
        items=items_with_products,
        total_amount=order["total_amount"],
        order_status=order["order_status"],
        payment_status=order["payment_status"],
    )

    return order_response
