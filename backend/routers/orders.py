from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, File, UploadFile, Form
from typing import List, Optional, Dict, Any
from bson import ObjectId
from datetime import datetime, timedelta
import pandas as pd
import io
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from os import environ, path
import os
import tempfile

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
    OrderExportRequest,
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
    order_data: OrderCreate,
    current_user: UserInDB = Depends(get_current_user)
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
        "payment_method": order_data.payment_method or "bank",
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

        # Check if product is active and has sufficient stock
        if product.get("status", "active") != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{product['name']}' is not available for purchase",
            )

        if item.quantity > product.get("stock_quantity", 0):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product['name']}'. Available: {product.get('stock_quantity', 0)}",
            )

        # Update product stock
        await products_collection.update_one(
            {"_id": ObjectId(item.product_id)},
            {"$inc": {"stock_quantity": -item.quantity}},
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

    # Apply discount if specified
    items = order_data.items
    base_total = sum(item.price_at_purchase * item.quantity for item in items)
    total_amount = base_total
    
    # Handle discounts
    if hasattr(order_data, 'discount_type') and hasattr(order_data, 'discount_value'):
        if order_data.discount_type == 'percentage':
            discount_amount = base_total * (order_data.discount_value / 100)
            total_amount = base_total - discount_amount
        elif order_data.discount_type == 'fixed':
            total_amount = max(0, base_total - order_data.discount_value)

    # Use provided total amount if specified (for custom prices)
    if hasattr(order_data, 'total_amount') and order_data.total_amount is not None:
        total_amount = order_data.total_amount

    # Create new order
    order = {
        "user_id": order_data.user_id,
        "order_date": datetime.utcnow(),
        "delivery_address": order_data.delivery_address,
        "receiver_phone": order_data.receiver_phone,
        "items": [item.dict() for item in order_data.items],
        "total_amount": total_amount,
        "order_status": order_data.order_status,
        "payment_status": order_data.payment_status,
        "payment_method": "admin_custom_order",
    }

    # Save discount info if applicable
    if hasattr(order_data, 'discount_type') and hasattr(order_data, 'discount_value'):
        order["discount"] = {
            "type": order_data.discount_type,
            "value": order_data.discount_value,
            "original_total": base_total,
        }

    # Save order to database
    result = await orders_collection.insert_one(order)
    order["id"] = str(result.inserted_id)

    # Format response
    order_response = await format_order_response(order)

    return order_response


@router.post("/admin/export-orders")
async def export_orders(
    export_data: OrderExportRequest,
    background_tasks: BackgroundTasks,
    current_user: UserInDB = Depends(get_current_user),
):
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )
    
    # Validate and prepare filter
    filter_query = {}
    if export_data.status_filter and export_data.status_filter != "all":
        filter_query["order_status"] = export_data.status_filter
    
    # Date range filter
    if export_data.start_date:
        if not "order_date" in filter_query:
            filter_query["order_date"] = {}
        filter_query["order_date"]["$gte"] = export_data.start_date
    
    if export_data.end_date:
        if not "order_date" in filter_query:
            filter_query["order_date"] = {}
        # Add 1 day to include the end date fully
        end_date = export_data.end_date + timedelta(days=1)
        filter_query["order_date"]["$lt"] = end_date
    
    # Schedule the export job
    background_tasks.add_task(
        process_export_orders,
        filter_query,
        export_data.format,
        export_data.email,
        export_data.include_all_fields,
    )
    
    return {"message": "Order export has been scheduled. You will receive the file via email."}


