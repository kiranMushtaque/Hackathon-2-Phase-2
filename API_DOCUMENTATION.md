# Task Manager API Documentation - Phase II

## Base URLs

- **Development**: `http://localhost:8000`
- **Production**: `https://your-backend-domain.com`
- **API Base Path**: `/api`

## Authentication

All protected endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

### Token Structure
JWT tokens contain the following payload:
```json
{
  "sub": "user_id",
  "iat": 1234567890,
  "exp": 1234567890,
  "type": "access"
}
```

### Token Expiration
- Default: 30 minutes (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)
- Use the `/api/auth/refresh` endpoint to get a new token

---

## Authentication Endpoints

### Register User
Create a new user account and receive an authentication token.

**Endpoint**: `POST /api/auth/register`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Success Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Email already registered
  ```json
  {
    "detail": "Email already registered"
  }
  ```

**Example**:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'
```

---

### Login
Authenticate an existing user and receive an authentication token.

**Endpoint**: `POST /api/auth/login`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
  ```json
  {
    "detail": "Incorrect email or password"
  }
  ```

**Example**:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

---

### Get Current User
Retrieve information about the currently authenticated user.

**Endpoint**: `GET /api/auth/me`

**Request Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired token
  ```json
  {
    "detail": "Invalid token"
  }
  ```

**Example**:
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Refresh Token
Get a new access token using your current (soon-to-expire or recently expired) token.

**Endpoint**: `POST /api/auth/refresh`

**Request Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid token
- `404 Not Found`: User not found

**Example**:
```bash
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Logout
Logout endpoint (token removal happens client-side).

**Endpoint**: `POST /api/auth/logout`

**Success Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

**Note**: This endpoint doesn't invalidate the token server-side. The client should remove the token from storage.

---

## Task Endpoints

All task endpoints require authentication and verify that the `{user_id}` in the URL matches the authenticated user's ID.

### List Tasks
Retrieve all tasks for the authenticated user.

**Endpoint**: `GET /api/{user_id}/tasks`

**Request Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `skip` (optional): Number of tasks to skip (default: 0)
- `limit` (optional): Maximum number of tasks to return (default: 100)

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive API docs",
    "completed": false,
    "user_id": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "title": "Review pull requests",
    "description": null,
    "completed": true,
    "user_id": 1,
    "created_at": "2024-01-14T09:15:00Z",
    "updated_at": "2024-01-15T11:45:00Z"
  }
]
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User ID mismatch
  ```json
  {
    "detail": "Not authorized to access these tasks"
  }
  ```

**Example**:
```bash
curl -X GET http://localhost:8000/api/1/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Create Task
Create a new task for the authenticated user.

**Endpoint**: `POST /api/{user_id}/tasks`

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "completed": false
}
```

**Field Validations**:
- `title`: Required, 1-255 characters
- `description`: Optional, max 1000 characters
- `completed`: Optional, boolean (default: false)

**Success Response** (201 Created):
```json
{
  "id": 3,
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "completed": false,
  "user_id": 1,
  "created_at": "2024-01-15T12:00:00Z",
  "updated_at": "2024-01-15T12:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
  ```json
  {
    "detail": "Title must be between 1 and 255 characters"
  }
  ```
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User ID mismatch
  ```json
  {
    "detail": "Not authorized to create tasks for this user"
  }
  ```

**Example**:
```bash
curl -X POST http://localhost:8000/api/1/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive API docs"
  }'
```

---

### Get Single Task
Retrieve a specific task by ID.

**Endpoint**: `GET /api/{user_id}/tasks/{task_id}`

**Request Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "completed": false,
  "user_id": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User ID mismatch or task doesn't belong to user
  ```json
  {
    "detail": "Not authorized to access this task"
  }
  ```
- `404 Not Found`: Task not found
  ```json
  {
    "detail": "Task not found"
  }
  ```

**Example**:
```bash
curl -X GET http://localhost:8000/api/1/tasks/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Update Task
Update an existing task.

