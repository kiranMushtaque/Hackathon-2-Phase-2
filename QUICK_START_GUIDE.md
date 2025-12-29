# Phase 2 Quick Start Guide - Ready to Go! 🚀

## Current Status ✅

**Backend:** ✅ Database configured (SQLite)  
**Frontend:** ✅ Better Auth errors fixed  
**Both:** ✅ Ready to run!

---

## 🚀 Start Your Application

### Terminal 1: Backend
```bash
cd /mnt/c/Hackathon-2/phase2/backend
.venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend URL:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs

### Terminal 2: Frontend
```bash
cd /mnt/c/Hackathon-2/phase2/frontend
npm run dev
```

**Frontend URL:** http://localhost:3000

---

## ✅ What Was Fixed

### Backend Issues (FIXED)
- ✅ Database connection error (PostgreSQL → SQLite)
- ✅ Fixed `config.py` to load `.env` properly
- ✅ Added conditional database engine configuration
- ✅ Fixed `requirements.txt` package version
- ✅ Created database test script

### Frontend Issues (FIXED)
- ✅ Removed invalid `github` and `google` imports from Better Auth
- ✅ Removed non-existent `BetterAuthProvider`
- ✅ Fixed deprecated `next.config.js` options
- ✅ Simplified auth integration

---

## 📁 Project Structure

```
phase2/
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI app
│   │   ├── models.py                 # Database models
│   │   ├── database.py               # DB config (FIXED)
│   │   ├── config.py                 # Settings (FIXED)
│   │   ├── auth.py                   # Authentication
│   │   ├── crud.py                   # CRUD operations
│   │   └── routers/                  # API routes
│   ├── .env                          # Environment variables
│   ├── requirements.txt              # Python dependencies
│   ├── test_db.py                    # DB test script (NEW)
│   ├── DATABASE_FIX_SUMMARY.md       # Backend fixes (NEW)
│   └── NEON_SETUP.md                 # Neon PostgreSQL guide (NEW)
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Layout (FIXED)
│   │   │   └── page.tsx              # Home page
│   │   ├── components/               # React components
│   │   └── lib/
│   │       ├── auth.ts               # Auth client (FIXED)
│   │       └── api.ts                # API client
│   ├── .env.local                    # Frontend env vars
│   ├── next.config.js                # Next.js config (FIXED)
│   ├── package.json                  # Node dependencies
│   └── FRONTEND_FIX_SUMMARY.md       # Frontend fixes (NEW)
│
├── specs/                            # Phase 2 specifications
├── docker-compose.yml                # Docker services
├── CLAUDE.md                         # Claude instructions
├── constitution.md                   # Project constitution
└── QUICK_START_GUIDE.md             # This file (NEW)
```

---

## 🧪 Testing Commands

### Test Backend Database
```bash
cd /mnt/c/Hackathon-2/phase2/backend
.venv/bin/python test_db.py
```

Expected: ✅ Connection successful!

### Check Backend Health
```bash
curl http://localhost:8000
# or visit http://localhost:8000/docs
```

### Check Frontend
Visit: http://localhost:3000

---

## 🔧 Common Commands

### Backend Commands
```bash
# Activate virtual environment
cd /mnt/c/Hackathon-2/phase2/backend
source .venv/bin/activate

# Run backend
.venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Test database
.venv/bin/python test_db.py

# Install new package
.venv/bin/python -m pip install package-name

# Check current database URL
.venv/bin/python -c "from app.config import settings; print(settings.DATABASE_URL)"
```

### Frontend Commands
```bash
cd /mnt/c/Hackathon-2/phase2/frontend

# Run development server
npm run dev

# Build for production
npm run build

# Install new package
npm install package-name

# Clear Next.js cache
rm -rf .next
```

---

## 🗄️ Database Information

### Current: SQLite (File-based)
- **Location:** `phase2/backend/taskmanager.db`
- **Connection:** `sqlite:///./taskmanager.db`
- **Perfect for:** Development, testing, hackathon demos
- **Status:** ✅ Working

### Optional: Neon PostgreSQL
- **For:** Production, deployment, team collaboration
- **Setup Guide:** See `backend/NEON_SETUP.md`
- **Free Tier:** 10GB storage, unlimited queries
- **Switch:** Update `DATABASE_URL` in `.env`

---

## 🔐 Authentication Flow

### Custom Auth Service
Your app uses a custom auth service in `frontend/src/lib/auth.ts`:

```typescript
import { authService } from '@/lib/auth';

// Login
const user = await authService.login(email, password);

// Logout
await authService.logout();

// Check authentication
const isAuth = authService.isAuthenticated();

// Get current user
const user = authService.getUser();
```

### Backend Integration
- JWT-based authentication
- Token stored in localStorage
- Automatic token inclusion in API calls
- User data isolation (each user sees only their tasks)

---

## 📋 API Endpoints

Once backend is running, visit http://localhost:8000/docs for:
- Complete API documentation
- Interactive testing interface
- Request/response schemas
- Authentication flows

Example endpoints:
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - User login
- `GET /api/tasks` - List user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
lsof -i :8000

# Use different port
.venv/bin/python -m uvicorn app.main:app --reload --port 8001
```

### Frontend won't start
```bash
# Clear cache and reinstall
cd /mnt/c/Hackathon-2/phase2/frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Database errors
```bash
# Run database test
cd /mnt/c/Hackathon-2/phase2/backend
.venv/bin/python test_db.py

# If SQLite is locked, stop all backend processes
# Delete database file: rm taskmanager.db
# Restart backend
```

### Import errors
```bash
# Backend: Reinstall dependencies
cd /mnt/c/Hackathon-2/phase2/backend
.venv/bin/python -m pip install -r requirements.txt

# Frontend: Reinstall dependencies
cd /mnt/c/Hackathon-2/phase2/frontend
npm install
```

---

## 📚 Documentation Files

- **Backend fixes:** `backend/DATABASE_FIX_SUMMARY.md`
- **Frontend fixes:** `frontend/FRONTEND_FIX_SUMMARY.md`
- **Neon setup:** `backend/NEON_SETUP.md`
- **Phase 2 overview:** `README.md`
- **This guide:** `QUICK_START_GUIDE.md`

---

## ✅ Pre-Flight Checklist

Before starting development:

- [ ] Backend database configured (SQLite working)
- [ ] Frontend Better Auth errors resolved
- [ ] Both servers can start without errors
- [ ] `.env` and `.env.local` files configured
- [ ] Virtual environment working for backend
- [ ] Node modules installed for frontend

**All checked?** You're ready to build! 🚀

---

## 🎯 Next Steps

1. **Start both servers** (backend and frontend)
2. **Test authentication** (register/login)
3. **Create your first task** via the API or UI
4. **Build your features** according to specs
5. **Deploy** when ready (optional Neon PostgreSQL)

---

## 💡 Tips

- Keep both terminals open (one for backend, one for frontend)
- Check `http://localhost:8000/docs` for API documentation
- SQLite database file is created automatically on first run
- All changes to code auto-reload (thanks to `--reload` and `npm run dev`)
- Check console for errors and logs

---

## 🎉 You're All Set!

Both your backend and frontend are fixed and ready to run. Start building your hackathon project!

**Happy Coding! 🚀**
