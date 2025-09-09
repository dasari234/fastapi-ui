import { cn } from "../../../../lib/utils";
import type { CheckboxProps } from "../../../../lib/use-form/types";
import {
  getFieldError,
  isFieldInvalid,
  getLabelClasses,
} from "../../../../lib/use-form/form-utils";
import { Check } from "lucide-react";

export function Checkbox<T extends object>({
  label,
  name,
  form,
  withAsterisk,
  description,
  disabled = false,
  size = "md",
  containerClassName,
  ...htmlAttributes
}: CheckboxProps<T> &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "size">) {
  const { checked, onChange, onBlur } = form.getInputProps(name, {
    type: "checkbox",
  });
  const error = getFieldError(form, name as string);
  const isInvalid = isFieldInvalid(form, name as string);
  const isTouched = form.touched[name as string];

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleBlur = () => {
    onBlur?.();
    if (isTouched && isInvalid) {
      // Validate on blur if needed
    }
  };

  return (
    <div className={cn("space-y-1", containerClassName)}>
      <label
        className={cn(
          "flex items-start gap-3 cursor-pointer group",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        {/* Custom checkbox */}
        <div
          className={cn(
            "relative flex items-center justify-center border rounded transition-all duration-200",
            sizeClasses[size],
            "shadow-sm focus-within:ring-2 focus-within:ring-offset-1",
            checked
              ? "bg-blue-600 border-blue-600"
              : "bg-white border-gray-300",
            isInvalid && "border-red-500",
            disabled && "bg-gray-100 border-gray-300",
            !disabled &&
              cn(
                "group-hover:border-blue-400",
                checked && "group-hover:bg-blue-700 group-hover:border-blue-700"
              )
          )}
        >
          <input
            {...htmlAttributes}
            id={name as string}
            name={name as string}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(
              "absolute inset-0 w-full h-full opacity-0 cursor-pointer",
              disabled && "cursor-not-allowed"
            )}
          />

          {checked && (
            <Check
              className={cn(
                "text-white transition-all duration-200",
                size === "sm"
                  ? "w-3 h-3"
                  : size === "md"
                  ? "w-4 h-4"
                  : "w-5 h-5"
              )}
              strokeWidth={3}
            />
          )}
        </div>

        {/* Label and description */}
        <div className="flex-1 min-w-0">
          {label && (
            <span
              className={cn(
                getLabelClasses(disabled),
                "block font-medium text-gray-900"
              )}
            >
              {label}
              {withAsterisk && <span className="text-red-500 ml-1">*</span>}
            </span>
          )}

          {description && (
            <p
              className={cn(
                "text-sm mt-1",
                disabled ? "text-gray-400" : "text-gray-500"
              )}
            >
              {description}
            </p>
          )}
        </div>
      </label>

      {isInvalid && error && (
        <p className="text-red-500 text-xs mt-1 animate-fadeIn">{error}</p>
      )}
    </div>
  );
}
