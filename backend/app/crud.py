from sqlmodel import Session, select
from .models import Task, User
from .schemas import TaskCreate, TaskUpdate
from datetime import datetime
import json


def parse_task_tags(task: Task):
    """Helper function to parse tags from JSON string to list."""
    if task and task.tags:
        try:
            task.tags = json.loads(task.tags) if isinstance(task.tags, str) else task.tags
        except:
            task.tags = []
    return task


def get_task(db: Session, task_id: int, user_id: int):
    """Get a specific task by ID for a specific user."""
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    task = db.exec(statement).first()
    return parse_task_tags(task) if task else None


def get_tasks(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get all tasks for a specific user."""
    statement = select(Task).where(Task.user_id == user_id).offset(skip).limit(limit)
    tasks = db.exec(statement).all()
    return [parse_task_tags(task) for task in tasks]


def create_task(db: Session, task: TaskCreate, user_id: int):
    """Create a new task for a specific user."""
    # Parse due_date if provided
    due_date_obj = None
    if task.due_date:
        try:
            due_date_obj = datetime.fromisoformat(task.due_date.replace('Z', '+00:00'))
        except:
            pass

    # Convert tags list to JSON string
    tags_json = json.dumps(task.tags) if task.tags else None

    db_task = Task(
        title=task.title,
        description=task.description,
        completed=task.completed,
        priority=task.priority,
        starred=task.starred,
        tags=tags_json,
        due_date=due_date_obj,
        user_id=user_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return parse_task_tags(db_task)


def update_task(db: Session, task_id: int, task_update: TaskUpdate, user_id: int):
    """Update a specific task for a specific user."""
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    db_task = db.exec(statement).first()

    if db_task is None:
        return None

    # Update basic fields
    for field in ['title', 'description', 'completed', 'priority', 'starred']:
        value = getattr(task_update, field, None)
        if value is not None:
            setattr(db_task, field, value)

    # Handle tags (convert list to JSON)
    if task_update.tags is not None:
        db_task.tags = json.dumps(task_update.tags)

    # Handle due_date (convert string to datetime)
    if task_update.due_date is not None:
        try:
            db_task.due_date = datetime.fromisoformat(task_update.due_date.replace('Z', '+00:00'))
        except:
            pass

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return parse_task_tags(db_task)


def delete_task(db: Session, task_id: int, user_id: int):
    """Delete a specific task for a specific user."""
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    db_task = db.exec(statement).first()

    if db_task is None:
        return False

    db.delete(db_task)
    db.commit()
    return True


def get_user(db: Session, user_id: int):
    """Get a user by ID."""
    statement = select(User).where(User.id == user_id)
    return db.exec(statement).first()


def get_user_by_email(db: Session, email: str):
    """Get a user by email."""
    statement = select(User).where(User.email == email)
    return db.exec(statement).first()


def create_user(db: Session, user: User, hashed_password: str):
    """Create a new user."""
    db_user = User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user