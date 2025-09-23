import { Check, Minus } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  getFieldError,
  getLabelClasses,
  isFieldInvalid,
} from "../../../../lib/use-form/form-utils";
import type { CheckboxProps } from "../../../../lib/use-form/types";
import { cn } from "../../../../lib/utils";

export function Checkbox<T extends object>({
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
  indeterminate = false,
  onChange: externalOnChange,
  ...htmlAttributes
}: CheckboxProps<T> &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "size">) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Determine if we're in form mode or non-form mode
  const isFormMode = !!form && !!name;
  
  // Form mode values
  const formProps = isFormMode ? form.getInputProps(name, {
    type: "checkbox",
  }) : null;
  
  const checked = isFormMode ? formProps!.checked : externalChecked;
  const error = isFormMode ? getFieldError(form, name as string) : null;
  const isInvalid = isFormMode ? isFieldInvalid(form, name as string) : false;
  const isTouched = isFormMode ? form.touched[name as string] : false;

  // Set native indeterminate property
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
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

  // Determine background color based on state
  const getBackgroundColor = () => {
    if (disabled) return "bg-gray-100 border-gray-300";
    
    if (indeterminate) return "bg-blue-600 border-blue-600";
    if (checked) return "bg-blue-600 border-blue-600";
    
    return "bg-white border-gray-300";
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
            getBackgroundColor(),
            isInvalid && "border-red-500",
            !disabled &&
              cn(
                "group-hover:border-blue-400",
                (checked || indeterminate) && "group-hover:bg-blue-700 group-hover:border-blue-700"
              )
          )}
        >
          <input
            {...htmlAttributes}
            ref={inputRef}
            id={name as string}
            name={name as string}
            type="checkbox"
            checked={checked || false}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(
              "absolute inset-0 w-full h-full opacity-0 cursor-pointer",
              disabled && "cursor-not-allowed"
            )}
          />

          {/* Icon display - indeterminate takes priority */}
          {indeterminate ? (
            <Minus
              className={cn(
                "text-white transition-all duration-200",
                size === "sm" ? "w-3 h-3" :
                size === "md" ? "w-4 h-4" : "w-5 h-5"
              )}
              strokeWidth={3}
            />
          ) : checked ? (
            <Check
              className={cn(
                "text-white transition-all duration-200",
                size === "sm" ? "w-3 h-3" :
                size === "md" ? "w-4 h-4" : "w-5 h-5"
              )}
              strokeWidth={3}
            />
          ) : null}
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