from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter()


@router.get("/{user_id}/tasks", response_model=List[schemas.Task])
def read_tasks(
    user_id: int,
    current_user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Get all tasks for the authenticated user.
    """
    # Verify that the requested user_id matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access these tasks"
        )

    tasks = crud.get_tasks(db, user_id=user_id, skip=skip, limit=limit)
    return tasks


@router.get("/{user_id}/tasks/{task_id}", response_model=schemas.Task)
def read_task(
    user_id: int,
    task_id: int,
    current_user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific task by ID.
    """
    # Verify that the requested user_id matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task"
        )

    db_task = crud.get_task(db, task_id=task_id, user_id=user_id)
    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return db_task


@router.post("/{user_id}/tasks", response_model=schemas.Task)
def create_task(
    user_id: int,
    task: schemas.TaskCreate,
    current_user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new task for the authenticated user.
    """
    # Verify that the requested user_id matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create tasks for this user"
        )

    # Validate title length
    if len(task.title) < 1 or len(task.title) > 255:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title must be between 1 and 255 characters"
        )

    # Validate description length
    if task.description and len(task.description) > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description must be 1000 characters or less"
        )

    return crud.create_task(db=db, task=task, user_id=user_id)


@router.put("/{user_id}/tasks/{task_id}", response_model=schemas.Task)
def update_task(
    user_id: int,
    task_id: int,
    task_update: schemas.TaskUpdate,
    current_user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a specific task for the authenticated user.
    """
    # Verify that the requested user_id matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task"
        )

    # Validate title length if provided
    if task_update.title is not None:
        if len(task_update.title) < 1 or len(task_update.title) > 255:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title must be between 1 and 255 characters"
            )

    # Validate description length if provided
    if task_update.description is not None and len(task_update.description) > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description must be 1000 characters or less"
        )

    db_task = crud.update_task(
        db=db,
        task_id=task_id,
        task_update=task_update,
        user_id=user_id
    )

    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return db_task


@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=schemas.Task)
def update_task_completion(
    user_id: int,
    task_id: int,
    task_update: schemas.TaskUpdate,
    current_user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a specific task's completion status for the authenticated user.
    """
    # Verify that the requested user_id matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task"
        )

    # Only allow updating the completed field in this endpoint
    if task_update.completed is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed field is required"
        )

    db_task = crud.update_task(
        db=db,
        task_id=task_id,
        task_update=task_update,
        user_id=user_id
    )

    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return db_task


@router.delete("/{user_id}/tasks/{task_id}")
def delete_task(
    user_id: int,
    task_id: int,
    current_user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific task for the authenticated user.
    """
    # Verify that the requested user_id matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this task"
        )

    success = crud.delete_task(db=db, task_id=task_id, user_id=user_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return {"message": "Task deleted successfully"}