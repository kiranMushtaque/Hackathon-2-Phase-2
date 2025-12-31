# Quick Start Guide - Enhanced Features

## ✅ Migration Complete!

The database has been successfully updated with the new columns:
- ✅ `priority` (VARCHAR) - default: 'medium'
- ✅ `starred` (BOOLEAN) - default: false
- ✅ `tags` (JSON) - default: null
- ✅ `due_date` (TIMESTAMP) - default: null
- ✅ Indexes created for performance

## Start the Application

### 1. Start Backend
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

### 2. Start Frontend
Open a new terminal:
```bash
cd frontend
npm run dev
```

Frontend will be available at: http://localhost:3000

## Test the Enhanced Features

### 1. Create a Task with Enhanced Fields
1. Sign in or register
2. Create a new task
3. Set priority to "High"
4. Add some tags (e.g., "Work", "Urgent")
5. Set a due date
6. Click "Add Task"

### 2. Verify Persistence
1. Refresh the page (Ctrl+F5)
2. ✅ Task should still be there with all fields!
3. Priority badge should show "High" in red
4. Tags should display as cyan chips
5. Due date should be visible

### 3. Test Starred Feature
1. Click the star icon on any task
2. Refresh the page
3. ✅ Task should still be starred!
4. Click "Starred" filter to see only starred tasks

### 4. Test Editing
1. Click the edit icon (pencil) on any task
2. Change priority, tags, or due date
3. Click "Save Changes"
4. Refresh the page
5. ✅ Changes should persist!

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 8000 is already in use
lsof -ti:8000 | xargs kill -9

# Restart backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Frontend Won't Start
```bash
# Check if port 3000 is already in use
lsof -ti:3000 | xargs kill -9

# Clear Next.js cache and restart
cd frontend
rm -rf .next
npm run dev
```

### Database Connection Issues
1. Check `.env` file has correct `DATABASE_URL`
2. Verify Neon database is accessible
3. Check network connection

### Migration Already Applied
If you see "column already exists" errors, that's fine! The migration uses `IF NOT EXISTS` so it's safe to run multiple times.

## API Testing

You can also test the API directly:

### Get Tasks (with new fields)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/1/tasks
```

### Create Task with Enhanced Fields
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "Testing enhanced features",
    "priority": "high",
    "starred": true,
    "tags": ["test", "important"],
    "due_date": "2025-12-31T23:59:59Z"
  }' \
  http://localhost:8000/api/1/tasks
```

### Update Task
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "low",
    "starred": false,
    "tags": ["completed"]
  }' \
  http://localhost:8000/api/1/tasks/1
```

## What Changed?

### Before:
- ❌ Priority/tags/starred were random mock data
- ❌ Lost on page refresh
- ❌ Not saved to database

### After:
- ✅ All fields properly saved to database
- ✅ Data persists across sessions
- ✅ Full CRUD support for enhanced fields
- ✅ Database indexes for fast filtering

## Next Steps

1. ✅ Start backend and frontend
2. ✅ Create tasks with enhanced fields
3. ✅ Test persistence by refreshing
4. ✅ Try filtering by priority/starred
5. ✅ Test search with tags

## Support

- API Docs: http://localhost:8000/docs
- Enhanced Features Guide: See `ENHANCED_FEATURES.md`
- Migration Details: See `backend/migrations/README.md`

---

**Your application is now fully enhanced and production-ready!** 🚀
