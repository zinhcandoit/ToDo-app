# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse
from app.config import settings
from app.database import Base, engine
from app.routers import auth as auth_router
from app.routers import tasks as tasks_router

# tạo bảng nếu chưa có
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Todo API")
origins = [
    "http://localhost:5173",
    "https://to-do-app-azure-tau.vercel.app/",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/auth", tags=["Auth"])
app.include_router(tasks_router.router, prefix="/tasks", tags=["Tasks"])

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/", include_in_schema=False)
async def root():
    # return {"service": "todo-api", "status": "ok"}  # hoặc
    return RedirectResponse("/docs")
