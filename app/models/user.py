from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from uuid import uuid4
from app.database import Base

def uuid_str() -> str:
    return str(uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    agreed_to_terms = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
