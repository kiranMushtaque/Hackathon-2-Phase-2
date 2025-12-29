import React from 'react';
import TaskCard from './TaskCard';
import { Task } from '@/lib/api';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete, onDelete, loading = false }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {loading ? 'Loading tasks...' : 'No tasks found. Add a new task to get started!'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default TaskList;