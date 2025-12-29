from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Database settings - default to SQLite for easy local development
    DATABASE_URL: str = "sqlite:///./taskmanager.db"

    # Auth settings
    SECRET_KEY: str = "your-secret-key-change-in-production"
    BETTER_AUTH_SECRET: str = "your-better-auth-secret-change-in-production"

    # JWT settings
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Application settings
    APP_NAME: str = "Task Manager API - Phase II"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields in .env file


settings = Settings()
