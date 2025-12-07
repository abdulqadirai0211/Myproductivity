from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId

from database import get_database
from models import UserCreate, UserResponse, UserInDB
from auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user"""
    db = get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    user_dict = user_data.model_dump()
    user_dict["password"] = hashed_password
    
    result = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    
    # Create token
    token = create_access_token(data={"id": str(created_user["_id"])})
    
    return UserResponse(
        _id=str(created_user["_id"]),
        email=created_user["email"],
        name=created_user.get("name"),
        token=token
    )


@router.post("/login", response_model=UserResponse)
async def login(user_data: UserCreate):
    """Login a user"""
    db = get_database()
    
    # Find user
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create token
    token = create_access_token(data={"id": str(user["_id"])})
    
    return UserResponse(
        _id=str(user["_id"]),
        email=user["email"],
        name=user.get("name"),
        token=token
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserInDB = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        _id=str(current_user.id),
        email=current_user.email,
        name=current_user.name
    )
