import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../../lib/helpers";

type DrawerProps = {
  opened: boolean;
  onClose: () => void;
  position?: "left" | "right" | "top" | "bottom";
  size?: string; // e.g., "300px", "50%", etc.
  title?: string;
  withCloseButton?: boolean;
  overlayOpacity?: number;
  overlayColor?: string;
  closeOnOverlayClick?: boolean;
  children: React.ReactNode;
};

export function CubeDrawer({
  opened,
  onClose,
  position = "right",
  size = "750px",
  title,
  withCloseButton = true,
  overlayOpacity = 0.5,
  overlayColor = "black",
  closeOnOverlayClick = false,
  children,
}: DrawerProps) {
  useEffect(() => {
    if (opened) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  if (!opened) return null;

  const isHorizontal = position === "left" || position === "right";

  const positionClasses = {
    left: "left-0 top-0 h-full",
    right: "right-0 top-0 h-full",
    top: "top-0 left-0 w-full",
    bottom: "bottom-0 left-0 w-full",
  };

  const sizeClass =
    {
      sm: "w-64",
      md: "w-96",
      lg: "w-[735px]",
    }[size as "sm" | "md" | "lg"] ?? "w-[735px]";

  const drawerStyle = isHorizontal ? { width: size } : { height: size };

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity,
        }}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          "absolute bg-white shadow-xl overflow-auto transition-transform duration-300",
          positionClasses[position]
        )}
        style={drawerStyle}
      >
        {/* Header */}
        {(title || withCloseButton) && (
          <div
            className={cn(
              "fixed flex items-center justify-between p-4 border-b z-50 bg-white inset shadow-sm", sizeClass
            )}
          >
            {title && <h2 className="text-lg font-medium">{title}</h2>}
            {withCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4 mt-[50px]">{children}</div>
      </div>
    </div>,
    document.body
  );
}
