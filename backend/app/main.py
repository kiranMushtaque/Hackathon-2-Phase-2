from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import create_db_and_tables
from .routers import tasks, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="Task Manager API - Phase II", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",  # Vercel preview/production deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(tasks.router, prefix="/api", tags=["tasks"])


@app.get("/")
async def root():
    return {"message": "Task Manager API - Phase II"}


@app.get("/api/health")
async def api_health_check():
    """Health check endpoint for Koyeb deployment."""
    return {"status": "healthy"}


@app.get("/health")
async def health_check():
    """Health check endpoint (alternative path)."""
    return {"status": "healthy"}