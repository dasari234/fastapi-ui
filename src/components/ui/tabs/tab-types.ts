import type { Variants } from "framer-motion";
import type { ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  component: ReactNode | ((tab: Tab) => ReactNode);
  disabled?: boolean;
  closable?: boolean;
  data?: Record<string, unknown>;
}

export interface TabConfig {
  animation?: "slide" | "fade" | "scale" | "none";
  animationDuration?: number;
  variant?: "default" | "pills" | "underline";
  position?: "top" | "bottom" | "left" | "right";
  closable?: boolean;
  addable?: boolean;
  draggable?: boolean;
  maxTabs?: number;
  responsive?: boolean;
  showNavigationButtons?: boolean;
  scrollable?: boolean;
}

export interface TabComponentProps {
  tab: Tab;
  isActive: boolean;
  onSelect: (tabId: string) => void;
  onClose?: (tabId: string) => void;
  variant?: TabConfig["variant"];
}

export type AnimationVariants = {
  [key in NonNullable<TabConfig["animation"]>]: Variants[string];
};