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

### Bonus Features
- Task search functionality
- Filter by status (All, Active, Completed)
- Sort by date or title
- Statistics dashboard (total, active, completed, completion rate)
- Inline task editing

## Tech Stack

### Backend
- FastAPI (Python web framework)
- SQLModel (ORM with Pydantic validation)
- PostgreSQL/Neon (Database)
- JWT authentication (python-jose)
- bcrypt (Password hashing)

### Frontend
- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS
- Lucide React (Icons)

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

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
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
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### Tasks
- `GET /api/{user_id}/tasks` - Get all tasks for user
- `POST /api/{user_id}/tasks` - Create new task
- `GET /api/{user_id}/tasks/{task_id}` - Get specific task
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task

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
