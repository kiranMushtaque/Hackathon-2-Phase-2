# Authentication Feature Specification

## Overview
This document defines the requirements for JWT-based authentication middleware that verifies tokens using BETTER_AUTH_SECRET. All API endpoints require authentication to ensure user privacy and data security.

## Authentication Flow
1. User authenticates via Better Auth mechanism (existing)
2. Server generates/validates JWT token using BETTER_AUTH_SECRET
3. Client includes JWT token in Authorization header for API requests
4. JWT middleware validates token and extracts user identity
5. Route handlers verify user permissions based on extracted identity

## JWT Token Structure
### Payload
```json
{
  "sub": "user_id (string)",
  "iat": "issued at timestamp (number)",
  "exp": "expiration timestamp (number)", 
  "user_id": "authenticated user ID (number)"
}
```

### Algorithm
- Algorithm: HS256 (HMAC with SHA-256)
- Secret: Process environment variable `BETTER_AUTH_SECRET`

## Middleware Implementation
### JWT Authentication Middleware
- **Purpose**: Verify JWT token and extract user identity
- **Location**: `backend/middleware/jwt_middleware.py`
- **Function**: `verify_token(request)` -> `user_id` or raise HTTPException

### Verification Steps
1. Extract `Authorization` header from request
2. Validate header format (`Bearer {token}`)
3. Decode and verify JWT signature using `BETTER_AUTH_SECRET`
4. Check token expiration
5. Extract and return user_id from payload
6. Raise 401 exception if verification fails

## Integration Points
### API Routes
- Every protected route calls JWT middleware
- Route parameters validated against authenticated user_id
- User ownership verified before allowing operations

### Frontend Integration  
- Automatically attach `Authorization: Bearer {token}` header
- Token retrieved from Better Auth client session
- Handle 401 responses with proper session refresh

## Error Handling
### 401 Unauthorized Scenarios
- Missing Authorization header
- Malformed Authorization header (not "Bearer {token}")
- Invalid JWT signature
- Expired token
- Invalid token payload

### 403 Forbidden Scenarios  
- Valid token but user_id in token doesn't match URL parameter
- User trying to access resources they don't own

## Security Requirements
1. All secrets stored in environment variables
2. Tokens have reasonable expiration times (1hr default)
3. No sensitive data in JWT payloads
4. Proper HTTPS in production deployment
5. Constant-time comparison for token validation
6. Adequate entropy in secret keys

## Dependencies
- `python-jose[cryptography]` for JWT operations
- `fastapi` and `starlette` for HTTP exceptions
- `better-auth` for user session management

## Configuration
### Environment Variables
- `BETTER_AUTH_SECRET`: Secret key for signing JWT tokens
- `JWT_EXPIRATION_HOURS`: Token expiration duration in hours (default: 1)

### Default Behavior
- Tokens expire after 1 hour
- No refresh token mechanism (rely on Better Auth sessions)
- All API routes protected by default