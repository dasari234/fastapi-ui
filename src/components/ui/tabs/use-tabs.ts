import { useCallback, useState } from "react";
import type { Tab, TabConfig } from "./tab-types";

interface UseTabsReturn {
  tabs: Tab[];
  activeTab: string;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
  setActive: (tabId: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  activeTabData: Tab | undefined;
}

export const useTabs = (
  initialTabs: Tab[] = [],
  config?: TabConfig,
  controlledActiveTab?: string
): UseTabsReturn => {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [internalActive, setInternalActive] = useState<string>(
    initialTabs[0]?.id || ""
  );

  // controlled if parent provides activeTab, otherwise internal
  const activeTab = controlledActiveTab ?? internalActive;

  const addTab = useCallback(
    (tab: Tab) => {
      setTabs((prev) => {
        if (config?.maxTabs && prev.length >= config.maxTabs) {
          console.warn(`Maximum ${config.maxTabs} tabs allowed`);
          return prev;
        }
        return [...prev, tab];
      });
      if (!controlledActiveTab) {
        setInternalActive(tab.id);
      }
    },
    [config?.maxTabs, controlledActiveTab]
  );

  const removeTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        const newTabs = prev.filter((tab) => tab.id !== tabId);

        if (!controlledActiveTab) {
          if (activeTab === tabId && newTabs.length > 0) {
            setInternalActive(newTabs[0].id);
          } else if (newTabs.length === 0) {
            setInternalActive("");
          }
        }

        return newTabs;
      });
    },
    [activeTab, controlledActiveTab]
  );

  const updateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab))
    );
  }, []);

  const setActive = useCallback(
    (tabId: string) => {
      if (controlledActiveTab) return; // parent controls it
      const tab = tabs.find((t) => t.id === tabId);
      if (tab && !tab.disabled) {
        setInternalActive(tabId);
      }
    },
    [tabs, controlledActiveTab]
  );

  const reorderTabs = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!config?.draggable) return;

      setTabs((prev) => {
        const newTabs = [...prev];
        const [movedTab] = newTabs.splice(fromIndex, 1);
        newTabs.splice(toIndex, 0, movedTab);
        return newTabs;
      });
    },
    [config?.draggable]
  );

  return {
    tabs,
    activeTab,
    addTab,
    removeTab,
    updateTab,
    setActive,
    reorderTabs,
    activeTabData: tabs.find((tab) => tab.id === activeTab),
  };
};
