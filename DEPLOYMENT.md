# Deployment Checklist - Phase II Task Manager

## Pre-Deployment Checklist

### Backend Preparation
- [ ] All environment variables configured in production
- [ ] Database migrations tested
- [ ] SECRET_KEY uses strong random value (min 32 chars)
- [ ] ACCESS_TOKEN_EXPIRE_MINUTES set appropriately for production
- [ ] CORS origins updated for production frontend URL
- [ ] Database connection pooling configured for production load
- [ ] All dependencies in requirements.txt up to date
- [ ] No debug/development logging in production

### Frontend Preparation
- [ ] NEXT_PUBLIC_API_URL points to production backend
- [ ] Environment variables configured in deployment platform
- [ ] Build passes without errors (`npm run build`)
- [ ] No console.log statements left in production code
- [ ] Error boundaries implemented for production errors

### Security Checklist
- [ ] All secrets stored in environment variables (not hardcoded)
- [ ] HTTPS enabled for production
- [ ] CORS configured with specific origins (not wildcard *)
- [ ] Rate limiting considered for API endpoints
- [ ] SQL injection protection verified (SQLModel handles this)
- [ ] XSS protection in place (React escapes by default)
- [ ] Password hashing verified (bcrypt in use)
- [ ] JWT tokens have reasonable expiration times

