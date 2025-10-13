import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../../lib/utils";
import { Button } from "../Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  disableBackdropBlur?: boolean;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  className,
  closeOnOverlayClick = false,
  showCloseButton = true,
  disableBackdropBlur = false,
}: ModalProps) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; 
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [open, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/50",
            disableBackdropBlur ? "" : "backdrop-blur-sm"
          )}
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative",
              className
            )}
            role="dialog"
            aria-modal="true"
          >
            {showCloseButton && (
              <Button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 focus:outline-none rounded-full hover:bg-gray-200 p-1"
                aria-label="Close"
                variant="ghost"
                size="icon"
              >
                <X className="size-4" />
              </Button>
            )}
            {title && (
              <h2 className="text-lg font-semibold mb-4 text-gray-900">
                {title}
              </h2>
            )}
            <div className="w-full">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// import { useState } from "react";
// import Modal from "@/components/ui/Modal";

// export default function ModalDemo() {
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       <button
//         onClick={() => setOpen(true)}
//         className="bg-blue-600 text-white px-4 py-2 rounded"
//       >
//         Open Modal
//       </button>

    //   <Modal
    //     open={open}
    //     onClose={() => setOpen(false)}
    //     title="Welcome"
    //     closeOnOverlayClick
    //   >
    //     <p className="text-gray-700">This is a modal. Add your content here.</p>
    //     <button
    //       className="mt-4 bg-gray-800 text-white px-4 py-2 rounded"
    //       onClick={() => setOpen(false)}
    //     >
    //       Close
    //     </button>
    //   </Modal>
//     </>
//   );
// }
