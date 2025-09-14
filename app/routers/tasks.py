from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.task import Task
from app.schemas.task import TaskIn, TaskPatch, TaskOut
from app.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=List[TaskOut], response_model_by_alias=True)
def list_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = db.query(Task).filter(Task.user_id == current_user.id).order_by(Task.created_at.asc()).all()
    # map alias camelCase
    return [TaskOut.model_validate(t) for t in tasks]

@router.post("", response_model=TaskOut, response_model_by_alias=True, status_code=201)
def create_task(payload: TaskIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    t = Task(
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        due=payload.due,
        priority=payload.priority,
        completed=False,
    )
    db.add(t); db.commit(); db.refresh(t)
    # ensure created_at present for alias
    if not t.created_at: t.created_at = datetime.utcnow()
    return TaskOut.model_validate(t)

@router.patch("/{task_id}", response_model=TaskOut, response_model_by_alias=True)
def update_task(task_id: str, patch: TaskPatch, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    t: Task | None = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    data = patch.model_dump(exclude_unset=True)
    if "completed" in data:
        t.completed = bool(data.pop("completed"))
    for k, v in data.items():
        setattr(t, k, v)

    # cập nhật updated_at thủ công cho SQLite (phòng khi onupdate không kích hoạt)
    t.updated_at = datetime.utcnow()
    db.commit(); db.refresh(t)
    return TaskOut.model_validate(t)

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    t = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    db.delete(t); db.commit()
    return
