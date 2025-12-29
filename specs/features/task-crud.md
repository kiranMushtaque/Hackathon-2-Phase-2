# Task CRUD Feature Specification

## Overview
This document defines the requirements for the authenticated task CRUD (Create, Read, Update, Delete) operations. Each user will be able to manage only their own tasks through authenticated API endpoints.

## Data Model
### Task Entity
```python
{
  "id": "integer, auto-incrementing primary key",
  "title": "string, task title (max 255 chars)",
  "description": "string, optional task description",
  "completed": "boolean, task completion status",
  "user_id": "integer, foreign key linking to user",
  "created_at": "datetime, timestamp when task was created",
  "updated_at": "datetime, timestamp when task was last updated"
}
```

### Relationships
- Task.user_id → User.id (foreign key relationship)
- Each task belongs to exactly one user
- A user can have zero or many tasks

## API Endpoints
All endpoints require JWT authentication and user identification via URL parameter.

### GET `/api/{user_id}/tasks`
- **Description**: Retrieve all tasks belonging to a user
- **Authentication**: JWT token required
- **Authorization**: User must match the {user_id} in URL
- **Request**: 
  - Headers: `Authorization: Bearer {token}`
- **Response**:
  - 200: Array of task objects
  - 401: Unauthorized (invalid/expired token)
  - 403: Forbidden (user mismatch)
  - 404: User not found

### POST `/api/{user_id}/tasks`
- **Description**: Create a new task for the user
- **Authentication**: JWT token required
- **Authorization**: User must match the {user_id} in URL
- **Request**: 
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ "title": "string", "description": "string", "completed": false }`
- **Response**:
  - 201: Created task object
  - 400: Invalid request body
  - 401: Unauthorized
  - 403: Forbidden (user mismatch)

### GET `/api/{user_id}/tasks/{task_id}`
- **Description**: Retrieve a specific task for the user
- **Authentication**: JWT token required
- **Authorization**: User must match the {user_id} in URL and own the task
- **Request**: 
  - Headers: `Authorization: Bearer {token}`
- **Response**:
  - 200: Single task object
  - 401: Unauthorized
  - 403: Forbidden (user mismatch or task not owned)
  - 404: Task not found

### PUT `/api/{user_id}/tasks/{task_id}`
- **Description**: Update a specific task for the user
- **Authentication**: JWT token required
- **Authorization**: User must match the {user_id} in URL and own the task
- **Request**: 
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ "title": "string", "description": "string", "completed": boolean }`
- **Response**:
  - 200: Updated task object
  - 400: Invalid request body
  - 401: Unauthorized
  - 403: Forbidden (user mismatch or task not owned)
  - 404: Task not found

### PATCH `/api/{user_id}/tasks/{task_id}/complete`
- **Description**: Toggle or set completion status of a task
- **Authentication**: JWT token required
- **Authorization**: User must match the {user_id} in URL and own the task
- **Request**: 
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ "completed": true/false }`
- **Response**:
  - 200: Updated task object
  - 400: Invalid request body
  - 401: Unauthorized
  - 403: Forbidden (user mismatch or task not owned)
  - 404: Task not found

### DELETE `/api/{user_id}/tasks/{task_id}`
- **Description**: Delete a specific task for the user
- **Authentication**: JWT token required
- **Authorization**: User must match the {user_id} in URL and own the task
- **Request**: 
  - Headers: `Authorization: Bearer {token}`
- **Response**:
  - 204: Success (no content)
  - 401: Unauthorized
  - 403: Forbidden (user mismatch or task not owned)
  - 404: Task not found

## Business Logic
1. Users can only access tasks associated with their user_id
2. Creating a task automatically assigns the authenticated user's ID
3. Updating user_id is not permitted after creation
4. All timestamps are in UTC
5. Completed status can be toggled independently of other fields

## Validation Rules
- Title: Required, 1-255 characters
- Description: Optional, max 1000 characters
- Completed: Boolean, defaults to false
- All responses return JSON format
- All datetime fields use ISO 8601 format