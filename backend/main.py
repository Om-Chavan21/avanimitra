from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from models import CustomerCreate, Customer, Token, TokenData
from database import customer_collection, get_customer_by_phone_number
from bson import ObjectId
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os

# Load environment variables
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2 password bearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# --- Utility Functions ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone_number: str = payload.get("sub")
        if phone_number is None:
            raise credentials_exception
        token_data = TokenData(phone_number=phone_number)
    except JWTError:
        raise credentials_exception
    customer = await get_customer_by_phone_number(phone_number=token_data.phone_number)
    if customer is None:
        raise credentials_exception
    return customer


# --- API Endpoints ---
@app.post("/register/", response_model=Customer)
async def register_customer(customer: CustomerCreate):
    existing_customer = await get_customer_by_phone_number(customer.phone_number)
    if existing_customer:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    hashed_password = get_password_hash(customer.password)
    customer_dict = customer.dict()
    customer_dict["password"] = hashed_password  # Store hashed password
    # Remove the line that deletes customer_dict["id"]
    # del customer_dict["id"]  # This line is unnecessary

    result = await customer_collection.insert_one(customer_dict)
    created_customer = await customer_collection.find_one({"_id": result.inserted_id})

    # Convert ObjectId to string for the Customer model
    created_customer["id"] = str(created_customer["_id"])
    del created_customer["_id"]

    return Customer(**created_customer)


@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    customer = await get_customer_by_phone_number(form_data.username)
    if not customer:
        raise HTTPException(status_code=400, detail="Incorrect phone number")
    hashed_password = customer["password"]
    if not verify_password(form_data.password, hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": customer["phone_number"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/customers/me/", response_model=Customer)
async def get_current_user_info(current_user: Customer = Depends(get_current_user)):
    # Convert ObjectId to string for the Customer model
    current_user["id"] = str(current_user["_id"])
    del current_user["_id"]
    return Customer(**current_user)


@app.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(
    customer_id: str,
    customer: CustomerCreate,
    current_user: Customer = Depends(get_current_user),
):
    if str(current_user["_id"]) != customer_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this profile"
        )

    customer_data = customer.dict()
    hashed_password = get_password_hash(customer_data["password"])
    customer_data["password"] = hashed_password

    updated_customer = await customer_collection.find_one_and_update(
        {"_id": ObjectId(customer_id)},
        {"$set": customer_data},
        return_document=True,
    )
    if not updated_customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Convert ObjectId to string for the Customer model
    updated_customer["id"] = str(updated_customer["_id"])
    del updated_customer["_id"]
    return Customer(**updated_customer)


@app.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(
    customer_id: str, current_user: Customer = Depends(get_current_user)
):
    customer = await customer_collection.find_one({"_id": ObjectId(customer_id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Convert ObjectId to string for the Customer model
    customer["id"] = str(customer["_id"])
    del customer["_id"]
    return Customer(**customer)


@app.delete("/customers/{customer_id}")
async def delete_customer(
    customer_id: str, current_user: Customer = Depends(get_current_user)
):
    if str(current_user["_id"]) != customer_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this profile"
        )

    result = await customer_collection.delete_one({"_id": ObjectId(customer_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted successfully"}
