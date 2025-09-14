from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from datetime import datetime

Priority = Literal["low", "medium", "high"]

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due: Optional[str] = None
    priority: Optional[Priority] = "low"
    completed: Optional[bool] = False

class TaskCreate(TaskBase):
    id: Optional[str] = None  # cho phép client gửi id; nếu None server sẽ sinh uuid

class TaskPatch(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due: Optional[str] = None
    priority: Optional[Priority] = None
    completed: Optional[bool] = None

class TaskResponse(TaskBase):
    id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
