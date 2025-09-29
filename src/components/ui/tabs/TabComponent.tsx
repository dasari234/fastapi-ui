import { motion } from "framer-motion";
import { X } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "../../../lib/utils";
import type { TabComponentProps } from "./tab-types";

export const TabComponent = forwardRef<HTMLButtonElement, TabComponentProps>(
  ({ tab, isActive, onSelect, onClose, variant = "default" }, ref) => {
    const getVariantClasses = () => {
      const baseClasses =
        "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap relative z-10";

      switch (variant) {
        case "pills":
          return cn(
            baseClasses,
            "rounded-full",
            isActive ? "text-white" : "text-gray-600 hover:bg-gray-100"
          );
        case "underline":
          return cn(
            baseClasses,
            "border-b-2",
            isActive
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:border-gray-300"
          );
        default:
          return cn(
            baseClasses,
            "border-b-2",
            isActive
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
          );
      }
    };

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "flex items-center flex-shrink-0 relative",
          tab.disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {/* Active background indicators */}
        {variant === "pills" && isActive && (
          <motion.div
            layoutId="activePill"
            className="absolute inset-0 bg-blue-600 rounded-full z-0"
            transition={{
              type: "tween",
              duration: 0.2,
            }}
          />
        )}

        {variant === "underline" && isActive && (
          <motion.div
            layoutId="activeUnderline"
            className="absolute inset-0 border-b-2 border-blue-600 z-0"
            transition={{
              type: "tween",
              duration: 0.2,
            }}
          />
        )}

        <button
          ref={ref}
          onClick={() => !tab.disabled && onSelect(tab.id)}
          disabled={tab.disabled}
          className={getVariantClasses()}
          type="button"
        >
          {tab.icon && <span className="flex-shrink-0 z-10">{tab.icon}</span>}
          <span className="truncate max-w-[120px] z-10">{tab.label}</span>
        </button>

        {tab.closable && onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab.id);
            }}
            className="ml-1 p-1 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0 z-10"
            type="button"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </motion.div>
    );
  }
);

TabComponent.displayName = "TabComponent";