import React, { useEffect, useRef, useState } from 'react';
import { useDropdown } from './Dropdown';
import type { DropdownContentProps, Position } from './types';
import { calculatePosition, getAnimationClass, getDimensions } from './utils';

export const DropdownContent: React.FC<DropdownContentProps> = ({ 
  children, 
  className = '', 
  align = 'start', 
  side = 'bottom',
  sideOffset = 4,
  alignOffset = 0,
  collisionPadding = 8,
  avoidCollisions = true,
  style,
  ...props 
}) => {
  const { isOpen, dropdownRef } = useDropdown();
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [isPositioned, setIsPositioned] = useState(false);

  useEffect(() => {
    if (isOpen && contentRef.current && dropdownRef.current) {
      const trigger = dropdownRef.current.querySelector('[data-dropdown-trigger]');
      
      if (trigger && trigger instanceof HTMLElement) {
        const triggerDimensions = getDimensions(trigger);
        const contentDimensions = getDimensions(contentRef.current);

        const calculatedPosition = calculatePosition(
          triggerDimensions,
          contentDimensions,
          align,
          side,
          sideOffset,
          alignOffset,
          collisionPadding,
          avoidCollisions
        );

        setPosition(calculatedPosition);
        setIsPositioned(true);
      }
    } else {
      setIsPositioned(false);
      setPosition(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, align, side, sideOffset, alignOffset, collisionPadding, avoidCollisions]);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const animationClass = position ? getAnimationClass(position.side) : '';

  return (
    <div
      ref={contentRef}
      className={`fixed z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-lg focus:outline-none ${animationClass} ${className}`}
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        transformOrigin: position?.transformOrigin,
        opacity: isPositioned ? 1 : 0,
        transition: 'opacity 0.1s ease',
        ...style
      }}
      tabIndex={-1}
      {...props}
    >
      {children}
    </div>
  );
};