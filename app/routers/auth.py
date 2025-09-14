from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserSignup, UserLogin, Token, ChangePassword
from app.schemas.user import UserResponse, UserProfileResponse
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=Token)
def signup(data: UserSignup, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        username=data.username,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        agreed_to_terms=data.agreed_to_terms,
    )
    db.add(user); db.commit(); db.refresh(user)

    token = create_access_token({"sub": user.username})
    # Token model cho FE: access_token, token_type, kèm user tối thiểu
    return Token(
        access_token=token,
        token_type="bearer",
        user={"id": user.id, "username": user.username, "email": user.email}
    )

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": user.username})
    return Token(
        access_token=token,
        token_type="bearer",
        user={"id": user.id, "username": user.username, "email": user.email}
    )

@router.get("/me", response_model=UserProfileResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/change-password")
def change_password(payload: ChangePassword, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Old password incorrect")
    current_user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password changed"}

@router.post("/forgot")
def forgot(username_or_email: str):
    # Mock: luôn trả thành công để FE hiển thị toast
    return {"ok": True, "message": f"Reset link sent to {username_or_email}"}
