# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from typing import List
# from datetime import datetime
# from app.database import get_db
# from app.models.task import Task
# from app.schemas.task import TaskIn, TaskPatch, TaskOut
# from app.auth import get_current_user
# from app.models.user import User

# router = APIRouter(prefix="/tasks", tags=["tasks"])

# @router.get("", response_model=List[TaskOut], response_model_by_alias=True)
# def list_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
#     tasks = db.query(Task).filter(Task.user_id == current_user.id).order_by(Task.created_at.asc()).all()
#     # map alias camelCase
#     return [TaskOut.model_validate(t) for t in tasks]

# @router.post("", response_model=TaskOut, response_model_by_alias=True, status_code=201)
# def create_task(payload: TaskIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
#     t = Task(
#         user_id=current_user.id,
#         title=payload.title,
#         description=payload.description,
#         due=payload.due,
#         priority=payload.priority,
#         completed=False,
#     )
#     db.add(t); db.commit(); db.refresh(t)
#     # ensure created_at present for alias
#     if not t.created_at: t.created_at = datetime.utcnow()
#     return TaskOut.model_validate(t)

# @router.patch("/{task_id}", response_model=TaskOut, response_model_by_alias=True)
# def update_task(task_id: str, patch: TaskPatch, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
#     t: Task | None = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
#     if not t:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

#     data = patch.model_dump(exclude_unset=True)
#     if "completed" in data:
#         t.completed = bool(data.pop("completed"))
#     for k, v in data.items():
#         setattr(t, k, v)

#     # cập nhật updated_at thủ công cho SQLite (phòng khi onupdate không kích hoạt)
#     t.updated_at = datetime.utcnow()
#     db.commit(); db.refresh(t)
#     return TaskOut.model_validate(t)

# @router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_task(task_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
#     t = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
#     if not t:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
#     db.delete(t); db.commit()
#     return

# app/routers/tasks.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskPatch, TaskResponse

router = APIRouter()

@router.get("", response_model=List[TaskResponse])
def list_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Task).filter(Task.user_id == current_user.id).order_by(Task.created_at.desc()).all()

@router.post("", response_model=TaskResponse)
def create_task(body: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = Task(
        id=body.id or str(uuid.uuid4()),
        title=body.title.strip(),
        description=body.description,
        due=body.due,
        priority=body.priority or "low",
        completed=bool(body.completed),
        user_id=current_user.id,
    )
    db.add(task); db.commit(); db.refresh(task)
    return task

@router.patch("/{task_id}", response_model=TaskResponse)
def patch_task(task_id: str, patch: TaskPatch, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for k, v in patch.model_dump(exclude_unset=True).items():
        setattr(task, k, v)
    db.commit(); db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task); db.commit()
    return {"ok": True}
