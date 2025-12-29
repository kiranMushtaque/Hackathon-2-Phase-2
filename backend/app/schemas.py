from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False

    class Config:
        from_attributes = True


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

    class Config:
        from_attributes = True


class Task(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    completed: bool
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: str
    name: str
    password: str


class User(BaseModel):
    id: int
    email: str
    name: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
