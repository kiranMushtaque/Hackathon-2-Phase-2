# Database Migrations

## How to Run Migrations

### Option 1: Using psql (PostgreSQL CLI)
```bash
psql $DATABASE_URL < migrations/001_add_enhanced_task_fields.sql
```

### Option 2: Using Python script
```bash
python run_migrations.py
```

### Option 3: Auto-migration (SQLModel)
The SQLModel ORM will automatically create/update tables when you start the application.
Simply restart your FastAPI server:
```bash
uvicorn app.main:app --reload
```

## Migration Files

- `001_add_enhanced_task_fields.sql` - Adds priority, starred, tags, and due_date fields to tasks table

## Notes

- SQLModel will automatically detect schema changes and update the database
- Manual migrations are only needed if you want explicit control
- Always backup your database before running migrations in production
