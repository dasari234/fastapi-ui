import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from "react";

export interface DropdownContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export interface DropdownProps {
  children: ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
}

export interface DropdownTriggerProps {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export interface DropdownContentProps {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'end' | 'center';
  side?: 'top' | 'bottom';
  sideOffset?: number;
  alignOffset?: number;
  collisionPadding?: number;
  avoidCollisions?: boolean;
  style?: CSSProperties;
}

export interface DropdownItemProps {
  children: ReactNode;
  className?: string;
  onSelect?: (event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

export interface DropdownSeparatorProps {
  className?: string;
}

export interface DropdownLabelProps {
  children: ReactNode;
  className?: string;
}

export interface Position {
  top: number;
  left: number;
  transformOrigin: string;
  side: 'top' | 'bottom';
  align: 'start' | 'end' | 'center';
}

export interface Dimensions {
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
}