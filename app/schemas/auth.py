from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str
    agreed_to_terms: bool = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[Dict[str, Any]] = None

class TokenData(BaseModel):
    username: Optional[str] = None

class ChangePassword(BaseModel):
    old_password: str
    new_password: str
