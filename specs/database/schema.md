# Database Schema Specification

## Overview
This document defines the database schema for the authenticated task management system. The database uses PostgreSQL and follows the SQLModel conventions for object-relational mapping.

## Database Configuration
- **Database Type**: PostgreSQL (compatible with Neon)
- **Connection**: Via DATABASE_URL environment variable
- **ORM**: SQLModel (SQLAlchemy + Pydantic)

## Tables

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Fields**:
- `id`: Auto-incrementing primary key (integer)
- `email`: Unique user email (string, max 255 chars)
- `name`: User's display name (string, max 255 chars)
- `created_at`: Timestamp when user was created (datetime)
- `updated_at`: Timestamp when user was last updated (datetime)

### Tasks Table
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Fields**:
- `id`: Auto-incrementing primary key (integer)
- `title`: Task title (string, max 255 chars)
- `description`: Optional task description (text, max 1000 chars)
- `completed`: Task completion status (boolean, default false)
- `user_id`: Foreign key linking to user (integer, references users.id)
- `created_at`: Timestamp when task was created (datetime)
- `updated_at`: Timestamp when task was last updated (datetime)

## Relationships
- **One-to-Many**: User → Tasks (one user can have many tasks)
- **Foreign Key Constraint**: tasks.user_id → users.id
- **Cascade Delete**: When a user is deleted, all their tasks are also deleted

## Indexes
- `users.email`: Unique index for fast email lookups
- `users.id`: Primary key index
- `tasks.user_id`: Index for fast user-based queries
- `tasks.id`: Primary key index

## Constraints
1. **User Email Uniqueness**: Each email must be unique across all users
2. **Task Title Required**: All tasks must have a title (not null)
3. **Task Title Length**: Title must be 1-255 characters
4. **Task Description Length**: Description must be max 1000 characters
5. **User-Task Relationship**: Every task must belong to a valid user
6. **Referential Integrity**: Foreign key constraints maintain data consistency

## Sample Data
```sql
-- Sample user
INSERT INTO users (email, name) VALUES ('user@example.com', 'Test User');

-- Sample tasks for the user
INSERT INTO tasks (title, description, completed, user_id)
VALUES ('Sample Task', 'This is a sample task', false, 1);

INSERT INTO tasks (title, description, completed, user_id)
VALUES ('Completed Task', 'This task is completed', true, 1);
```

## Migration Strategy
1. Create users table first (dependency for tasks)
2. Create tasks table with foreign key reference
3. Add indexes after table creation
4. Validate referential integrity constraints

## Security Considerations
1. **User Isolation**: Foreign key relationships ensure data separation
2. **Data Integrity**: Constraints prevent invalid data states
3. **Cascade Operations**: Proper cleanup of related data on user deletion