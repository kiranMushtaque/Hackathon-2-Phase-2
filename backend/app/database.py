from sqlmodel import SQLModel, Session, create_engine
from .config import settings

# Create engine with the database URL from settings
# Conditional configuration based on database type
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite-specific configuration
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},  # Required for SQLite with FastAPI
        echo=True  # Enable for debugging in development
    )
else:
    # PostgreSQL/Neon-specific configuration
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,  # Verify connections before use
        pool_recycle=300,    # Recycle connections after 5 minutes
        pool_size=20,        # Number of connection objects to keep in the pool
        max_overflow=30,     # Number of connections that can be created beyond pool_size
        echo=True            # Enable for debugging in development
    )


def get_db():
    with Session(engine) as session:
        yield session


def create_db_and_tables():
    # Create tables using SQLModel metadata
    SQLModel.metadata.create_all(bind=engine)
