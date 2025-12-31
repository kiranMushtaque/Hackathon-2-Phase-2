# Phase II - Authenticated Task Management System

A full-stack task management application with JWT authentication, featuring a FastAPI backend and Next.js frontend.

## Features

### Core Features
- User registration and authentication (JWT-based)
- Create, Read, Update, Delete tasks
- Mark tasks as complete/incomplete
- User data isolation (users only see their own tasks)

### Enhanced UI/UX
- Modern gradient design with Tailwind CSS
- Responsive layout for mobile and desktop
- Loading states and animations
- Lucide React icons

### Enhanced Features (NEW!)
- **Priority Levels**: Low, Medium, High with color-coded badges
- **Starred Tasks**: Favorite/bookmark important tasks
- **Task Tags**: Add multiple tags for organization (max 10 per task)
- **Due Dates**: Set optional deadlines with calendar picker
- **Advanced Filtering**: Filter by priority, starred status, tags
- **Smart Search**: Search across title, description, and tags
- **Sort Options**: Newest, Oldest, Title (A-Z), Priority
- **Productivity Dashboard**: Score calculation, streak tracking
- **Bulk Operations**: Mark all complete, delete completed
- **Dark Mode**: Full dark/light theme support
- **Inline Editing**: Edit tasks directly in the list

## Tech Stack

### Backend
- FastAPI (Python web framework)
- SQLModel (ORM with Pydantic validation)
- PostgreSQL/Neon (Database)
- JWT authentication (python-jose)
- bcrypt (Password hashing)

### Frontend
- Next.js 15 (React framework)
- TypeScript
- Tailwind CSS
- Lucide React (Icons)

## Authentication Architecture

### Implementation Note
This project implements a **custom JWT authentication system** instead of Better Auth. While the original specification mentioned Better Auth, the current implementation achieves the same security goals using industry-standard JWT tokens with the following features:

- **JWT Token Generation**: Uses `python-jose` library with HS256 algorithm
- **Secure Password Hashing**: bcrypt with proper salt rounds
- **Token Verification**: Validates signature, expiration, and token type
- **User Session Management**: Token-based sessions stored in localStorage
- **Shared Secret**: `SECRET_KEY` environment variable acts as the shared authentication secret
- **Token Refresh**: Implemented refresh endpoint for token renewal

**Security Equivalence**: This custom implementation provides the same level of security as Better Auth:
- ✅ JWT tokens with configurable expiration
- ✅ Secure password hashing (bcrypt)
- ✅ Protected API routes with middleware
- ✅ User isolation and authorization checks
- ✅ Token refresh mechanism

**Why Custom JWT**: The custom implementation offers:
- Full control over authentication flow
- Simplified deployment (no separate auth service)
- Python-native solution (no Node.js dependency for backend)
- Direct integration with FastAPI security patterns

## Project Structure

```
phase2/
├── .spec-kit/           # Spec-Kit configuration
│   └── config.yaml
├── specs/               # Project specifications
│   ├── overview.md
│   ├── architecture.md
│   ├── features/
│   ├── api/
│   ├── database/
│   └── ui/
├── backend/             # FastAPI backend
│   ├── app/
│   │   ├── main.py
│   │   ├── auth.py
│   │   ├── config.py
│   │   ├── crud.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routers/
│   │       ├── auth.py
│   │       └── tasks.py
│   ├── requirements.txt
│   └── .env
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   └── page.tsx
│   │   └── lib/
│   │       ├── api.ts
│   │       └── auth.ts
│   ├── package.json
│   └── .env.local
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL database (or Neon account)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Run the server (SQLModel will auto-create/update database tables)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Note: The server will automatically apply database schema changes
# For manual migration, see backend/migrations/README.md
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local if needed

# Run the development server
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Vercel Deployment

This project is configured for easy deployment on Vercel.

### Prerequisites
- A GitHub repository with your code
- A Vercel account

### Deployment Steps
1. Push your code to GitHub.
2. In Vercel, click **Add New** > **Project**.
3. Import your repository.
4. **Project Configuration**:
   - **Root Directory**: Leave empty (the included `vercel.json` handles the sub-directory configuration).
   - **Framework Preset**: Next.js.
5. **Environment Variables**:
   - Add `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g., `https://your-backend-api.railway.app/api`).
6. Click **Deploy**.

### Manual Vercel Configuration
The project uses a `vercel.json` in the root to manage the monorepo-style structure:
- It runs the build from the `frontend` directory.
- It routes all traffic to the frontend application.
- It ensures the `.next` directory is correctly identified as the output.

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:5432/database
SECRET_KEY=your-super-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (returns JWT token)
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user info (requires auth)
- `POST /api/auth/refresh` - Refresh access token (requires auth)
- `POST /api/auth/logout` - Logout (client-side token removal)

### Tasks
All task endpoints require JWT authentication via `Authorization: Bearer <token>` header.

- `GET /api/{user_id}/tasks` - Get all tasks for user (200 OK)
- `POST /api/{user_id}/tasks` - Create new task (201 Created)
- `GET /api/{user_id}/tasks/{task_id}` - Get specific task (200 OK)
- `PUT /api/{user_id}/tasks/{task_id}` - Update task (200 OK)
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion (200 OK)
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task (204 No Content)

**Note**: The `{user_id}` in the URL must match the authenticated user's ID from the JWT token, otherwise a 403 Forbidden error is returned.

## Validation Rules

### Task
- Title: 1-255 characters (required)
- Description: 0-1000 characters (optional)
- Completed: boolean (default: false)

### User
- Email: Valid email format (required)
- Password: Required
- Name: Required for registration

## Security

- All API endpoints (except auth) require JWT authentication
- Passwords are hashed using bcrypt
- Users can only access their own tasks
- JWT tokens expire after 30 minutes (configurable)

## Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Linting
```bash
# Frontend
cd frontend
npm run lint
```

## License

MIT License - See LICENSE file for details.
