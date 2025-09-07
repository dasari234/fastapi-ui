import React from 'react';
import { useDropdown } from './Dropdown';
import type { DropdownTriggerProps } from './types';

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({ 
  children, 
  className = '', 
  asChild = false, 
  onClick,
  ...props 
}) => {
  const { toggle, isOpen } = useDropdown();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event);
    toggle();
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      'aria-expanded': isOpen,
      'data-dropdown-trigger': true,
      ...props
    } as Partial<unknown>);
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      aria-expanded={isOpen}
      data-dropdown-trigger={true}
      {...props}
    >
      {children}
    </button>
  );
};