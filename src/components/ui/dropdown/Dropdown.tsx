import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useBodyScrollLock, useClickOutside } from "../../../hooks";
import { cn } from "../../../lib/utils";
import { Avatar } from "../avatar/Avatar";

type DropdownItem = {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

type DropdownProps = {
  text?: string;
  items: DropdownItem[];
  className?: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
};

export function Dropdown({
  text,
  items,
  className,
  isOpen = false,
  onToggle,
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({});

  const toggleDropdown = () => {
    onToggle?.(!isOpen);
  };

  useEffect(() => {
    if (isOpen && dropdownRef.current && buttonRef.current) {
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;

      const fitsRight = buttonRect.left + dropdownRect.width <= screenWidth;

      setPositionStyle(
        fitsRight
          ? {
              top: `${buttonRef.current.offsetHeight}px`,
              left: "0",
              transform: "none",
            }
          : {
              top: `${buttonRef.current.offsetHeight}px`,
              right: "0",
              left: "auto",
              transform: "none",
            }
      );
    }
  }, [isOpen]);

  useBodyScrollLock(isOpen);

  useClickOutside(
    () => {
      onToggle?.(false);
    },
    undefined,
    [dropdownRef]
  );

  const handleItemClick = (itemOnClick: () => void) => {
    return () => {
      onToggle?.(false);
      itemOnClick();
    };
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="flex items-center cursor-pointer space-x-2 px-2 py-1 transition duration-300 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Avatar initials={text} />
        <ChevronDown className="text-gray-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            style={positionStyle}
            className={cn(
              "absolute mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10",
              className
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <ul className="py-2">
              {items.map(
                ({ label, onClick, icon, iconPosition = "left" }, index) => (
                  <li
                    key={index}
                    onClick={handleItemClick(onClick)}
                    className="px-4 py-3 text-sm text-slategray hover:bg-gray-100 cursor-pointer flex items-center space-x-2 border-b last:border-b-0 border-gray-300"
                  >
                    {icon && iconPosition === "left" && (
                      <span className="mr-2">{icon}</span>
                    )}
                    <span>{label}</span>
                    {icon && iconPosition === "right" && (
                      <span className="ml-2">{icon}</span>
                    )}
                  </li>
                )
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
