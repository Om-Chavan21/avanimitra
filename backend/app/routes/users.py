from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from bson.objectid import ObjectId
from app.database.mongodb import users
from app.models.schemas import UserCreate, User
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Secret key for JWT
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter()


# Helper function to hash password
def hash_password(password):
    return pwd_context.hash(password)


# Helper function to verify password
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# Helper function to create JWT token
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Helper function to get current user from token
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        mobile_number: str = payload.get("sub")
        if mobile_number is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await users.find_one({"mobile_number": mobile_number})
    if user is None:
        raise credentials_exception
    return user


# Helper function to get current admin user from token
async def get_current_admin_user(token: str = Depends(oauth2_scheme)):
    user = await get_current_user(token)
    if not user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Forbidden")
    return user


@router.post("/users/", response_model=User)
async def create_user(user_data: UserCreate):
    # Check if mobile number already exists
    if await users.find_one({"mobile_number": user_data.mobile_number}):
        raise HTTPException(status_code=400, detail="Mobile number already exists")

    # Hash password
    user_data.password = hash_password(user_data.password)

    # Insert user into database with default is_admin=False
    result = await users.insert_one(user_data.dict())
    created_user = await users.find_one({"_id": result.inserted_id})

    # Convert _id to string
    created_user["_id"] = str(created_user["_id"])
    del created_user["password"]  # Remove password from response

    return created_user


# Endpoint to set user as admin
@router.patch("/users/{mobile_number}/set-admin", response_model=User)
async def set_user_as_admin(
    mobile_number: str, current_admin_user: dict = Depends(get_current_admin_user)
):
    user = await users.find_one({"mobile_number": mobile_number})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = await users.update_one(
        {"mobile_number": mobile_number}, {"$set": {"is_admin": True}}
    )
    updated_user = await users.find_one({"mobile_number": mobile_number})
    updated_user["_id"] = str(updated_user["_id"])
    del updated_user["password"]
    return updated_user


# Login endpoint
@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await users.find_one({"mobile_number": form_data.username})
    if not user:
        raise HTTPException(
            status_code=400, detail="Incorrect mobile number or password"
        )

    if not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=400, detail="Incorrect mobile number or password"
        )

    # Generate JWT token with is_admin status
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["mobile_number"], "is_admin": user.get("is_admin", False)},
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}


# Get user endpoint
@router.get("/users/me", response_model=User)
async def get_user(current_user: dict = Depends(get_current_user)):
    user = await users.find_one({"mobile_number": current_user["mobile_number"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    del user["password"]  # Remove password from response
    return user


# Admin dashboard endpoint
@router.get("/admin/dashboard", response_model=dict)
async def admin_dashboard(current_admin_user: dict = Depends(get_current_admin_user)):
    return {"message": "Welcome to the admin dashboard"}


# Endpoint to get all users
@router.get("/admin/users", response_model=list[User])
async def get_all_users(current_admin_user: dict = Depends(get_current_admin_user)):
    cursor = users.find({"is_admin": False})  # Get cursor for users who are not admins
    users_list = await cursor.to_list(length=None)  # Convert cursor to a list

    # Convert ObjectId to string and remove passwords
    for user in users_list:
        user["_id"] = str(user["_id"])  # Convert ObjectId to string
        del user["password"]  # Remove password from response

    return users_list
