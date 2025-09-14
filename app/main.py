# app/main.py
from fastapi import FastAPI, Request, Response
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
    "https://to-do-app-azure-tau.vercel.app",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=r"https://.*\.vercel\.app$"
)

app.include_router(auth_router.router, prefix="/auth", tags=["Auth"])
app.include_router(tasks_router.router, prefix="/tasks", tags=["Tasks"])

@app.get("/health")
def health():
    return {"ok": True}

@app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
async def root(req: Request):
    if req.method == "HEAD":
        # Health-check HEAD -> trả 200 OK
        return Response(status_code=200)
    return RedirectResponse("/docs", status_code=307)
