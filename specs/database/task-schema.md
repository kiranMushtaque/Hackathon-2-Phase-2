# Task Database Schema Specification

## Overview
This document specifies the database schema for task management in the Hackathon II - The Evolution of Todo application using SQLModel with PostgreSQL.

## Database Configuration
- Database: PostgreSQL
- ORM: SQLModel
- Connection: Via DATABASE_URL environment variable

## Task Table Schema

### Table: tasks

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT, INDEX | Unique identifier for each task |
| title | VARCHAR(255) | NOT NULL | Task title (1-255 characters) |
| description | TEXT | NULL | Optional task description (max 1000 characters) |
| completed | BOOLEAN | DEFAULT FALSE | Task completion status |
| user_id | VARCHAR(255) | NOT NULL, INDEX | Foreign key to user who owns the task |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Task creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP, ON UPDATE | Task last update timestamp |

### SQL Definition
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
```

## SQLModel Definition
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class TaskBase(SQLModel):
    title: str
    description: Optional[str] = None
    completed: bool = False
    user_id: str = Field(index=True)

class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
```

## Indexes
- Primary key index on `id`
- Index on `user_id` for efficient user-based queries
- Index on `completed` for filtering completed tasks
- Index on `created_at` for chronological sorting

## Constraints
- `title` length: 1-255 characters
- `description` length: 0-1000 characters
- `completed` defaults to `false`
- `user_id` must exist in users table (when implemented)
- `created_at` is set automatically on creation
- `updated_at` is updated automatically on modification

## Relationships
- Each task belongs to one user (user_id foreign key)
- A user can have multiple tasks

## Security Considerations
- Access to tasks must be validated against user_id
- Users can only access their own tasks
- Proper database permissions should be set
- SQL injection prevention through parameterized queries