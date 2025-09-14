# app/schemas/auth.py
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, model_validator

class UserSignup(BaseModel):
    # FE gửi name/email/password
    name: Optional[str] = None
    username: Optional[str] = None
    email: EmailStr
    password: str
    agreed_to_terms: bool = True

    @model_validator(mode="after")
    def ensure_username(cls, values):
        # ưu tiên username, nếu không có thì dùng name
        if not values.username and values.name:
            values.username = values.name
        if not values.username:
            raise ValueError("username (or name) is required")
        return values

class UserLogin(BaseModel):
    # FE có thể gửi email/password hoặc username/password
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: str

    @model_validator(mode="after")
    def ensure_one_of(cls, values):
        if not values.email and not values.username:
            raise ValueError("email or username is required")
        return values

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[Dict[str, Any]] = None

class TokenData(BaseModel):
    username: Optional[str] = None

class ChangePassword(BaseModel):
    old_password: str
    new_password: str
