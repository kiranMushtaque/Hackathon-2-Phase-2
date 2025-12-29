import React from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete, onDelete, loading = false }) => {
  return (
    <div className="border rounded-lg p-4 bg-white shadow">
      <div className="flex justify-between items-start">
        <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </h3>
        <button
          onClick={() => onToggleComplete(task.id, task.completed)}
          className={`ml-2 w-6 h-6 rounded-full border ${
            task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
          } disabled:opacity-50`}
          disabled={loading}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed && '✓'}
        </button>
      </div>
      {task.description && (
        <p className="mt-2 text-gray-600">{task.description}</p>
      )}
      <div className="mt-3 text-sm text-gray-500">
        Created: {new Date(task.created_at).toLocaleString()}
      </div>
      <div className="mt-2 flex justify-end space-x-2">
        <button
          onClick={() => onDelete(task.id)}
          className="text-red-500 hover:text-red-700 disabled:opacity-50"
          disabled={loading}
          aria-label="Delete task"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;