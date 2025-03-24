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


async def add_to_cart(user_id, product_id, quantity=1):
    cart = await get_user_cart(user_id)

    # Check if item already exists in cart
    found = False
    if "items" in cart:
        for item in cart["items"]:
            if item["product_id"] == product_id:
                item["quantity"] += quantity
                found = True
                break

    # Add new item if not found
    if not found:
        if "items" not in cart:
            cart["items"] = []
        cart["items"].append({"product_id": product_id, "quantity": quantity})

    # Update cart in database
    await carts_collection.update_one(
        {"user_id": user_id}, {"$set": {"items": cart["items"]}}
    )

    return cart


async def update_cart_item(user_id, product_id, quantity):
    if quantity <= 0:
        # Remove item if quantity is 0 or negative
        await carts_collection.update_one(
            {"user_id": user_id}, {"$pull": {"items": {"product_id": product_id}}}
        )
    else:
        # Update quantity
        await carts_collection.update_one(
            {"user_id": user_id, "items.product_id": product_id},
            {"$set": {"items.$.quantity": quantity}},
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
            "bank_name": "State Bank of India",
            "account_holder": "Avani Mitra Organics",
            "account_number": "1234567890",
            "ifsc_code": "SBIN0001234",
            "upi_id": "avanimitra@upi",
            "gpay_number": "9876543210"
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