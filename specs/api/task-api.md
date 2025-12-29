# Task API Specification

## Overview
This document specifies the API endpoints for task management operations in the Hackathon II - The Evolution of Todo application.

## Base URL
All API endpoints are relative to: `http://localhost:8000/api`

## Authentication
All endpoints require JWT authentication in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Create Task
```
POST /{user_id}/tasks
```

#### Request
- Headers:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body:
```json
{
  "title": "Task title (1-255 chars)",
  "description": "Optional task description (max 1000 chars)"
}
```

#### Response
- Status: `200 OK`
- Body:
```json
{
  "id": 1,
  "title": "Task title",
  "description": "Task description",
  "completed": false,
  "user_id": "user123",
  "created_at": "2023-12-14T10:30:00Z",
  "updated_at": "2023-12-14T10:30:00Z"
}
```

### Get All Tasks
```
GET /{user_id}/tasks
```

#### Query Parameters
- `skip`: Number of tasks to skip (default: 0)
- `limit`: Maximum number of tasks to return (default: 100, max: 1000)

#### Response
- Status: `200 OK`
- Body:
```json
[
  {
    "id": 1,
    "title": "Task title",
    "description": "Task description",
    "completed": false,
    "user_id": "user123",
    "created_at": "2023-12-14T10:30:00Z",
    "updated_at": "2023-12-14T10:30:00Z"
  }
]
```

### Get Single Task
```
GET /{user_id}/tasks/{task_id}
```

#### Response
- Status: `200 OK`
- Body:
```json
{
  "id": 1,
  "title": "Task title",
  "description": "Task description",
  "completed": false,
  "user_id": "user123",
  "created_at": "2023-12-14T10:30:00Z",
  "updated_at": "2023-12-14T10:30:00Z"
}
```

### Update Task
```
PUT /{user_id}/tasks/{task_id}
```

#### Request
- Headers:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body (all fields optional):
```json
{
  "title": "Updated task title",
  "description": "Updated task description",
  "completed": true
}
```

#### Response
- Status: `200 OK`
- Body:
```json
{
  "id": 1,
  "title": "Updated task title",
  "description": "Updated task description",
  "completed": true,
  "user_id": "user123",
  "created_at": "2023-12-14T10:30:00Z",
  "updated_at": "2023-12-14T11:00:00Z"
}
```

### Delete Task
```
DELETE /{user_id}/tasks/{task_id}
```

#### Response
- Status: `200 OK`
- Body:
```json
{
  "message": "Task deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Error message explaining the validation issue"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Not authorized to access these tasks"
}
```

### 404 Not Found
```json
{
  "detail": "Task not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Validation Rules
- Title: 1-255 characters
- Description: 0-1000 characters
- User ID in URL must match authenticated user
- Task ID must exist and belong to the user