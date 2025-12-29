# Project Overview - Hackathon II - The Evolution of Todo

## Current Phase: Phase II - Authenticated Web API

## Project Mission
Build a secure, authenticated task management system that enables users to manage their personal tasks with privacy and security as top priorities.

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL (Neon)
- **ORM**: SQLModel
- **Authentication**: Better Auth with JWT

### Frontend
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: React Hooks

## Core Features

### Authentication
- User registration with email/password
- User login with JWT tokens
- Session management
- Protected API routes

### Task Management
- Create tasks with title and description
- View all user tasks
- Update task details
- Mark tasks complete/incomplete
- Delete tasks
- Filter and search tasks

## Security Principles

1. **User Isolation**: Each user only accesses their own data
2. **JWT Authentication**: All API endpoints protected
3. **Input Validation**: Server-side validation on all inputs
4. **Secure Storage**: Passwords hashed with bcrypt

## Project Structure

```
phase2/
├── .spec-kit/           # Spec-Kit configuration
├── specs/               # Project specifications
├── backend/             # FastAPI application
├── frontend/            # Next.js application
├── CLAUDE.md            # AI assistant instructions
└── README.md            # Setup documentation
```

## Development Workflow

1. Read specifications in `/specs/`
2. Follow patterns in `CLAUDE.md` files
3. Implement according to spec requirements
4. Test all functionality
5. Update documentation
