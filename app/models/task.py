# models/task.py
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, Date, DateTime, Boolean, Enum, ForeignKey, Index, func
from uuid import uuid4
from app.database import Base

def uuid_str(): return str(uuid4())

PriorityEnum = Enum("low", "medium", "high", name="priority")

class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    due: Mapped[Date | None] = mapped_column(Date, nullable=True)     # FE gửi 'YYYY-MM-DD'
    priority: Mapped[str | None] = mapped_column(PriorityEnum, nullable=True)

    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), onupdate=func.now())

Index("ix_tasks_user_due", Task.user_id, Task.due)
Index("ix_tasks_user_completed", Task.user_id, Task.completed)

