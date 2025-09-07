import React from 'react';
import type { DropdownSeparatorProps } from './types';

export const DropdownSeparator: React.FC<DropdownSeparatorProps> = ({ className = '' }) => {
  return (
    <div 
      className={`h-px bg-gray-200 my-1 ${className}`} 
      role="separator" 
      aria-orientation="horizontal" 
    />
  );
};