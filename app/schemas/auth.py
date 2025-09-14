# app/schemas/auth.py
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, model_validator

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    @model_validator(mode="after")
    def ensure_one_of(cls, values):
        if not values.email:
            raise ValueError("Email is required!")
        return values
    
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[Dict[str, Any]] = None

class TokenData(BaseModel):
    user_id: Optional[int] = None

class ChangePassword(BaseModel):
    old_password: str
    new_password: str