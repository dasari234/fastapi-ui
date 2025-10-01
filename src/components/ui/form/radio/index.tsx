import { useRef } from "react";
import {
    getFieldError,
    getLabelClasses,
    isFieldInvalid,
} from "../../../../lib/use-form/form-utils";
import type { RadioProps } from "../../../../lib/use-form/types";
import { cn } from "../../../../lib/utils";

export function Radio<T extends object>({
  label,
  name,
  form,
  withAsterisk,
  description,
  disabled = false,
  size = "md",
  containerClassName,
  // Non-form props
  checked: externalChecked,
  value,
  onChange: externalOnChange,
  ...htmlAttributes
}: RadioProps<T> &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "size">) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine if we're in form mode or non-form mode
  const isFormMode = !!form && !!name;

  const formProps = isFormMode
    ? form.getInputProps(name, { type: "radio" })
    : null;

  const checked = isFormMode ? formProps!.checked : externalChecked;
  const error = isFormMode ? getFieldError(form, name as string) : null;
  const isInvalid = isFormMode ? isFieldInvalid(form, name as string) : false;
  const isTouched = isFormMode ? form.touched[name as string] : false;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const dotSizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isFormMode) {
      formProps!.onChange(event);
    } else {
      externalOnChange?.(event);
    }
  };

  const handleBlur = () => {
    if (isFormMode) {
      formProps!.onBlur?.();
      if (isTouched && isInvalid) {
        // Validate on blur if needed
      }
    }
  };

  const getBorderColor = () => {
    if (disabled) return "border-gray-300 bg-gray-100";
    if (checked) return "border-blue-600";
    return "border-gray-300 bg-white";
  };

  return (
    <div className={cn("space-y-1", containerClassName)}>
      <label
        className={cn(
          "flex items-start gap-3 cursor-pointer group",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        {/* Custom radio */}
        <div
          className={cn(
            "relative flex items-center justify-center border rounded-full transition-all duration-200",
            sizeClasses[size],
            "shadow-sm focus-within:ring-2 focus-within:ring-offset-1",
            getBorderColor(),
            isInvalid && "border-red-500",
            !disabled &&
              cn(
                "group-hover:border-blue-400",
                checked && "group-hover:border-blue-700"
              )
          )}
        >
          <input
            {...htmlAttributes}
            ref={inputRef}
            id={`${name}-${value}`}
            name={name as string}
            type="radio"
            value={value}
            checked={checked || false}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(
              "absolute inset-0 w-full h-full opacity-0 cursor-pointer",
              disabled && "cursor-not-allowed"
            )}
          />

          {/* Dot when selected */}
          {checked && (
            <span
              className={cn(
                "rounded-full bg-blue-600 transition-all duration-200",
                dotSizeClasses[size]
              )}
            />
          )}
        </div>

        {/* Label and description */}
        <div className="flex-1 min-w-0">
          {label && (
            <span
              className={cn(
                isFormMode ? getLabelClasses(disabled) : "",
                "block font-medium text-gray-900",
                disabled && "text-gray-400"
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
