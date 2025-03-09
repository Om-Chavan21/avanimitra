from pydantic import BaseModel, Field, EmailStr, validator
import re
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserBase(BaseModel):
    name: str
    phone: str
    address: str

    @validator("phone")
    def validate_phone(cls, v):
        if not re.match(r"^\d{10}$", v):
            raise ValueError("Phone number must be 10 digits")
        return v


class UserCreate(UserBase):
    password: str

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    password: Optional[str] = None


class UserInDB(UserBase):
    id: str
    is_admin: bool = False


class UserResponse(UserBase):
    id: str
    is_admin: bool


class LoginRequest(BaseModel):
    phone: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    is_admin: bool


class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    image_url: str


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None


class ProductResponse(ProductBase):
    id: str


class CartItem(BaseModel):
    product_id: str
    quantity: int


class CartItemResponse(BaseModel):
    product_id: str
    product: ProductResponse
    quantity: int


class CartResponse(BaseModel):
    items: List[CartItemResponse]
    total_price: float


class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class OrderItemBase(BaseModel):
    product_id: str
    quantity: int
    price_at_purchase: float


class OrderCreate(BaseModel):
    delivery_address: str
    receiver_phone: str
    items: List[CartItem]


class OrderItemResponse(OrderItemBase):
    product: ProductResponse


class OrderResponse(BaseModel):
    id: str
    user_id: str
    order_date: datetime
    delivery_address: str
    receiver_phone: str
    items: List[OrderItemResponse]
    total_amount: float
    order_status: OrderStatus
    payment_status: PaymentStatus


class OrderUpdate(BaseModel):
    order_status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None


class AdminOrderCreate(BaseModel):
    user_id: str
    delivery_address: str
    receiver_phone: str
    items: List[OrderItemBase]
    order_status: OrderStatus = OrderStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.PENDING
