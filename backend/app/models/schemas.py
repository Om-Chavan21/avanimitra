from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    name: str
    address: str
    mobile_number: str
    password: str


class User(BaseModel):
    name: str
    address: str
    mobile_number: str
    is_admin: bool = False  # New field for admin status

    class Config:
        orm_mode = True