**Endpoint**: `PUT /api/{user_id}/tasks/{task_id}`

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "completed": true
}
```

**Field Validations**:
- `title`: If provided, 1-255 characters
- `description`: If provided, max 1000 characters
- `completed`: If provided, boolean

**Success Response** (200 OK):
```json
{
  "id": 1,
  "title": "Updated task title",
  "description": "Updated description",
  "completed": true,
  "user_id": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T14:20:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
  ```json
  {
    "detail": "Title must be between 1 and 255 characters"
  }
  ```
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User ID mismatch or task doesn't belong to user
- `404 Not Found`: Task not found

**Example**:
```bash
curl -X PUT http://localhost:8000/api/1/tasks/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated task title",
    "completed": true
  }'
```

---

### Toggle Task Completion
Update only the completion status of a task.

**Endpoint**: `PATCH /api/{user_id}/tasks/{task_id}/complete`

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "completed": true
}
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "completed": true,
  "user_id": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T15:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Missing completed field
  ```json
  {
    "detail": "Completed field is required"
  }
  ```
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User ID mismatch or task doesn't belong to user
- `404 Not Found`: Task not found

**Example**:
```bash
curl -X PATCH http://localhost:8000/api/1/tasks/1/complete \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
```

---

### Delete Task
Delete a task permanently.

**Endpoint**: `DELETE /api/{user_id}/tasks/{task_id}`

**Request Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (204 No Content):
No response body.

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User ID mismatch or task doesn't belong to user
  ```json
  {
    "detail": "Not authorized to delete this task"
  }
  ```
- `404 Not Found`: Task not found
  ```json
  {
    "detail": "Task not found"
  }
  ```

**Example**:
```bash
curl -X DELETE http://localhost:8000/api/1/tasks/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Common Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no response body |
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing, invalid, or expired token |
| 403 | Forbidden | Authenticated but not authorized for this resource |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

---

## Error Response Format

All error responses follow this format:

```json
{
  "detail": "Human-readable error message"
}
```

Examples:
```json
{
  "detail": "Not authenticated"
}
```

```json
{
  "detail": "Title must be between 1 and 255 characters"
}
```

---

## Data Models

### User
```typescript
{
  id: number;
  email: string;
  name: string;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}
```

### Task
```typescript
{
  id: number;
  title: string;          // 1-255 characters
  description: string | null;  // max 1000 characters
  completed: boolean;
  user_id: number;
  created_at: string;     // ISO 8601 datetime
  updated_at: string;     // ISO 8601 datetime
}
```

### Token Response
```typescript
{
  access_token: string;
  token_type: "bearer";
  user: User;
}
```

---

## Authentication Flow

### Registration Flow
1. Client sends POST to `/api/auth/register` with email, password, name
2. Server validates input
3. Server hashes password with bcrypt
4. Server creates user in database
5. Server generates JWT token
6. Server returns token and user info
7. Client stores token (localStorage)
8. Client includes token in subsequent requests

### Login Flow
1. Client sends POST to `/api/auth/login` with email, password
2. Server validates credentials
3. Server verifies password hash
4. Server generates JWT token
5. Server returns token and user info
6. Client stores token (localStorage)
7. Client includes token in subsequent requests

### Protected Request Flow
1. Client includes token in Authorization header
2. Server extracts and verifies JWT signature
3. Server checks token expiration
4. Server extracts user_id from token
5. Server verifies user_id matches URL parameter (for task endpoints)
6. Server processes request
7. Server returns response

### Token Refresh Flow
1. Client detects token near expiration (or expired with 401)
2. Client sends POST to `/api/auth/refresh` with current token
3. Server validates current token
4. Server generates new JWT token
5. Server returns new token
6. Client updates stored token

---

## Rate Limiting

Currently, no rate limiting is implemented. For production:

**Recommended Limits**:
- Authentication endpoints: 5 requests per minute per IP
- Task endpoints: 100 requests per minute per user
- Consider using libraries like `slowapi` or `fastapi-limiter`

---

## CORS Configuration

The API is configured with CORS to allow requests from:
- Development: `http://localhost:3000`
- Production: Configure via environment or update `main.py`

