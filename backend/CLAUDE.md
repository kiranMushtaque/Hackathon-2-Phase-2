# Backend Development Instructions

## Technology Stack
- FastAPI
- SQLModel
- PostgreSQL/Neon
- Better Auth
- JWT Authentication

## Key Principles
1. All endpoints require authentication
2. User data isolation - users can only access their own tasks
3. Follow `/api/{user_id}/tasks` endpoint pattern
4. Comprehensive error handling
5. Input validation for all endpoints

## File Structure
- `main.py` - Application entry point
- `models.py` - Database models
- `routes/` - API route handlers
- `db.py` - Database configuration
- `requirements.txt` - Python dependencies

## Development
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