async def process_export_orders(
    filter_query: Dict[str, Any],
    format_type: str,
    email: str,
    include_all_fields: bool = True,
):
    """Process and export orders in the background"""
    try:
        # Fetch orders
        orders = await orders_collection.find(filter_query).sort("order_date", -1).to_list(1000)
        orders = serialize_list(orders)
        
        # Process orders to include product details
        order_data = []
        for order in orders:
            # Get basic order data
            order_row = {
                "Order ID": order["id"],
                "Date": order["order_date"],
                "User ID": order["user_id"],
                "Delivery Address": order["delivery_address"],
                "Receiver Phone": order["receiver_phone"],
                "Order Status": order["order_status"],
                "Payment Status": order["payment_status"],
                "Total Amount": order["total_amount"],
            }
            
            # Include payment method if available
            if "payment_method" in order:
                order_row["Payment Method"] = order["payment_method"]
            
            # Include discount info if available
            if "discount" in order:
                order_row["Discount Type"] = order["discount"].get("type")
                order_row["Discount Value"] = order["discount"].get("value")
                order_row["Original Total"] = order["discount"].get("original_total")
            
            # Process items
            items_text = []
            for idx, item in enumerate(order["items"]):
                product = await products_collection.find_one({"_id": ObjectId(item["product_id"])})
                if product:
                    product_name = product["name"]
                else:
                    product_name = f"Unknown Product ({item['product_id']})"
                
                item_text = f"{product_name} x {item['quantity']} @ ₹{item['price_at_purchase']}"
                items_text.append(item_text)
                
                # Add individual item details if all fields are included
                if include_all_fields:
                    order_row[f"Item {idx+1} Product ID"] = item["product_id"]
                    order_row[f"Item {idx+1} Product Name"] = product_name
                    order_row[f"Item {idx+1} Quantity"] = item["quantity"]
                    order_row[f"Item {idx+1} Price"] = item["price_at_purchase"]
                    order_row[f"Item {idx+1} Subtotal"] = item["price_at_purchase"] * item["quantity"]
            
            # Join all items
            order_row["Items"] = ", ".join(items_text)
            
            # Add to order data
            order_data.append(order_row)
        
        # Create DataFrame
        df = pd.DataFrame(order_data)
        
        # Export based on format
        if format_type == "excel":
            file_path = export_excel(df)
            send_email(email, "Order Export (Excel)", "Please find the attached order export file.", file_path)
        elif format_type == "csv":
            file_path = export_csv(df)
            send_email(email, "Order Export (CSV)", "Please find the attached order export file.", file_path)
        elif format_type == "google_sheets":
            # Google Sheets requires OAuth, which is complex for this context
            # As a simplification, we'll send Excel file with instructions
            file_path = export_excel(df)
            message = (
                "Please find the attached order export file in Excel format.\n\n"
                "To import this to Google Sheets:\n"
                "1. Open Google Sheets\n"
                "2. Create a new sheet\n"
                "3. Go to File > Import > Upload\n"
                "4. Upload the attached Excel file"
            )
            send_email(email, "Order Export (for Google Sheets)", message, file_path)
    except Exception as e:
        # Send error email
        error_message = f"An error occurred while exporting orders: {str(e)}"
        send_email(email, "Order Export Error", error_message)


def export_excel(df):
    """Export DataFrame to Excel file"""
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, sheet_name='Orders', index=False)
    output.seek(0)
    
    # Save to temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
        tmp.write(output.getvalue())
        return tmp.name


def export_csv(df):
    """Export DataFrame to CSV file"""
    with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as tmp:
        df.to_csv(tmp.name, index=False)
        return tmp.name


def send_email(to_email, subject, message, attachment_path=None):
    """Send email with optional attachment"""
    try:
        smtp_server = environ.get("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(environ.get("SMTP_PORT", 587))
        smtp_user = environ.get("SMTP_USER")
        smtp_pass = environ.get("SMTP_PASSWORD")
        from_email = environ.get("FROM_EMAIL", smtp_user)
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add message body
        msg.attach(MIMEText(message, 'plain'))
        
        # Add attachment if provided
        if attachment_path:
            filename = path.basename(attachment_path)
            attachment = open(attachment_path, "rb")
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment.read())
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f"attachment; filename= {filename}")
            msg.attach(part)
            attachment.close()
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        
        # Remove temporary file if it was an attachment
        if attachment_path:
            try:
                os.unlink(attachment_path)
            except:
                pass
    except Exception as e:
        print(f"Error sending email: {str(e)}")


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