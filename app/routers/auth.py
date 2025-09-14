from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserSignup, UserLogin, Token
from app.auth import get_password_hash, verify_password, create_access_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", response_model=Token)
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        is_active=True,
    )
    db.add(user); db.commit(); db.refresh(user)

    token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
    )
    return {"access_token": token, "token_type": "bearer",
            "user": {"id": user.id, "name": user.name, "email": user.email}}

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
    )
    return {"access_token": token, "token_type": "bearer",
            "user": {"id": user.id, "name": user.name, "email": user.email}}

@router.post("/forgot")
def forgot(body: dict):
    return {"message": f"Reset link sent to {body.get('email')}"}

@router.post("/google/start")
def google_start():
    # stub, tồn tại để FE không gặp 404; sẽ trả 501
    raise HTTPException(status_code=501, detail="Google OAuth not configured")
