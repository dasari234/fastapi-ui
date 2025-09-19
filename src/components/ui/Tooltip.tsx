import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

type Placement = "top" | "bottom" | "left" | "right";
type Trigger = "hover" | "click" | "focus";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  placement?: Placement;
  trigger?: Trigger;
  delay?: number;
  hideDelay?: number;
  className?: string;
  maxWidth?: string;
  disabled?: boolean;
}

export default function Tooltip({
  content,
  children,
  placement = "top",
  trigger = "hover",
  delay = 100,
  hideDelay = 50,
  className,
  maxWidth = "max-w-xs",
  disabled = false,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [actualPlacement, setActualPlacement] = useState<Placement>(placement);
  const showTimeout = useRef<number | null>(null);
  const hideTimeout = useRef<number | null>(null);
  const idRef = useRef(`tooltip-${Math.random().toString(36).slice(2, 9)}`);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    return () => {
      if (showTimeout.current) window.clearTimeout(showTimeout.current);
      if (hideTimeout.current) window.clearTimeout(hideTimeout.current);
    };
  }, []);

  const calculatePosition = () => {
    if (!tooltipRef.current || !wrapperRef.current) return placement;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Check if the preferred placement has enough space
    switch (placement) {
      case "top":
        if (wrapperRect.top - tooltipRect.height < 0) {
          return "bottom";
        }
        break;
      case "bottom":
        if (wrapperRect.bottom + tooltipRect.height > viewportHeight) {
          return "top";
        }
        break;
      case "left":
        if (wrapperRect.left - tooltipRect.width < 0) {
          return "right";
        }
        break;
      case "right":
        if (wrapperRect.right + tooltipRect.width > viewportWidth) {
          return "left";
        }
        break;
    }

    return placement;
  };

  const clearTimers = () => {
    if (showTimeout.current) {
      window.clearTimeout(showTimeout.current);
      showTimeout.current = null;
    }
    if (hideTimeout.current) {
      window.clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
  };

  const show = (immediate = false) => {
    clearTimers();
    
    // Calculate position before showing
    const newPlacement = calculatePosition();
    setActualPlacement(newPlacement);
    
    if (immediate) {
      setVisible(true);
      return;
    }
    showTimeout.current = window.setTimeout(() => setVisible(true), delay);
  };

  const hide = (immediate = false) => {
    clearTimers();
    if (immediate) {
      setVisible(false);
      return;
    }
    hideTimeout.current = window.setTimeout(() => setVisible(false), hideDelay);
  };

  const toggle = () => {
    if (visible) hide(true);
    else show(true);
  };

  // Handle outside click close for "click" trigger
  useEffect(() => {
    if (trigger !== "click" || !visible) return;
    const onDocClick = () => hide(true);
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, visible]);

  // Recalculate position when window is resized
  useEffect(() => {
    if (!visible) return;
    
    const handleResize = () => {
      const newPlacement = calculatePosition();
      setActualPlacement(newPlacement);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // placement classes
  const contentPosition = {
    top: "-translate-y-2 bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "translate-y-2 top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  }[actualPlacement];

  const arrowPosition = {
    top: "bottom-[-6px] left-1/2 -translate-x-1/2 rotate-45",
    bottom: "top-[-6px] left-1/2 -translate-x-1/2 rotate-45",
    left: "right-[-6px] top-1/2 -translate-y-1/2 rotate-45",
    right: "left-[-6px] top-1/2 -translate-y-1/2 rotate-45",
  }[actualPlacement];

  const wrapperProps: Record<string, unknown> = {
    role: "presentation",
    className: "inline-block relative",
    ref: wrapperRef,
  };

  if (trigger === "hover") {
    wrapperProps.onMouseEnter = () => show();
    wrapperProps.onMouseLeave = () => hide();
    wrapperProps.onFocus = () => show();
    wrapperProps.onBlur = () => hide();
  } else if (trigger === "focus") {
    wrapperProps.onFocus = () => show();
    wrapperProps.onBlur = () => hide();
  } else if (trigger === "click") {
    wrapperProps.onClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggle();
    };
  }

  const child = React.cloneElement(children, {
    "aria-describedby": idRef.current,
    tabIndex: children.props.tabIndex ?? 0,
  });

  if (disabled){
    return child;
  }

  return (    
    <span {...wrapperProps}>
      {child}
      <span
        id={idRef.current}
        ref={tooltipRef}
        role="tooltip"
        aria-hidden={!visible}
        className={cn(
          "pointer-events-none absolute z-50 transform transition-all duration-150 ease-out",
          contentPosition,
          maxWidth,
          className,
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        <div className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded-md shadow-lg break-words">
          {content}
        </div>
        <span
          aria-hidden
          className={cn(
            "absolute w-3 h-3 bg-gray-900",
            arrowPosition,
            visible ? "opacity-100" : "opacity-0"
          )}
        />
      </span>
    </span>
  );
}