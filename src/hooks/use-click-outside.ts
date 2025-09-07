import { useEffect, useRef, type RefObject,  } from "react";

const DEFAULT_EVENTS = ["mousedown", "touchstart"] as const;

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  events?: (string | null)[] | null,
  nodes?: (HTMLElement | null | RefObject<HTMLElement | null>)[]
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const listener = (event: Event) => {
      const target = event.target as Node | null;
      if (!target?.isConnected) return;

      // Check if click originated from an ignored element
      let current: Node | null = target;
      while (current) {
        if (
          current instanceof Element &&
          current.hasAttribute("data-ignore-outside-clicks")
        ) {
          return;
        }
        current = current.parentNode;
      }

      // Convert node refs to elements
      const nodeList = nodes?.map((node) =>
        node && "current" in node ? node.current : node
      );

      if (Array.isArray(nodeList)) {
        const shouldTrigger = nodeList.every(
          (node) => !node || !node.contains(target)
        );
        if (shouldTrigger) handler();
      } else if (ref.current && !ref.current.contains(target)) {
        handler();
      }
    };

    const eventList = (events?.filter(Boolean) as string[]) || DEFAULT_EVENTS;

    eventList.forEach((fn) => {
      document.addEventListener(fn, listener);
    });

    return () => {
      eventList.forEach((fn) => {
        document.removeEventListener(fn, listener);
      });
    };
  }, [handler, events, nodes]);

  return ref;
}
