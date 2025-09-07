
import { DollarSign, Percent } from "lucide-react";
import { X } from "lucide-react";
import {

  useState,
  useEffect,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,

} from "react";
import { cn } from "../../../../lib/utils";
import type { TextInputProps } from "../../../../types";

interface ExtendedTextInputProps<T> extends TextInputProps<T> {
  prefix?: "currency" | "percent";
  max?: number;
  min?: number;
  decimalScale?: number;
  disabled?: boolean;
}

export function NumberInput<T>({
  label,
  name,
  form,
  withAsterisk,
  placeholder,
  clearable,
  prefix,
  max = prefix === "percent" ? 100 : Infinity,
  disabled = false,
  min = 0,
  decimalScale = prefix === "percent" ? 0 : 2,
  ...htmlAttributes
}: ExtendedTextInputProps<T> & { prefix?: string }) {
  const { value, onChange, onBlur } = form.getInputProps(name);
  const error = form.errors[name];
  const isInvalid = !!error;
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Sync form value with input state
  useEffect(() => {
    if (value === undefined || value === null) {
      setInputValue("");
    } else {
      // Convert to string without formatting
      setInputValue(value.toString());
    }
  }, [value]);

  // Handle input changes with validation
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Remove any non-numeric characters except decimal point
    let sanitizedValue = rawValue.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    if ((sanitizedValue.match(/\./g) || []).length > 1) {
      sanitizedValue = sanitizedValue.substring(
        0,
        sanitizedValue.lastIndexOf(".")
      );
    }

    // For percent, remove decimal points
    if (prefix === "percent") {
      sanitizedValue = sanitizedValue.replace(".", "");
    }

    // Apply min/max constraints
    const numericValue = parseFloat(sanitizedValue || "");
    if (!isNaN(numericValue)) {
      if (numericValue > max) {
        sanitizedValue = max.toString();
      } else if (numericValue < min) {
        sanitizedValue = min.toString();
      }
    }

    // Update input value
    setInputValue(sanitizedValue);

    // Update form value
    onChange(sanitizedValue);
  };

  // Format value on blur
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const numericValue = parseFloat(inputValue || "");

    if (!isNaN(numericValue)) {
      // Apply constraints
      const constrainedValue = Math.min(max, Math.max(min, numericValue));

      // Format based on prefix
      let formattedValue = "";
      if (prefix === "currency") {
        formattedValue = constrainedValue.toFixed(decimalScale);
      } else if (prefix === "percent") {
        formattedValue = Math.round(constrainedValue).toString();
      } else {
        formattedValue = constrainedValue.toString();
      }

      // Update states
      setInputValue(formattedValue);
      onChange(formattedValue);
    }

    // Call original onBlur
    onBlur?.(e);
    setIsFocused(false);
  };

  // Handle focus event
  const handleFocus = () => {
    setIsFocused(true);
  };

  // Prevent invalid keys
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["-", "e", "E", "+"].includes(e.key)) {
      e.preventDefault();
    }

    // Prevent decimal for percentages
    if (prefix === "percent" && e.key === ".") {
      e.preventDefault();
    }
  };

  // Display raw value when focused, formatted when blurred
  const displayValue = isFocused
    ? inputValue
    : prefix === "currency" && inputValue
      ? parseFloat(inputValue).toFixed(decimalScale)
      : inputValue;

  return (
    <div className="relative">
      {label && (
        <label
          htmlFor={name}
          className={cn(
            "block text-sm font-medium mb-1",
            disabled ? "text-gray-400" : "text-gray-700"
          )}
        >
          {label}
          {withAsterisk && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Prefix icon for currency/percent */}
        {prefix && (
          <div
            className={cn(
              "absolute left-2",
              disabled ? "text-gray-300" : "text-gray-400"
            )}
          >
            {prefix === "currency" ? (
              <DollarSign className="w-3.5 h-3.5 text-gray-400" />
            ) : prefix === "percent" ? (
              <Percent className="w-3.5 h-3.5 text-gray-400" />
            ) : null}
          </div>
        )}

        <input
          id={name}
          name={name}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={
            placeholder ||
            (prefix === "currency" ? "0.00" : prefix === "percent" ? "0" : "")
          }
          className={cn(
            "w-full py-2.5 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-1",
            prefix ? "pl-7" : "pl-3",
            disabled
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : isInvalid
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
          )}
          disabled={disabled}
          readOnly={disabled}
          {...htmlAttributes}
        />

        {/* Clear button */}
        {inputValue && clearable && !disabled && (
          <button
            type="button"
            className="absolute right-3 text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.preventDefault();
              onChange("");
              setInputValue("");
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isInvalid && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
