// components/ui/dropdown/DropdownLabel.tsx
import React from 'react';
import type { DropdownLabelProps } from './types';


export const DropdownLabel: React.FC<DropdownLabelProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-2 py-1.5 text-sm font-semibold text-gray-700 ${className}`}>
      {children}
    </div>
  );
};