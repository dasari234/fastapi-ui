import { Loader2 } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "round";

type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      loading = false,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "flex items-center cursor-pointer justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants: Record<ButtonVariant, string> = {
      default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      outline:
        "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:ring-gray-400",
      secondary:
        "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400",
      ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
      link: "text-blue-600 underline-offset-4 hover:underline focus:ring-blue-400",
      round: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 rounded-full",
    };

    const sizes: Record<ButtonSize, string> = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-6 w-6 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={loading || disabled}
        {...props}
      >
        {loading && (
          <Loader2
            className={cn(
              "animate-spin shrink-0",
              size === "sm" ? "w-3 h-3 mr-1" : "w-4 h-4 mr-2"
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
