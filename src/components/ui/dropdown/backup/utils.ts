import type { Dimensions, Position } from "./types";

export const getDimensions = (element: HTMLElement): Dimensions => {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom
  };
};

export const calculatePosition = (
  trigger: Dimensions,
  content: Dimensions,
  align: 'start' | 'end' | 'center' = 'start',
  preferredSide: 'top' | 'bottom' = 'bottom',
  sideOffset: number = 4,
  alignOffset: number = 0,
  collisionPadding: number = 8,
  avoidCollisions: boolean = true
): Position => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let side = preferredSide;
  let left = 0;
  let top = 0;
  let transformOrigin = '';

  // Calculate horizontal position based on alignment
  switch (align) {
    case 'start':
      left = trigger.left + alignOffset;
      transformOrigin = 'top left';
      break;
    case 'end':
      left = trigger.right - content.width - alignOffset;
      transformOrigin = 'top right';
      break;
    case 'center':
      left = trigger.left + (trigger.width - content.width) / 2 + alignOffset;
      transformOrigin = 'top center';
      break;
  }

  // Calculate vertical position
  if (preferredSide === 'bottom') {
    top = trigger.bottom + sideOffset;
    transformOrigin = transformOrigin.replace('top', 'top');
  } else {
    top = trigger.top - content.height - sideOffset;
    transformOrigin = transformOrigin.replace('top', 'bottom');
  }

  // Check for collisions and adjust if needed
  if (avoidCollisions) {
    // Check right edge collision
    if (left + content.width > viewportWidth - collisionPadding) {
      if (align === 'start') {
        left = viewportWidth - content.width - collisionPadding;
      } else if (align === 'center') {
        left = Math.max(collisionPadding, viewportWidth - content.width - collisionPadding);
      }
    }

    // Check left edge collision
    if (left < collisionPadding) {
      if (align === 'end') {
        left = collisionPadding;
      } else if (align === 'center') {
        left = Math.max(collisionPadding, left);
      }
    }

    // Check bottom edge collision (for bottom placement)
    if (preferredSide === 'bottom' && top + content.height > viewportHeight - collisionPadding) {
      // Try to flip to top if there's more space
      const spaceAbove = trigger.top - collisionPadding;
      const spaceBelow = viewportHeight - trigger.bottom - collisionPadding;
      
      if (spaceAbove > spaceBelow && spaceAbove > content.height) {
        side = 'top';
        top = trigger.top - content.height - sideOffset;
        transformOrigin = transformOrigin.replace('top', 'bottom');
      } else {
        // If can't flip, constrain to viewport
        top = viewportHeight - content.height - collisionPadding;
      }
    }

    // Check top edge collision (for top placement)
    if (preferredSide === 'top' && top < collisionPadding) {
      // Try to flip to bottom if there's more space
      const spaceAbove = trigger.top - collisionPadding;
      const spaceBelow = viewportHeight - trigger.bottom - collisionPadding;
      
      if (spaceBelow > spaceAbove && spaceBelow > content.height) {
        side = 'bottom';
        top = trigger.bottom + sideOffset;
        transformOrigin = transformOrigin.replace('bottom', 'top');
      } else {
        // If can't flip, constrain to viewport
        top = collisionPadding;
      }
    }
  }

  return {
    top,
    left,
    transformOrigin,
    side,
    align
  };
};

export const getAnimationClass = (side: 'top' | 'bottom') => {
  return side === 'bottom' 
    ? 'animate-in slide-in-from-top-2' 
    : 'animate-in slide-in-from-bottom-2';
};