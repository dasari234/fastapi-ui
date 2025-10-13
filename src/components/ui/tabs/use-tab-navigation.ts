import { useCallback, useEffect, useState } from "react";

interface UseTabNavigationProps {
  containerRef: React.RefObject<HTMLDivElement>;
  orientation: "horizontal" | "vertical";
}

export const useTabNavigation = ({
  containerRef,
  orientation,
}: UseTabNavigationProps) => {
  const [showPrevButton, setShowPrevButton] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);

  const updateScrollState = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      console.log('No container found');
      return;
    }
    
    const isHorizontal = orientation === "horizontal";
    const scrollSize = isHorizontal ? container.scrollWidth : container.scrollHeight;
    const clientSize = isHorizontal ? container.clientWidth : container.clientHeight;
    const currentScroll = isHorizontal ? container.scrollLeft : container.scrollTop;
    const maxScroll = Math.max(0, scrollSize - clientSize);

    const shouldShowPrev = currentScroll > 10;
    const shouldShowNext = currentScroll < maxScroll - 10;

    setShowPrevButton(shouldShowPrev);
    setShowNextButton(shouldShowNext);
  }, [containerRef, orientation]);

  const scrollBy = useCallback(
    (amount: number) => {
      const container = containerRef.current;
      if (!container) return;
      
      const isHorizontal = orientation === "horizontal";
      const currentScroll = isHorizontal ? container.scrollLeft : container.scrollTop;
      
      if (isHorizontal) {
        container.scrollTo({ left: currentScroll + amount, behavior: "smooth" });
      } else {
        container.scrollTo({ top: currentScroll + amount, behavior: "smooth" });
      }
    },
    [containerRef, orientation]
  );

  const scrollToTab = useCallback(
    (tabId: string) => {
      const container = containerRef.current;
      if (!container) return;

      // Find the tab element - we'll add data attributes to tabs
      const tabElement = container.querySelector(`[data-tab-id="${tabId}"]`) as HTMLElement;
      if (!tabElement) return;

      const isHorizontal = orientation === "horizontal";
      const tabRect = tabElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (isHorizontal) {
        const tabLeft = tabRect.left - containerRect.left + container.scrollLeft;
        const tabRight = tabRect.right - containerRect.left + container.scrollLeft;
        const containerWidth = container.clientWidth;
        
        // If tab is not fully visible, scroll to make it visible
        if (tabLeft < container.scrollLeft) {
          container.scrollTo({ left: tabLeft, behavior: "smooth" });
        } else if (tabRight > container.scrollLeft + containerWidth) {
          container.scrollTo({ left: tabRight - containerWidth, behavior: "smooth" });
        }
      }
      // Similar logic for vertical orientation...
    },
    [containerRef, orientation]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set up observers
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(container);

    const mutationObserver = new MutationObserver(updateScrollState);
    mutationObserver.observe(container, { 
      childList: true, 
      subtree: true,
      attributes: true 
    });

    container.addEventListener("scroll", updateScrollState, { passive: true });

    // Initial check with multiple attempts (DOM might not be ready immediately)
    const attempts = [100, 300, 500];
    attempts.forEach(delay => {
      setTimeout(updateScrollState, delay);
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      container.removeEventListener("scroll", updateScrollState);
    };
  }, [containerRef, updateScrollState]);

  return {
    showPrevButton,
    showNextButton,
    scrollToTab,
    scrollBy,
    updateScrollState,
  };
};