from pydantic import BaseModel, Field, ConfigDict, constr
from typing import Literal, Optional
from datetime import date, datetime

Priority = Literal["low", "medium", "high"]

class TaskIn(BaseModel):
    title: constr(min_length=1, max_length=200)
    description: Optional[str] = None
    due: Optional[date] = None                  # FE: 'YYYY-MM-DD'
    priority: Optional[Priority] = None         # FE cho phép undefined

class TaskPatch(BaseModel):
    title: Optional[constr(min_length=1, max_length=200)] = None
    description: Optional[str] = None
    due: Optional[date] = None
    priority: Optional[Priority] = None
    completed: Optional[bool] = None

class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    title: str
    description: Optional[str] = None
    due: Optional[date] = None
    priority: Optional[Priority] = None
    completed: bool

    createdAt: datetime = Field(..., serialization_alias="createdAt", validation_alias="createdAt")
    updatedAt: Optional[datetime] = Field(None, serialization_alias="updatedAt", validation_alias="updatedAt")

    # map từ ORM: created_at -> createdAt, updated_at -> updatedAt
    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        if hasattr(obj, "created_at") and not hasattr(obj, "createdAt"):
            setattr(obj, "createdAt", obj.created_at)
        if hasattr(obj, "updated_at") and not hasattr(obj, "updatedAt"):
            setattr(obj, "updatedAt", obj.updated_at)
        return super().model_validate(obj, *args, **kwargs)
