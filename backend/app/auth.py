from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
import os
from passlib.context import CryptContext
from sqlmodel import Session
from .config import settings
from .database import get_db
from .models import User
from .crud import get_user_by_email

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

print(f"[AUTH] SECRET_KEY loaded: {SECRET_KEY[:10]}...")
print(f"[AUTH] ALGORITHM: {ALGORITHM}")

security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(f"[AUTH] Token created for user_id: {data.get('sub')}")
    return encoded_jwt


def get_current_user_from_token(token: str):
    """Get the current user from the JWT token."""
    print(f"[AUTH] Decoding token: {token[:20]}...")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        token_type: str = payload.get("type")

        print(f"[AUTH] Decoded payload - user_id: {user_id_str}, type: {token_type}")

        if user_id_str is None or token_type != "access":
            print(f"[AUTH] Invalid token - user_id: {user_id_str}, type: {token_type}")
            raise HTTPException(status_code=401, detail="Invalid token")

        # Convert string back to int
        user_id = int(user_id_str)
        return user_id
    except jwt.ExpiredSignatureError:
        print("[AUTH] Token expired")
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError as e:
        print(f"[AUTH] JWT Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get the current user from the JWT token."""
    token = credentials.credentials
    print(f"[AUTH] Received token in header: {token[:20] if token else 'None'}...")

    user_id = get_current_user_from_token(token)

    # Verify that the user exists in the database
    user = db.get(User, user_id)
    if user is None:
        print(f"[AUTH] User {user_id} not found in database")
        raise HTTPException(status_code=401, detail="Invalid token")

    print(f"[AUTH] Authenticated user_id: {user.id}")
    return user.id


def authenticate_user(db: Session, email: str, password: str):
    """Authenticate a user against the database."""
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user
