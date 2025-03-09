from pydantic import BaseModel, Field, EmailStr, validator
import re
from typing import Optional


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
