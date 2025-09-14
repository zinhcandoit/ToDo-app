from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    secret_key: str = "change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 ngày
    sqlalchemy_database_url: str = "sqlite:///./dev.db"
    cors_origins: List[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"

settings = Settings()
