import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../../lib/helpers';

type ModalProps = {
  opened: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  centered?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | string;
  withCloseButton?: boolean;
  overlayOpacity?: number;
  overlayBlur?: string;
  className?: string;
  fullScreen?: boolean;
};

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function CubeModal({
  opened,
  onClose,
  title,
  children,
  centered = true,
  size = 'md',
  withCloseButton = true,
  overlayOpacity = 0.4,
  overlayBlur = 'backdrop-blur-sm',
  className,
  fullScreen = false,
}: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (opened) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [opened, onClose]);

  if (!opened) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        centered ? '' : 'items-start pt-20'
      )}
    >
      <div
        className={cn(
          'fixed inset-0 bg-black transition-opacity duration-300',
          overlayBlur,
          `bg-opacity-${Math.round(overlayOpacity * 100)}`
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'bg-white dark:bg-gray-900 rounded-lg shadow-lg z-50 overflow-hidden transition-all duration-300',
          fullScreen ? 'w-full h-full' : (size in sizeClasses ? sizeClasses[size as keyof typeof sizeClasses] : size),
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || withCloseButton) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            {title && <h2 className="text-lg font-medium">{title}</h2>}
            {withCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}


// import { useState } from 'react';
// import { CustomModal } from './CustomModal';

// export default function Example() {
//   const [opened, setOpened] = useState(false);

//   return (
//     <>
//       <button
//         onClick={() => setOpened(true)}
//         className="bg-blue-500 text-white px-4 py-2 rounded"
//       >
//         Open Modal
//       </button>

//       <CustomModal
//         opened={opened}
//         onClose={() => setOpened(false)}
//         title="My Custom Modal"
//         size="lg"
//         centered
//         withCloseButton
//       >
//         <p>This is modal content!</p>
//       </CustomModal>
//     </>
//   );
// }
