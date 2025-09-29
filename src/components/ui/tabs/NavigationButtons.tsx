import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { cn } from "../../../lib/utils";

interface NavigationButtonsProps {
  orientation: "horizontal" | "vertical";
  showPrev: boolean;
  showNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}

export const NavigationButtons = ({
  orientation,
  showPrev,
  showNext,
  onPrev,
  onNext,
  className,
}: NavigationButtonsProps) => {
  const isHorizontal = orientation === "horizontal";
  const PrevIcon = isHorizontal ? ChevronLeft : ChevronUp;
  const NextIcon = isHorizontal ? ChevronRight : ChevronDown;

  // Always render both buttons, but control visibility with CSS
  return (
    <div
      className={cn(
        "flex items-center bg-white border-gray-200 z-20 transition-all duration-200",
        isHorizontal ? "flex-row" : "flex-col",
        className
      )}
    >
      {/* Previous Button - Always in DOM but hidden when not needed */}
      <button
        onClick={onPrev}
        className={cn(
          "p-2 hover:bg-gray-100 transition-all duration-200 flex items-center justify-center",
          "opacity-100 scale-100", // Default state
          !showPrev && "opacity-0 scale-0 w-0 p-0 border-0 pointer-events-none" // Hidden state
        )}
        title={isHorizontal ? "Scroll left" : "Scroll up"}
        disabled={!showPrev}
      >
        <PrevIcon className="w-4 h-4" />
      </button>

      {/* Next Button - Always in DOM but hidden when not needed */}
      <button
        onClick={onNext}
        className={cn(
          "p-2 hover:bg-gray-100 transition-all duration-200 flex items-center justify-center",
          "opacity-100 scale-100", // Default state
          !showNext && "opacity-0 scale-0 w-0 p-0 border-0 pointer-events-none" // Hidden state
        )}
        title={isHorizontal ? "Scroll right" : "Scroll down"}
        disabled={!showNext}
      >
        <NextIcon className="w-4 h-4" />
      </button>
    </div>
  );
};