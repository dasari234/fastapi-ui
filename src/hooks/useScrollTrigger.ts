import { useCallback, useEffect, useRef, useState } from "react";

interface ScrollDirection {
  vertical: "up" | "down" | "none";
  horizontal: "left" | "right" | "none";
}

interface ScrollPosition {
  x: number;
  y: number;
  direction: ScrollDirection;
  isAtTop: boolean;
  isAtBottom: boolean;
}

interface UseScrollTriggerOptions {
  threshold?: number; // px scroll to trigger header shadow
  disableHysteresis?: boolean;
  throttleMs?: number; 
  showScrollTop?: boolean; // show “scroll to top” button
  scrollTopThreshold?: number; // px scrolled before showing button
  showScrollBottom?: boolean; // show “scroll to bottom” button
  scrollBottomThreshold?: number; // px from bottom to show button
}

export const useScrollTrigger = ({
  threshold = 100,
  disableHysteresis = false,
  throttleMs = 50,
  showScrollTop = true,
  scrollTopThreshold = 300,
  showScrollBottom = false,
  scrollBottomThreshold = 100,
}: UseScrollTriggerOptions = {}) => {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    direction: { vertical: "none", horizontal: "none" },
    isAtTop: true,
    isAtBottom: false,
  });

  const prevPosition = useRef({ x: 0, y: 0 });
  const timeoutId = useRef<number | null>(null);
  const [trigger, setTrigger] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);
  const [showBottomButton, setShowBottomButton] = useState(false);

  const getScrollDirection = useCallback((currentX: number, currentY: number): ScrollDirection => {
    const { x: prevX, y: prevY } = prevPosition.current;
    return {
      vertical: currentY > prevY ? "down" : currentY < prevY ? "up" : "none",
      horizontal: currentX > prevX ? "right" : currentX < prevX ? "left" : "none",
    };
  }, []);

  const handleScroll = useCallback(() => {
    if (timeoutId.current !== null) return;

    timeoutId.current = window.setTimeout(() => {
      const currentX = window.scrollX;
      const currentY = window.scrollY;
      const direction = getScrollDirection(currentX, currentY);
      const isAtTop = currentY === 0;
      const isAtBottom =
        window.innerHeight + currentY >= document.documentElement.scrollHeight;

      setScrollPosition({ x: currentX, y: currentY, direction, isAtTop, isAtBottom });

      // Trigger for header shadow
      let nextTrigger: boolean;
      if (disableHysteresis) {
        nextTrigger = currentY > threshold;
      } else {
        const isScrollingDown = direction.vertical === "down";
        nextTrigger =
          isScrollingDown && currentY > threshold
            ? true
            : currentY <= threshold
            ? false
            : trigger;
      }
      setTrigger(prev => (prev === nextTrigger ? prev : nextTrigger));

      // Show/hide buttons
      if (showScrollTop) {
        setShowTopButton(currentY > scrollTopThreshold);
      }
      if (showScrollBottom) {
        const distanceFromBottom =
          document.documentElement.scrollHeight - (window.innerHeight + currentY);
        setShowBottomButton(distanceFromBottom > scrollBottomThreshold);
      }

      prevPosition.current = { x: currentX, y: currentY };
      timeoutId.current = null;
    }, throttleMs);
  }, [
    disableHysteresis,
    getScrollDirection,
    threshold,
    throttleMs,
    trigger,
    showScrollTop,
    scrollTopThreshold,
    showScrollBottom,
    scrollBottomThreshold,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll(); // initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (timeoutId.current) window.clearTimeout(timeoutId.current);
    };
  }, [handleScroll]);

  const scrollTo = useCallback((options: ScrollToOptions) => {
    if (typeof window !== "undefined") {
      window.scrollTo({ behavior: "smooth", ...options });
    }
  }, []);

  return {
    ...scrollPosition,
    trigger,
    scrollTo,
    showTopButton,
    showBottomButton,
  };
};




// import React, { ReactNode } from "react";
// import { cn } from "@/lib/utils";
// import { useScrollTrigger } from "@/hooks/useScrollTrigger";

// interface StickyHeaderProps {
//   children: ReactNode;
//   shadowThreshold?: number;
//   topButtonThreshold?: number;
//   bottomButtonThreshold?: number;
// }

// export default function StickyHeaderWithScrollButtons({
//   children,
//   shadowThreshold = 64,
//   topButtonThreshold = 300,
//   bottomButtonThreshold = 150,
// }: StickyHeaderProps) {
//   const {
//     trigger,
//     direction,
//     showTopButton,
//     showBottomButton,
//     scrollTo,
//   } = useScrollTrigger({
//     threshold: shadowThreshold,
//     scrollTopThreshold: topButtonThreshold,
//     scrollBottomThreshold: bottomButtonThreshold,
//     showScrollTop: true,
//     showScrollBottom: true,
//   });

//   return (
//     <>
//       {/* Sticky Header */}
//       <header
//         className={cn(
//           "w-full bg-white sticky top-0 z-50 transition-transform transition-shadow duration-300",
//           trigger && "shadow-md",
//           direction.vertical === "down" ? "-translate-y-full" : "translate-y-0"
//         )}
//       >
//         {children}
//       </header>

//       {/* Scroll-to-Top Button */}
//       {showTopButton && (
//         <button
//           className={cn(
//             "fixed bottom-24 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition",
//             "z-50"
//           )}
//           onClick={() => scrollTo({ top: 0 })}
//           aria-label="Scroll to top"
//         >
//           ↑ Top
//         </button>
//       )}

//       {/* Scroll-to-Bottom Button */}
//       {showBottomButton && (
//         <button
//           className={cn(
//             "fixed bottom-6 right-6 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition",
//             "z-50"
//           )}
//           onClick={() => scrollTo({ top: document.body.scrollHeight })}
//           aria-label="Scroll to bottom"
//         >
//           ↓ Bottom
//         </button>
//       )}
//     </>
//   );
// }
