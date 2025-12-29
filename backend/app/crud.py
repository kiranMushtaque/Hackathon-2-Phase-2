from sqlmodel import Session, select
from .models import Task, User
from .schemas import TaskCreate, TaskUpdate


def get_task(db: Session, task_id: int, user_id: int):
    """Get a specific task by ID for a specific user."""
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    return db.exec(statement).first()


def get_tasks(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get all tasks for a specific user."""
    statement = select(Task).where(Task.user_id == user_id).offset(skip).limit(limit)
    return db.exec(statement).all()


def create_task(db: Session, task: TaskCreate, user_id: int):
    """Create a new task for a specific user."""
    db_task = Task(
        title=task.title,
        description=task.description,
        completed=task.completed,
        user_id=user_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, task_id: int, task_update: TaskUpdate, user_id: int):
    """Update a specific task for a specific user."""
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    db_task = db.exec(statement).first()

    if db_task is None:
        return None

    # Update only the fields that are provided
    for field in ['title', 'description', 'completed']:
        value = getattr(task_update, field, None)
        if value is not None:
            setattr(db_task, field, value)

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


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