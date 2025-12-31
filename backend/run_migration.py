#!/usr/bin/env python3
"""
Run database migration to add enhanced task fields
"""
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment variables")
    sys.exit(1)

print(f"Connecting to database...")

try:
    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        print("\n=== Starting Migration: Add Enhanced Task Fields ===\n")

        # Add priority column
        print("1. Adding priority column...")
        conn.execute(text("""
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'medium'
        """))
        conn.commit()
        print("   ✓ Priority column added")

        # Add starred column
        print("2. Adding starred column...")
        conn.execute(text("""
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT FALSE
        """))
        conn.commit()
        print("   ✓ Starred column added")

        # Add tags column
        print("3. Adding tags column...")
        conn.execute(text("""
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS tags JSON
        """))
        conn.commit()
        print("   ✓ Tags column added")

        # Add due_date column
        print("4. Adding due_date column...")
        conn.execute(text("""
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE
        """))
        conn.commit()
        print("   ✓ Due_date column added")

        # Create indexes
        print("5. Creating indexes...")
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)
        """))
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_tasks_starred ON tasks(starred)
        """))
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)
        """))
        conn.commit()
        print("   ✓ Indexes created")

        # Verify
        print("\n6. Verifying columns...")
        result = conn.execute(text("""
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'tasks'
            AND column_name IN ('priority', 'starred', 'tags', 'due_date')
            ORDER BY column_name
        """))

        columns = result.fetchall()
        if len(columns) == 4:
            print("   ✓ All columns verified:")
            for col in columns:
                print(f"     - {col[0]}: {col[1]} (default: {col[2]})")
        else:
            print(f"   ⚠ Warning: Found {len(columns)} columns (expected 4)")

        print("\n=== Migration Completed Successfully! ===\n")

except Exception as e:
    print(f"\n❌ Migration failed: {e}")
    sys.exit(1)
