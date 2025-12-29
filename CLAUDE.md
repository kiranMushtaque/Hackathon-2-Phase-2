# Claude Instructions for Hackathon II - The Evolution of Todo

## Project Overview
This project implements a spec-driven task management system with two phases:
- **Phase I**: Python console application with in-memory storage
- **Phase II**: Authenticated API with Better Auth integration

## Constitution-Based Development
All changes must align with the project constitution which prioritizes:
1. Security First: All data access is protected by authentication and authorization checks
2. User Privacy: Each user only accesses their own data
3. Scalability: Designed to handle increasing number of users and tasks
4. Maintainability: Clean, well-documented code following best practices
5. Spec Compliance: Strict adherence to defined specifications and requirements

## Development Guidelines

### Phase I Requirements
- Technology Stack: Python 3.13+, UV package manager, Claude Code + Spec-Kit Plus
- In-memory console application
- 5 Basic Features: Add Task, Delete Task, Update Task, View Task List, Mark as Complete/Incomplete
- All code in `/src/` folder
- Validation: Title (1-255 chars), Description (max 1000 chars), Completed (boolean)

### Phase II Requirements
- FastAPI-based authenticated API
- Better Auth integration for user authentication
- SQLModel for database operations
- PostgreSQL/Neon database
- JWT-based middleware
- User isolation: Users can only access their own tasks
- API endpoints follow `/api/{user_id}/tasks` pattern

### Code Standards
- Follow PEP 8 style guidelines
- Include comprehensive docstrings
- Implement proper error handling
- Use type hints where appropriate
- Maintain consistency with existing code patterns
- Write unit tests for critical functionality

### File Structure
```
/
├── .spec-kit/          # Spec-Kit configuration
├── specs/              # Complete specifications
│   ├── overview.md
│   ├── features/
│   ├── api/
│   ├── database/
│   └── ui/
├── constitution.md     # Project constitution
├── CLAUDE.md           # This file
├── src/                # Python source code (Phase I)
├── backend/            # FastAPI backend (Phase II)
├── frontend/           # Next.js frontend (Phase II)
└── README.md           # Setup instructions
```

### Security Requirements
- Never expose secrets in code
- Validate all user inputs
- Implement proper authentication checks
- Follow secure coding practices
- Ensure user data isolation

### Spec-Driven Development Process
1. Read and understand the relevant specifications in `/specs/`
2. Follow the project constitution for architectural decisions
3. Implement features according to spec requirements
4. Validate implementation against specifications
5. Update documentation as needed

## Working with Claude Code
- Use Claude Code for all development tasks
- Follow the spec-driven approach
- Maintain consistency with existing codebase
- When uncertain, refer to specifications and constitution
- Prioritize security and user privacy in all implementations