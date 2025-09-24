from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.user import User, UserCreate, UserLogin, UserResponse, UserRole
from services.auth_service import AuthService
from database import get_database, COLLECTIONS
from typing import Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[User]:
    """Get current authenticated user"""
    try:
        payload = AuthService.verify_token(credentials.credentials)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        db = get_database()
        user_data = await db[COLLECTIONS['users']].find_one({"id": user_id})
        if user_data is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return User(**user_data)
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure current user is admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Register new user"""
    try:
        db = get_database()
        
        # Check if user already exists
        existing_user = await db[COLLECTIONS['users']].find_one({
            "$or": [
                {"email": user_data.email},
                {"username": user_data.username}
            ]
        })
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email or username already exists"
            )
        
        # Create new user
        hashed_password = AuthService.hash_password(user_data.password)
        user = User(
            **user_data.dict(exclude={"password"}),
            hashed_password=hashed_password
        )
        
        # Insert user to database
        await db[COLLECTIONS['users']].insert_one(user.dict())
        
        return UserResponse(**user.dict())
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user"
        )

@router.post("/login")
async def login(login_data: UserLogin):
    """Login user"""
    try:
        db = get_database()
        
        # Find user by email
        user_data = await db[COLLECTIONS['users']].find_one({"email": login_data.email})
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        user = User(**user_data)
        
        # Verify password
        if not AuthService.verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        # Create access token
        access_token = AuthService.create_access_token(data={"sub": user.id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(**user.dict())
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to login"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(**current_user.dict())

@router.post("/admin-login")
async def admin_login(login_data: UserLogin):
    """Admin login with default credentials"""
    try:
        # Check for default admin credentials
        if login_data.email == "admin@nanacafe.com" and login_data.password == "password123":
            # Create or get admin user
            db = get_database()
            admin_user = await db[COLLECTIONS['users']].find_one({"email": "admin@nanacafe.com"})
            
            if not admin_user:
                # Create default admin user
                admin = User(
                    username="admin",
                    email="admin@nanacafe.com",
                    full_name="Admin User",
                    role=UserRole.ADMIN,
                    hashed_password=AuthService.hash_password("password123")
                )
                await db[COLLECTIONS['users']].insert_one(admin.dict())
                admin_user = admin.dict()
            
            # Create access token
            access_token = AuthService.create_access_token(data={"sub": admin_user["id"]})
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": UserResponse(**admin_user)
            }
        
        # Fallback to regular login
        return await login(login_data)
        
    except Exception as e:
        logger.error(f"Error in admin login: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
