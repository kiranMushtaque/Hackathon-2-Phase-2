import React from 'react';

interface MessageDisplayProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  className?: string;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, type = 'info', className = '' }) => {
  const typeClasses = {
    error: 'bg-red-100 text-red-700',
    success: 'bg-green-100 text-green-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className={`p-3 rounded-md ${typeClasses[type]} ${className}`}>
      {message}
    </div>
  );
};

export default MessageDisplay;