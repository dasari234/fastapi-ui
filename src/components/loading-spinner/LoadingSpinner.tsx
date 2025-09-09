import { LoaderCircle } from "lucide-react";
import { cn } from "../../lib/utils";

type Variant = "default" | "primary" | "secondary" | "danger" | "success" | "warning";

interface LoadingSpinnerProps {
  className?: string;
  variant?: Variant;
}

const variantColors: Record<Variant, string> = {
  primary: "text-blue-500",
  secondary: "text-gray-500",
  danger: "text-red-500",
  success: "text-green-500",
  warning: "text-yellow-500",
  default: "text-white",
};

export default function LoadingSpinner({
  className = "",
  variant = "default",
}: LoadingSpinnerProps) {
  const resolvedColor = variantColors[variant];
  return (
    <LoaderCircle
      className={cn("animate-spin", resolvedColor, className)}
    />
  );
}