### Testing Checklist
- [ ] User registration flow tested
- [ ] User login flow tested
- [ ] Token refresh tested
- [ ] Task creation tested
- [ ] Task retrieval tested
- [ ] Task update tested
- [ ] Task deletion tested
- [ ] Task completion toggle tested
- [ ] User isolation verified (user A cannot access user B's tasks)
- [ ] Invalid token handling tested (401 responses)
- [ ] User mismatch handling tested (403 responses)
- [ ] Validation errors tested (400 responses)

## Deployment Options

### Option 1: Railway (Backend) + Vercel (Frontend)

#### Backend on Railway
1. Create new project on Railway
2. Connect GitHub repository
3. Set root directory to `backend`
4. Configure environment variables:
   ```
   DATABASE_URL=<your-postgresql-connection-string>
   SECRET_KEY=<generate-strong-random-32+-char-string>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=10080
   ```
5. Railway will auto-detect Python and run: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Note the deployed URL (e.g., `https://your-app.railway.app`)

#### Frontend on Vercel
1. Import GitHub repository to Vercel
2. Set root directory to `frontend`
3. Framework preset: Next.js
4. Configure environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-app.railway.app/api
   ```
5. Deploy

### Option 2: Render (Backend) + Vercel (Frontend)

#### Backend on Render
1. Create new Web Service
2. Connect GitHub repository
3. Root directory: `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Environment variables: Same as Railway
7. Note the deployed URL

### Option 3: All-in-One with Fly.io

#### Full Stack on Fly.io
1. Install Fly CLI
2. Create `fly.toml` configuration
3. Deploy backend and frontend together
4. Configure environment variables via `fly secrets`

### Option 4: Docker + Any Cloud Provider

#### Using Docker Compose
1. Build images: `docker-compose build`
2. Push to container registry (Docker Hub, ECR, GCR)
3. Deploy to cloud provider (AWS ECS, Google Cloud Run, Azure Container Instances)

## Database Setup

### Neon PostgreSQL (Recommended)
1. Create free account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Set as `DATABASE_URL` in backend environment variables
5. Database tables auto-created on first run (SQLModel creates them)

### Supabase PostgreSQL (Alternative)
1. Create project on [supabase.com](https://supabase.com)
2. Get connection string from Project Settings > Database
3. Use connection string as `DATABASE_URL`

### AWS RDS PostgreSQL (Production)
1. Create PostgreSQL RDS instance
2. Configure security groups for backend access
3. Get connection endpoint
4. Format: `postgresql://user:password@endpoint:5432/dbname`

## Post-Deployment Verification

### Backend Health Check
```bash
curl https://your-backend-url.com/health
# Expected: {"status": "healthy"}
```

### API Documentation
Visit: `https://your-backend-url.com/docs`
- Should see interactive Swagger UI
- Test authentication endpoints
- Test task endpoints with JWT token

### Frontend Check
Visit: `https://your-frontend-url.com`
- Should see login page
- Register new user
- Login
- Create task
- Verify task appears
- Update task
- Delete task
- Logout and verify redirect

### Database Verification
```sql
-- Connect to your database
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM tasks;
-- Verify data exists
```

## Environment Variables Reference

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://username:password@host:5432/database

# JWT Authentication
SECRET_KEY=<generate-with: openssl rand -hex 32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days

# Optional
DEBUG=false
APP_NAME=Task Manager API - Phase II
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

## Generating Secrets

### SECRET_KEY (Backend)
```bash
# Method 1: OpenSSL
openssl rand -hex 32

# Method 2: Python
python -c "import secrets; print(secrets.token_hex(32))"

# Method 3: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Verify all environment variables are set
- Check logs for database connection errors
- Ensure PostgreSQL version is 12+

### CORS errors in frontend
- Verify backend CORS settings include frontend URL
- Check protocol (http vs https) matches
- Ensure no trailing slashes in URLs

### 401 Unauthorized errors
- Verify SECRET_KEY matches between environments
- Check token is being sent in Authorization header
- Verify token hasn't expired (check ACCESS_TOKEN_EXPIRE_MINUTES)
- Test with /api/auth/refresh if token expired

### Database connection pooling errors
- Increase pool_size in database.py
- Increase max_overflow in database.py
- Use connection pooling service (PgBouncer)

### Tasks not showing up
- Verify user_id in URL matches authenticated user
- Check browser console for API errors
- Verify JWT token is valid
- Check database has tasks for that user

## Performance Optimization

### Backend
- [ ] Enable Gzip compression
- [ ] Configure connection pooling (already done)
- [ ] Add caching for frequently accessed data
- [ ] Monitor database query performance
- [ ] Use database indexes (already configured)

### Frontend
- [ ] Enable Next.js production build optimizations
- [ ] Configure CDN for static assets
- [ ] Enable image optimization
- [ ] Implement proper loading states
- [ ] Use React.memo for expensive components

## Monitoring

### Backend Monitoring
- Health endpoint: `/health`
- API docs: `/docs`
- Log aggregation: Consider Sentry, LogRocket, or Papertrail
- Performance: Consider New Relic or Datadog

### Frontend Monitoring
- Error tracking: Sentry
- Analytics: Vercel Analytics (built-in)
- Performance: Lighthouse CI

## Rollback Plan

### Backend Rollback
1. Railway/Render: Revert to previous deployment in dashboard
2. Docker: Deploy previous image tag
3. Database: Restore from backup if schema changed

### Frontend Rollback
1. Vercel: Rollback to previous deployment in dashboard
2. Redeploy previous Git commit

## Production Checklist Summary

**Backend**
- ✅ Environment variables configured
- ✅ Database connected (Neon/other)
- ✅ CORS configured for frontend domain
- ✅ HTTPS enabled
- ✅ Health check responding

**Frontend**
- ✅ API URL points to production backend
- ✅ Build successful
- ✅ Deployed to Vercel/other
- ✅ HTTPS enabled

**Testing**
- ✅ Can register new user
- ✅ Can login
- ✅ Can create/read/update/delete tasks
- ✅ User isolation working
- ✅ Token refresh working
- ✅ Error handling working

**Security**
- ✅ Strong secrets in use
- ✅ HTTPS everywhere
- ✅ CORS properly configured
- ✅ No secrets in Git

---

## Quick Deploy Commands

### Backend (Railway CLI)
```bash
cd backend
railway login
railway init
railway up
railway variables set DATABASE_URL="postgresql://..."
railway variables set SECRET_KEY="your-secret-key"
```

### Frontend (Vercel CLI)
```bash
cd frontend
vercel login
vercel
vercel --prod
```

### Environment Setup
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with production values

# Frontend
cd frontend
cp .env.local.example .env.local
# Edit .env.local with production backend URL
```

---

**Deployment Complete!** 🚀

Your Phase II Task Manager should now be live and accessible to users worldwide.
