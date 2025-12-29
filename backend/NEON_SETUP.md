# Neon PostgreSQL Setup Guide

## Quick Start - SQLite is Already Configured ✅

Your backend is now configured to use SQLite for immediate testing. No additional setup needed!

## Setting Up Neon PostgreSQL (For Production/Hackathon Submission)

### Step 1: Create a Neon Account

1. Go to https://neon.tech
2. Click "Sign Up" or "Get Started"
3. Sign up with GitHub, Google, or Email
4. Free tier includes:
   - 10GB storage
   - 1 project
   - Unlimited queries
   - Perfect for hackathons!

### Step 2: Create a New Project

1. After logging in, click "Create Project"
2. Enter project details:
   - **Project Name**: `hackathon-task-manager` (or your choice)
   - **PostgreSQL Version**: Latest (15 or 16)
   - **Region**: Choose closest to you (e.g., US East, EU West)
3. Click "Create Project"

### Step 3: Get Your Connection String

After creating the project, you'll see a connection string like:

```
postgresql://username:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

Example breakdown:
```
postgresql://            # Protocol
alex123:                # Username
abc123xyz456            # Password
@ep-cool-hill-12345.    # Host
us-east-2.aws.neon.tech # Domain
/neondb                 # Database name
?sslmode=require        # SSL mode (required for Neon)
```

### Step 4: Update Your .env File

1. Open `/mnt/c/Hackathon-2/phase2/backend/.env`
2. Comment out the SQLite line
3. Uncomment and update the Neon line with your connection string:

```bash
# Database Configuration
# For SQLite (temporary/testing)
# DATABASE_URL=sqlite:///./taskmanager.db

# For Neon PostgreSQL (production) - ACTIVE
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@YOUR_HOST.neon.tech/neondb?sslmode=require
```

### Step 5: Install PostgreSQL Driver (if not already installed)

```bash
cd /mnt/c/Hackathon-2/phase2/backend
source .venv/bin/activate
pip install psycopg2-binary
```

### Step 6: Restart Your Backend

```bash
# Stop the current backend (Ctrl+C)
# Then restart:
cd /mnt/c/Hackathon-2/phase2/backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Neon Dashboard Features

### Connection Details
- **Connection String**: Copy your full connection string
- **Host**: Your endpoint hostname
- **Database**: Default is `neondb`
- **Username**: Auto-generated (usually starts with your name)
- **Password**: Auto-generated (click "Show password" to view)

### Useful Features
- **SQL Editor**: Run queries directly in the dashboard
- **Tables Browser**: View your tables and data
- **Monitoring**: Track database performance
- **Backups**: Automatic point-in-time recovery

## Troubleshooting

### Connection Timeout
- Check if your connection string includes `?sslmode=require`
- Verify the region is accessible from your location

### Authentication Failed
- Double-check username and password (copy-paste from Neon dashboard)
- Ensure no extra spaces in the connection string

### SSL Error
- Make sure `?sslmode=require` is at the end of your connection string
- Install `psycopg2-binary` if not already installed

### Tables Not Created
- The backend auto-creates tables on startup
- Check backend logs for migration errors
- Verify the database name in your connection string

## Migration from SQLite to Neon

When switching from SQLite to Neon:

1. Your existing SQLite data (`taskmanager.db`) will remain on disk
2. New tables will be created in Neon automatically
3. You'll need to re-create users and tasks (fresh start)
4. For data migration, export from SQLite and import to Neon (optional)

## Connection String Format Reference

```
postgresql://[username]:[password]@[host]/[database]?sslmode=require

Required components:
- username: From Neon dashboard
- password: From Neon dashboard (URL-encoded if contains special chars)
- host: ep-xxxx-xxxx.region.aws.neon.tech
- database: Usually 'neondb' (default)
- sslmode=require: MUST be included for Neon
```

## Security Best Practices

1. **Never commit .env to git**
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   ```

2. **Rotate passwords regularly**
   - Can be done from Neon dashboard
   - Update .env after rotation

3. **Use environment variables in production**
   - Don't hardcode credentials
   - Use platform-specific secret management

4. **Restrict database access**
   - Neon allows IP whitelisting (paid feature)
   - Use strong passwords

## Cost Information

**Free Tier (Perfect for Hackathons):**
- 10GB storage
- 1 project
- Unlimited compute hours (with fair use)
- 1 branch
- 7-day history

**No credit card required for free tier!**

## Support Resources

- Documentation: https://neon.tech/docs
- Discord Community: https://discord.gg/neon
- GitHub Issues: https://github.com/neondatabase/neon
- Status Page: https://status.neon.tech

## Quick Commands Reference

```bash
# Check if backend is using correct database
cd /mnt/c/Hackathon-2/phase2/backend
source .venv/bin/activate
python -c "from app.config import settings; print(f'Database: {settings.DATABASE_URL}')"

# Test database connection
python -c "from app.database import engine; from sqlalchemy import text; print(engine.connect().execute(text('SELECT 1')).scalar())"

# View current tables
python -c "from app.database import engine; from sqlalchemy import inspect; print(inspect(engine).get_table_names())"
```
