from pydantic import BaseModel, validator
from typing import Optional


class CustomerCreate(BaseModel):
    name: str
    phone_number: str
    password: str  # Added password field
    address: Optional[str] = None
    area_of_residence: Optional[str] = None
    google_maps_link: Optional[str] = None

    @validator("password")
    def password_must_be_at_least_8_characters(cls, password: str):
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return password


class Customer(CustomerCreate):
    id: str  # Changed from Optional[str] to str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    phone_number: Optional[str] = None
