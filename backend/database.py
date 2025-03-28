# backend/database.py
import motor.motor_asyncio
from os import environ
from dotenv import load_dotenv
from bson import ObjectId
from datetime import datetime

load_dotenv()

MONGODB_URI = environ.get("MONGODB_URI")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
database = client.ecommerce

users_collection = database.users
products_collection = database.products
carts_collection = database.carts
orders_collection = database.orders
payment_settings_collection = database.payment_settings


# Helper functions to convert between MongoDB ObjectId and string
def get_object_id(id_str):
    if isinstance(id_str, str):
        return ObjectId(id_str)
    return id_str


def serialize_doc_id(doc):
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


def serialize_list(docs):
    return [serialize_doc_id(doc) for doc in docs]


# Cart operations
async def get_user_cart(user_id):
    cart = await carts_collection.find_one({"user_id": user_id})
    if not cart:
        # Create empty cart if it doesn't exist
        cart = {"user_id": user_id, "items": []}
        await carts_collection.insert_one(cart)
    return serialize_doc_id(cart)


async def add_to_cart(user_id, product_id, quantity=1, selected_size=None, price_per_unit=None, unit="box"):
    cart = await get_user_cart(user_id)

    # Check if item with same product_id and selected_size already exists in cart
    found = False
    if "items" in cart:
        for item in cart["items"]:
            if (item["product_id"] == product_id and
                item.get("selected_size") == selected_size):
                item["quantity"] += quantity
                # Keep existing custom price if it exists
                if price_per_unit is not None:
                    item["price_per_unit"] = price_per_unit
                if unit:
                    item["unit"] = unit
                found = True
                break

    # Add new item if not found
    if not found:
        if "items" not in cart:
            cart["items"] = []
        
        new_item = {"product_id": product_id, "quantity": quantity}
        if selected_size:
            new_item["selected_size"] = selected_size
        if price_per_unit is not None:
            new_item["price_per_unit"] = price_per_unit
        if unit:
            new_item["unit"] = unit
            
        cart["items"].append(new_item)

    # Update cart in database
    await carts_collection.update_one(
        {"user_id": user_id}, {"$set": {"items": cart["items"]}}
    )

    return cart


async def update_cart_item(user_id, product_id, quantity, selected_size=None, price_per_unit=None, unit=None):
    if quantity <= 0:
        # If selected_size is provided, only remove the specific item with that size
        if selected_size:
            await carts_collection.update_one(
                {"user_id": user_id}, 
                {"$pull": {"items": {"product_id": product_id, "selected_size": selected_size}}}
            )
        else:
            # Remove all items with this product_id
            await carts_collection.update_one(
                {"user_id": user_id}, 
                {"$pull": {"items": {"product_id": product_id}}}
            )
    else:
        # Update quantity and other fields if provided
        update_fields = {"items.$.quantity": quantity}
        
        if price_per_unit is not None:
            update_fields["items.$.price_per_unit"] = price_per_unit
            
        if unit:
            update_fields["items.$.unit"] = unit
            
        # Find and update the specific item (by product_id and selected_size if provided)
        match_condition = {"user_id": user_id}
        
        if selected_size:
            match_condition["items"] = {
                "$elemMatch": {
                    "product_id": product_id,
                    "selected_size": selected_size
                }
            }
            await carts_collection.update_one(
                match_condition,
                {"$set": update_fields}
            )
        else:
            # Update by product_id only
            await carts_collection.update_one(
                {"user_id": user_id, "items.product_id": product_id},
                {"$set": update_fields}
            )

    return await get_user_cart(user_id)


async def clear_cart(user_id):
    await carts_collection.update_one({"user_id": user_id}, {"$set": {"items": []}})


# Payment settings operations
async def get_payment_settings():
    settings = await payment_settings_collection.find_one({})
    if not settings:
        # Create default settings if not exist
        default_settings = {
            "bank_name": "IDBI Bank Limited",
            "account_holder": "Atharva Datar",
            "account_number": "0490104000173407",
            "ifsc_code": "IBKL0000490",
            "upi_id": "acdatar-3@okhdfcbank",
            "gpay_number": "9764814452"
        }
        await payment_settings_collection.insert_one(default_settings)
        return default_settings
    return serialize_doc_id(settings)


async def update_payment_settings(settings_data):
    settings = await payment_settings_collection.find_one({})
    if settings:
        await payment_settings_collection.update_one({}, {"$set": settings_data})
    else:
        await payment_settings_collection.insert_one(settings_data)
    return await get_payment_settings()