To modify CORS origins:
```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Interactive API Documentation

The API provides interactive documentation via Swagger UI:

**URL**: `http://localhost:8000/docs`

Features:
- Try out all endpoints directly in the browser
- See request/response schemas
- Test authentication flow
- View all available parameters

Alternative documentation (ReDoc):
**URL**: `http://localhost:8000/redoc`

---

## SDK / Client Libraries

### JavaScript/TypeScript Client

The frontend includes a ready-to-use API client:

```typescript
// frontend/src/lib/api.ts
import { apiClient } from '@/lib/api';

// Login
const response = await apiClient.login({
  email: 'user@example.com',
  password: 'password123'
});

// Get tasks
const tasks = await apiClient.getTasks(userId);

// Create task
const newTask = await apiClient.createTask(userId, {
  title: 'New task',
  description: 'Task description'
});

// Update task
const updated = await apiClient.updateTask(userId, taskId, {
  title: 'Updated title',
  completed: true
});

// Delete task
await apiClient.deleteTask(userId, taskId);
```

### Python Client Example

```python
import requests

BASE_URL = "http://localhost:8000/api"

# Login
response = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "user@example.com",
    "password": "password123"
})
token = response.json()["access_token"]

# Get tasks
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(f"{BASE_URL}/1/tasks", headers=headers)
tasks = response.json()

# Create task
response = requests.post(
    f"{BASE_URL}/1/tasks",
    headers=headers,
    json={"title": "New task", "description": "Description"}
)
new_task = response.json()
```

---

## Security Best Practices

### For API Consumers

1. **Store tokens securely**:
   - Use `localStorage` or `sessionStorage` (not cookies for JWT)
   - Clear token on logout
   - Never expose token in URLs

2. **Handle token expiration**:
   - Implement automatic refresh before expiration
   - Redirect to login on 401 responses
   - Show appropriate error messages

3. **Validate input client-side**:
   - Check field lengths before sending
   - Validate email format
   - Provide immediate user feedback

4. **Use HTTPS in production**:
   - Never send tokens over HTTP
   - Ensure all API calls use HTTPS

### For API Maintainers

1. **Rotate secrets regularly**:
   - Change `SECRET_KEY` periodically
   - Use strong random values (min 32 chars)

2. **Monitor for abuse**:
   - Implement rate limiting
   - Log suspicious activity
   - Monitor failed login attempts

3. **Keep dependencies updated**:
   - Regularly update FastAPI, SQLModel, etc.
   - Monitor security advisories

4. **Database security**:
   - Use connection pooling
   - Enable SSL for database connections
   - Regular backups

---

## Troubleshooting

### Common Issues

**401 Unauthorized**
- Token expired: Use `/api/auth/refresh`
- Token invalid: Login again
- Token not sent: Check Authorization header

**403 Forbidden**
- User ID mismatch: Ensure URL user_id matches authenticated user
- Task ownership: User doesn't own this task

**400 Bad Request**
- Validation error: Check field constraints
- Missing required fields: Include all required fields
- Invalid format: Ensure JSON is valid

**CORS Error**
- Origin not allowed: Update CORS settings in backend
- Missing Authorization header: Ensure header is set
- Preflight failed: Check OPTIONS request handling

---

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- User registration and authentication
- Full CRUD operations for tasks
- JWT token-based authentication
- Token refresh endpoint
- User isolation and security

### Planned Features
- Task tags/categories
- Task due dates
- Task priorities
- Shared tasks
- Task attachments
- Email notifications
- Webhooks

---

## Support

For issues, questions, or feature requests:
- GitHub Issues: [your-repo-url]
- Email: support@your-domain.com
- Documentation: [your-docs-url]

---

## License

MIT License - See LICENSE file for details.
