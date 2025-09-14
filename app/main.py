# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine
from app.routers import auth as auth_router
from app.routers import tasks as tasks_router

# tạo bảng nếu chưa có
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Todo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list if settings.cors_list != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/auth", tags=["Auth"])
app.include_router(tasks_router.router, prefix="/tasks", tags=["Tasks"])

@app.get("/health")
def health():
    return {"ok": True}
