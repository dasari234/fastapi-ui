import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "../../../hooks/use-body-scroll-lock";
import { cn } from "../../../lib/utils";
import { Button } from "../Button";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  showCloseButton?: boolean;
  className?: string;
}

const slideVariants = {
  right: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
  },
  left: {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
  },
  top: {
    initial: { y: "-100%" },
    animate: { y: 0 },
    exit: { y: "-100%" },
  },
  bottom: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
  },
};

export default function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  showCloseButton = true,
  className,
}: DrawerProps) {
  const overlayRef = useRef(null);

  useBodyScrollLock(open);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleKey);
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === overlayRef.current && onClose()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={slideVariants[side].initial}
            animate={slideVariants[side].animate}
            exit={slideVariants[side].exit}
            transition={{ duration: 0.3 }}
            className={cn(
              "absolute bg-white shadow-xl w-full sm:w-[400px] h-full p-6",
              side === "right" && "right-0 top-0",
              side === "left" && "left-0 top-0",
              side === "top" && "top-0 left-0 w-full h-[60%]",
              side === "bottom" && "bottom-0 left-0 w-full h-[60%]",
              className
            )}
          >
            {showCloseButton && (
              <Button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                aria-label="Close drawer"
                variant="ghost"
                size="icon"
              >
               <X className="size-4" />
              </Button>
            )}
            {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
            <div>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}




// "use client";

// import { useState } from "react";
// import Drawer from "@/components/ui/Drawer";

// export default function DrawerDemo() {
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       <button
//         onClick={() => setOpen(true)}
//         className="bg-indigo-600 text-white px-4 py-2 rounded"
//       >
//         Open Drawer
//       </button>

//       <Drawer
//         open={open}
//         onClose={() => setOpen(false)}
//         title="Job Filters"
//         side="right" // change to "left", "top", "bottom" as needed
//       >
//         <p>This is your drawer content.</p>
//         <button
//           onClick={() => setOpen(false)}
//           className="mt-4 bg-gray-800 text-white px-4 py-2 rounded"
//         >
//           Close
//         </button>
//       </Drawer>
//     </>
//   );
// }
