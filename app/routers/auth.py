# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserSignup, UserLogin, Token
from app.auth import get_password_hash, verify_password, create_access_token
from datetime import timedelta
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", response_model=Token)
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    # unique checks
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        username=payload.username,             # đã đảm bảo có
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        agreed_to_terms=payload.agreed_to_terms,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # token sub = username để tương thích get_current_user cũ
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.username, "email": user.email},
    }

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    if payload.email:
        user = db.query(User).filter(User.email == payload.email).first()
    else:
        user = db.query(User).filter(User.username == payload.username).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.username, "email": user.email},
    }

# (tuỳ chọn) Forgot password stub
@router.post("/forgot")
def forgot(email: dict):
    # chỉ trả stub cho FE mock
    return {"message": f"Reset link sent to {email.get('email')}"}

@router.post("/google/start")
def google_start():
    raise HTTPException(status_code=501, detail="Google OAuth not configured")
