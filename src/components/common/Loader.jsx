import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };
  return <Loader2 className={`animate-spin text-primary ${sizes[size]} ${className}`} />;
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full space-y-3 p-4 animate-pulse">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center space-x-4">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div key={cIdx} className="h-4 bg-gray-200 rounded-lg grow" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-card animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="w-8 h-8 bg-gray-200 rounded-xl" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  );
};

export default Spinner;
