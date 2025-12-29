from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from sqlalchemy import Column, DateTime
from sqlalchemy.sql import func


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, max_length=255, index=True)
    name: str = Field(max_length=255)
    hashed_password: str
    created_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime, default=func.now())
    )
    updated_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime, default=func.now(), onupdate=func.now())
    )

    tasks: List["Task"] = Relationship(back_populates="user")


class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    user_id: int = Field(index=True, foreign_key="users.id")
    created_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime, default=func.now())
    )
    updated_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime, default=func.now(), onupdate=func.now())
    )

    user: Optional[User] = Relationship(back_populates="tasks")


class TaskCreate(SQLModel):
    title: str
    description: Optional[str] = None
    completed: bool = False


class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
