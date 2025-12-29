# API Specification - Task Management API

## Overview
This document defines the complete API specification for the authenticated task management system. All endpoints require JWT authentication and enforce user isolation.

## Base URL
```
http://localhost:8000/api/{user_id}/
```

## Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer {jwt_token}
```

## Common Response Format
All successful responses return JSON format with appropriate HTTP status codes.

### Error Responses
```json
{
  "detail": "Error message"
}
```

## Endpoints

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
- **Validation**:
  - Title: Required, 1-255 characters
  - Description: Optional, max 1000 characters
  - Completed: Boolean, defaults to false

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
- **Validation**:
  - Title: 1-255 characters if provided
  - Description: max 1000 characters if provided
  - Completed: Boolean if provided

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

## Task Object Structure
```json
{
  "id": integer,
  "title": string,
  "description": string,
  "completed": boolean,
  "user_id": integer,
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

## Business Logic
1. Users can only access tasks associated with their user_id
2. Creating a task automatically assigns the authenticated user's ID
3. Updating user_id is not permitted after creation
4. All timestamps are in UTC
5. Completed status can be toggled independently of other fields