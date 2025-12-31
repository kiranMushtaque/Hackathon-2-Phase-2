-- Migration: Add enhanced task fields (priority, starred, tags, due_date)
-- Date: 2025-01-01
-- Description: Adds priority, starred, tags (JSON), and due_date fields to tasks table

-- Add priority column (default: medium)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'medium';

-- Add starred column (default: false)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT FALSE;

-- Add tags column (JSON array)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS tags JSON;

-- Add due_date column
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- Create index on priority for faster filtering
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- Create index on starred for faster filtering
CREATE INDEX IF NOT EXISTS idx_tasks_starred ON tasks(starred);

-- Create index on due_date for faster sorting
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Verify the migration
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
AND column_name IN ('priority', 'starred', 'tags', 'due_date');
