# Authentication API Specification

## Overview
This document specifies the authentication API endpoints for the Hackathon II - The Evolution of Todo application using Better Auth with JWT plugin.

## Base URL
All API endpoints are relative to: `http://localhost:8000/api/auth`

## Authentication Endpoints

### Login
```
POST /login
```

#### Request
- Headers:
  - `Content-Type: application/json`
- Body:
```json
{
  "user_id": "user123",
  "password": "user_password"
}
```

#### Response
- Status: `200 OK`
- Body:
```json
{
  "access_token": "jwt_token_string",
  "token_type": "bearer",
  "user": {
    "id": "user123",
    "email": "user123@example.com"
  }
}
```

### Get Current User
```
GET /me
```

#### Headers
- `Authorization: Bearer <token>`

#### Response
- Status: `200 OK`
- Body:
```json
{
  "id": "user123",
  "email": "user123@example.com"
}
```

### Logout
```
POST /logout
```

#### Headers
- `Authorization: Bearer <token>`

#### Response
- Status: `200 OK`
- Body:
```json
{
  "message": "Logged out successfully"
}
```

### Refresh Token
```
POST /refresh
```

#### Headers
- `Authorization: Bearer <expired_token>`

#### Response
- Status: `200 OK`
- Body:
```json
{
  "access_token": "new_jwt_token_string",
  "token_type": "bearer"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Request body validation error"
}
```

### 401 Unauthorized
```json
{
  "detail": "Incorrect username or password"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Security Considerations
- All authentication tokens must be transmitted over HTTPS
- JWT tokens should have appropriate expiration times
- Refresh tokens should be stored securely
- Passwords must be hashed using bcrypt or similar
- Session management should follow best practices