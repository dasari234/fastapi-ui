import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { DropdownContextType, DropdownProps } from './types';


const DropdownContext = createContext<DropdownContextType | null>(null);

export const Dropdown: React.FC<DropdownProps> = ({ children, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  const close = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        close();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside as unknown as EventListener);
      document.addEventListener('keydown', handleEscape as unknown as EventListener);
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside as unknown as EventListener);
      document.removeEventListener('keydown', handleEscape as unknown as EventListener);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const value: DropdownContextType = {
    isOpen,
    toggle,
    close,
    dropdownRef
  };

  return (
    <DropdownContext.Provider value={value}>
      <div ref={dropdownRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDropdown = (): DropdownContextType => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown');
  }
  return context;
};