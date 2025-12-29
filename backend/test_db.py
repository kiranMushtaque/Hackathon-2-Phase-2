#!/usr/bin/env python3
"""
Database Connection Test Script
Run this to verify your database configuration
"""

import sys
from app.config import settings
from app.database import engine
from sqlalchemy import text

def test_database_connection():
    """Test database connection and configuration"""
    
    print("=" * 60)
    print("DATABASE CONNECTION TEST")
    print("=" * 60)
    print()
    
    # Show current configuration
    print("📋 Current Configuration:")
    print(f"   Database URL: {settings.DATABASE_URL}")
    
    # Determine database type
    if settings.DATABASE_URL.startswith("sqlite"):
        print(f"   Database Type: SQLite (File-based)")
        print(f"   Location: ./taskmanager.db")
    elif settings.DATABASE_URL.startswith("postgresql"):
        print(f"   Database Type: PostgreSQL (Neon/Remote)")
        # Parse host from connection string
        try:
            host = settings.DATABASE_URL.split("@")[1].split("/")[0]
            print(f"   Host: {host}")
        except:
            print(f"   Host: Unable to parse")
    else:
        print(f"   Database Type: Unknown")
    
    print()
    
    # Test connection
    print("🔌 Testing Connection...")
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            value = result.scalar()
            
            if value == 1:
                print("   ✅ Connection successful!")
                print()
                
                # Try to get database version
                try:
                    if settings.DATABASE_URL.startswith("postgresql"):
                        version_result = connection.execute(text("SELECT version()"))
                        version = version_result.scalar()
                        print(f"   Database Version: {version.split(',')[0]}")
                    elif settings.DATABASE_URL.startswith("sqlite"):
                        version_result = connection.execute(text("SELECT sqlite_version()"))
                        version = version_result.scalar()
                        print(f"   SQLite Version: {version}")
                except Exception as e:
                    print(f"   Could not retrieve version: {e}")
                
                print()
                print("=" * 60)
                print("✅ DATABASE IS READY TO USE!")
                print("=" * 60)
                return True
            else:
                print("   ❌ Connection test failed (unexpected result)")
                return False
                
    except Exception as e:
        print(f"   ❌ Connection failed!")
        print()
        print("Error Details:")
        print(f"   {type(e).__name__}: {str(e)}")
        print()
        print("=" * 60)
        print("❌ DATABASE CONNECTION FAILED")
        print("=" * 60)
        print()
        print("Troubleshooting Steps:")
        
        if "password authentication failed" in str(e).lower():
            print("   1. Check your DATABASE_URL username and password")
            print("   2. Verify credentials in Neon dashboard")
            print("   3. Ensure no extra spaces in .env file")
        elif "could not connect" in str(e).lower():
            print("   1. Check if database server is running")
            print("   2. Verify the host address is correct")
            print("   3. Check your internet connection (for Neon)")
        elif "sqlite" in str(e).lower():
            print("   1. Check if the directory is writable")
            print("   2. Verify the DATABASE_URL path is correct")
        else:
            print("   1. Check your .env file configuration")
            print("   2. Verify DATABASE_URL format is correct")
            print("   3. See NEON_SETUP.md for detailed instructions")
        
        print()
        return False

if __name__ == "__main__":
    success = test_database_connection()
    sys.exit(0 if success else 1)
