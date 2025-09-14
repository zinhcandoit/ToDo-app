import enum
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum, Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Priority(enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True)  # uuid string
    title = Column(String(255), nullable=False)
    description = Column(String, nullable=True)
    due = Column(String(10), nullable=True)  # "YYYY-MM-DD"
    priority = Column(Enum(Priority), nullable=False, default=Priority.low)
    completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user = relationship("User", back_populates="tasks")

