// components/ui/dropdown/DropdownItem.tsx
import React from 'react';
import { useDropdown } from './Dropdown';
import type { DropdownItemProps } from './types';


export const DropdownItem: React.FC<DropdownItemProps> = ({ 
  children, 
  className = '', 
  onSelect, 
  disabled = false,
  ...props 
}) => {
  const { close } = useDropdown();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onSelect?.(event);
    close();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (disabled) return;
      onSelect?.(event);
      close();
    }
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 disabled:pointer-events-none disabled:opacity-50 w-full text-left ${className}`}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {children}
    </button>
  );
};