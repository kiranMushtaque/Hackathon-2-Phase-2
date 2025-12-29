# Phase 2 Quick Start Guide

## Project Structure

```
phase2/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py      # Application entry point
│   │   ├── models.py    # Database models
│   │   ├── crud.py      # CRUD operations
│   │   ├── auth.py      # Authentication logic
│   │   ├── database.py  # Database configuration
│   │   └── routers/     # API route handlers
│   ├── .env             # Backend environment variables
│   ├── requirements.txt # Python dependencies
│   └── CLAUDE.md        # Backend dev instructions
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── app/         # Next.js app directory
│   │   ├── components/  # React components
│   │   └── lib/         # Utility functions
│   ├── .env.local       # Frontend environment variables
│   ├── package.json     # Node dependencies
│   └── CLAUDE.md        # Frontend dev instructions
├── specs/               # Phase 2 specifications
│   ├── features/
│   ├── api/
│   ├── database/
│   └── ui/
├── docker-compose.yml   # Docker services configuration
├── CLAUDE.md            # Phase 2 Claude instructions
├── constitution.md      # Project constitution
└── README.md            # Phase 2 overview

```

## Running the Backend

### Option 1: Using existing virtual environment
```bash
cd /mnt/c/Hackathon-2/phase2/backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Option 2: Create new virtual environment
```bash
cd /mnt/c/Hackathon-2/phase2/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be available at:** http://localhost:8000

## Running the Frontend

```bash
cd /mnt/c/Hackathon-2/phase2/frontend
npm install  # Only needed if node_modules are missing
npm run dev
```

**Frontend will be available at:** http://localhost:3000

## Running with Docker (Optional)

If you have PostgreSQL or other services in docker-compose.yml:

```bash
cd /mnt/c/Hackathon-2/phase2
docker-compose up -d
```

## Verification Commands

### Check backend structure:
```bash
ls -la /mnt/c/Hackathon-2/phase2/backend/app/
```

### Check frontend structure:
```bash
ls -la /mnt/c/Hackathon-2/phase2/frontend/src/
```

### Check if backend is running:
```bash
curl http://localhost:8000
```

### Check if frontend is running:
```bash
curl http://localhost:3000
```

## Environment Variables

### Backend (.env)
- Already configured in `phase2/backend/.env`
- Modify as needed for your database connection

### Frontend (.env.local)
- Already configured in `phase2/frontend/.env.local`
- Modify API URLs if backend runs on different port

## Important Notes

1. **Phase 1** is left untouched in `/mnt/c/Hackathon-2/phase1/`
2. **Phase 2** is now organized in `/mnt/c/Hackathon-2/phase2/`
3. All configurations and dependencies are preserved
4. Backend uses `app/main.py` as entry point (not root `main.py`)
5. Both .env files already exist and were preserved from original setup

## Troubleshooting

### Backend won't start:
- Check if virtual environment is activated
- Verify DATABASE_URL in .env
- Check if port 8000 is available

### Frontend won't start:
- Run `npm install` if node_modules are missing
- Check if port 3000 is available
- Verify .env.local has correct API URL

### Database connection issues:
- Start docker-compose if using PostgreSQL container
- Verify DATABASE_URL in backend/.env
- Check if database is accessible

## Next Steps

1. Start the backend
2. Start the frontend
3. Test the API endpoints
4. Verify authentication flow
5. Check database connectivity
