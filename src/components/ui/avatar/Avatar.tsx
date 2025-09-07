import { cn } from "../../../lib/utils";

type AvatarProps = {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  initials?: string;
  status?: "online" | "offline" | "busy" | "away";
  border?: boolean;
  className?: string;
};

export function Avatar({
  src,
  alt = "User Avatar",
  size = "sm",
  initials,
  status,
  border = true,
  className,
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
  };

  const statusClasses = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    busy: "bg-red-500",
    away: "bg-yellow-500",
  };

  const statusColor = status ? statusClasses[status] : null;

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-",
          sizeClasses[size],
          border ? "border-gray-300" : "",
          src ? "" : "bg-gray-200"
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="rounded-full object-cover w-full h-full"
          />
        ) : (
          <span className="font-bold text-slategray">{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
            statusColor
          )}
        />
      )}
    </div>
  );
}
