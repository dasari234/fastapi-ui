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
    if (!container) return;
    
    const isHorizontal = orientation === "horizontal";
    const scrollSize = isHorizontal ? container.scrollWidth : container.scrollHeight;
    const clientSize = isHorizontal ? container.clientWidth : container.clientHeight;
    const currentScroll = isHorizontal ? container.scrollLeft : container.scrollTop;
    const maxScroll = Math.max(0, scrollSize - clientSize);

    setShowPrevButton(currentScroll > 10);
    setShowNextButton(currentScroll < maxScroll - 10);
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
      const tab = container?.querySelector(`[data-tab-id="${tabId}"]`) as HTMLElement;
      if (!container || !tab) return;

      const isHorizontal = orientation === "horizontal";
      const tabRect = tab.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (isHorizontal) {
        const tabLeft = tabRect.left - containerRect.left + container.scrollLeft;
        const tabRight = tabRect.right - containerRect.left + container.scrollLeft;
        
        if (tabLeft < container.scrollLeft) {
          container.scrollTo({ left: tabLeft - 10, behavior: "smooth" });
        } else if (tabRight > container.scrollLeft + container.clientWidth) {
          container.scrollTo({ left: tabRight - container.clientWidth + 10, behavior: "smooth" });
        }
      }
    },
    [containerRef, orientation]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add data attribute to tabs for easier selection
    const tabs = container.querySelectorAll('[data-tab-id]');
    tabs.forEach(tab => tab.removeAttribute('data-tab-id'));

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(container);

    container.addEventListener("scroll", updateScrollState, { passive: true });

    // Initial check with delay
    const timer = setTimeout(updateScrollState, 100);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
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