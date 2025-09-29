import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Plus } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "../../../lib/utils";
import { NavigationButtons } from "./NavigationButtons";
import type { Tab, TabConfig } from "./tab-types";
import { TabComponent } from "./TabComponent";
import { useTabNavigation } from "./use-tab-navigation";
import { useTabs } from "./use-tabs";

interface TabsProps {
  tabs: Tab[];
  config?: TabConfig;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onTabAdd?: () => void;
  onTabClose?: (tabId: string) => void;
  className?: string;
  contentClassName?: string;
}

const animationVariants: Record<
  NonNullable<TabConfig["animation"]>,
  Variants
> = {
  slide: {
    initial: (custom: number) => ({
      x: custom * 300,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
    },
    exit: (custom: number) => ({
      x: custom * -300,
      opacity: 0,
    }),
  },
  fade: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  },
  scale: {
    initial: {
      scale: 0.8,
      opacity: 0,
    },
    animate: {
      scale: 1,
      opacity: 1,
    },
    exit: {
      scale: 0.8,
      opacity: 0,
    },
  },
  none: {
    initial: {},
    animate: {},
    exit: {},
  },
};

export const Tabs = ({
  tabs: initialTabs,
  config = {},
  activeTab: controlledActiveTab,
  onTabChange,
  onTabAdd,
  onTabClose,
  className,
  contentClassName,
}: TabsProps) => {
  const { tabs, activeTab, setActive, activeTabData, removeTab } = useTabs(
    initialTabs,
    config,
    controlledActiveTab
  );

  const [direction, setDirection] = useState(0);
  const tabsContainerRef = useRef<HTMLDivElement>(null!);
  const [availableWidth, setAvailableWidth] = useState<number>(300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const orientation =
    config.position === "left" || config.position === "right"
      ? "vertical"
      : "horizontal";

  const {
    showPrevButton,
    showNextButton,
    scrollToTab,
    scrollBy,
    updateScrollState,
  } = useTabNavigation({
    containerRef: tabsContainerRef,
    orientation,
  });

  // Stable width calculation without infinite loops
  useLayoutEffect(() => {
    if (!wrapperRef.current) return;

    const updateAvailableWidth = () => {
      const width = wrapperRef.current?.clientWidth || 0;

      // Calculate reserved space
      let reservedSpace = 0;

      // Reserve space for navigation buttons if enabled
      if (config.showNavigationButtons !== false) {
        reservedSpace += 80; // Space for both buttons
      }

      // Reserve space for add button if enabled
      if (config.addable) {
        reservedSpace += 48;
      }

      const newWidth = Math.max(200, width - reservedSpace);

      // Only update if changed significantly (more than 5px) to avoid micro-adjustments
      setAvailableWidth((prev) =>
        Math.abs(prev - newWidth) > 5 ? newWidth : prev
      );
    };

    // Initial calculation
    const timer = setTimeout(updateAvailableWidth, 150);

    // Resize observer with debouncing
    let resizeTimer: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateAvailableWidth, 100);
    });

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    window.addEventListener("resize", updateAvailableWidth);

    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateAvailableWidth);
    };
  }, [config.showNavigationButtons, config.addable]); // Stable dependencies

  // Scroll state management
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      updateScrollState();
    }, 200); // Delay to allow animations to complete

    return () => clearTimeout(timer);
  }, [updateScrollState, tabs]);

  useLayoutEffect(() => {
    const handleResize = () => {
      setTimeout(updateScrollState, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateScrollState]);

  const handleTabSelect = (tabId: string) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const newIndex = tabs.findIndex((tab) => tab.id === tabId);

    setDirection(newIndex > currentIndex ? 1 : -1);
    setActive(tabId);

    setTimeout(() => {
      scrollToTab(tabId);
    }, 150);

    onTabChange?.(tabId);
  };

  const handleTabClose = (tabId: string) => {
    onTabClose?.(tabId);
    removeTab(tabId);
  };

  const handleAddTab = () => onTabAdd?.();

  const getScrollAmount = (): number => {
    if (!tabsContainerRef.current) return 200;
    return orientation === "horizontal"
      ? tabsContainerRef.current.clientWidth * 0.8
      : tabsContainerRef.current.clientHeight * 0.8;
  };

  const handlePrev = () => scrollBy(-getScrollAmount());
  const handleNext = () => scrollBy(getScrollAmount());

  const getPositionClasses = (): string => {
    switch (config.position) {
      case "bottom":
        return "flex-col-reverse";
      case "left":
        return "flex-row";
      case "right":
        return "flex-row-reverse";
      default:
        return "flex-col";
    }
  };

  const getContentAnimation = (): Variants => {
    const variant = config.animation || "fade";
    return animationVariants[variant];
  };

  const renderTabContent = () => {
    if (!activeTabData) return null;

    const content =
      typeof activeTabData.component === "function"
        ? activeTabData.component(activeTabData)
        : activeTabData.component;

    return (
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeTab}
          custom={direction}
          variants={getContentAnimation()}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: (config.animationDuration || 300) / 1000 }}
          className={cn("h-full w-full", contentClassName)}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  };

  const shouldShowNavigation = config.showNavigationButtons !== false;

  return (
    <div
      ref={wrapperRef}
      className={cn("flex h-full w-full", getPositionClasses(), className)}
    >
      {/* Tab Headers Container */}
      <div
        className={cn(
          "flex bg-white border-gray-200 relative",
          config.position === "left" || config.position === "right"
            ? "flex-col w-48 border-r"
            : "flex-row border-b",
          config.position === "bottom" && "border-t border-b-0",
          config.variant === "pills" && "p-1"
        )}
      >
        {/* Tabs Container with Navigation */}
        <div
          className={cn(
            "flex flex-1 relative min-w-0",
            config.position === "left" || config.position === "right"
              ? "flex-col"
              : "flex-row"
          )}
        >
          {/* Navigation Buttons - Left */}
          {shouldShowNavigation && (
            <NavigationButtons
              orientation={orientation}
              showPrev={showPrevButton}
              showNext={false}
              onPrev={handlePrev}
              onNext={handleNext}
              className={cn(
                orientation === "horizontal" ? "border-r" : "border-b",
                "flex-shrink-0"
              )}
            />
          )}

          {/* Tabs Container */}
          <div
            ref={tabsContainerRef}
            className={cn(
              "flex overflow-x-auto overflow-y-hidden relative",
              config.position === "left" || config.position === "right"
                ? "flex-col overflow-y-auto overflow-x-hidden h-48"
                : "flex-row",
              config.variant === "pills" && "gap-1"
            )}
            style={{
              maxWidth:
                orientation === "horizontal" ? `${availableWidth}px` : "none",
              maxHeight: orientation === "vertical" ? "200px" : "none",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <AnimatePresence>
              {tabs.map((tab) => (
                <TabComponent
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onSelect={handleTabSelect}
                  onClose={tab.closable ? handleTabClose : undefined}
                  variant={config.variant}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Navigation Buttons - Right */}
          {shouldShowNavigation && (
            <NavigationButtons
              orientation={orientation}
              showPrev={false}
              showNext={showNextButton}
              onPrev={handlePrev}
              onNext={handleNext}
              className={cn(
                orientation === "horizontal" ? "border-l" : "border-t",
                "flex-shrink-0"
              )}
            />
          )}
        </div>

        {/* Add Tab Button */}
        {config.addable && (
          <div
            className={cn(
              "flex items-center p-2 border-gray-200 flex-shrink-0",
              config.position === "left" || config.position === "right"
                ? "justify-center border-t"
                : "border-l"
            )}
          >
            <button
              onClick={handleAddTab}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              title="Add new tab"
              type="button"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 bg-white relative overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
};
