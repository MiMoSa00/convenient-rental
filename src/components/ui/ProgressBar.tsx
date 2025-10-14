// components/ui/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, className = '' }) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;