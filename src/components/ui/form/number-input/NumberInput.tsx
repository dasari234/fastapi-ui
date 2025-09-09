import { DollarSign, Percent, X } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { cn } from "../../../../lib/utils";
import type { NumberInputProps } from "../../../../lib/use-form/types";
import {
  getFieldError,
  isFieldInvalid,
  getInputClasses,
  getLabelClasses,
  validateField
} from "../../../../lib/use-form/form-utils";

export function NumberInput<T extends object>({
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
  className,
  ...htmlAttributes
}: NumberInputProps<T>) {
  const { value, onChange, onBlur } = form.getInputProps(name);
  const error = getFieldError(form, name as string);
  const isInvalid = isFieldInvalid(form, name as string);
  const isTouched = form.touched[name as string];
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (value === undefined || value === null) {
      setInputValue("");
    } else {
      setInputValue(value.toString());
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    let sanitizedValue = rawValue.replace(/[^0-9.]/g, "");

    if ((sanitizedValue.match(/\./g) || []).length > 1) {
      sanitizedValue = sanitizedValue.substring(0, sanitizedValue.lastIndexOf("."));
    }

    if (prefix === "percent") {
      sanitizedValue = sanitizedValue.replace(".", "");
    }

    const numericValue = parseFloat(sanitizedValue || "");
    if (!isNaN(numericValue)) {
      if (numericValue > max) sanitizedValue = max.toString();
      else if (numericValue < min) sanitizedValue = min.toString();
    }

    setInputValue(sanitizedValue);
    onChange(sanitizedValue);
  };

  const handleBlur = () => {
    const numericValue = parseFloat(inputValue || "");
    
    if (!isNaN(numericValue)) {
      const constrainedValue = Math.min(max, Math.max(min, numericValue));
      let formattedValue = constrainedValue.toString();
      
      if (prefix === "currency") {
        formattedValue = constrainedValue.toFixed(decimalScale);
      } else if (prefix === "percent") {
        formattedValue = Math.round(constrainedValue).toString();
      }

      setInputValue(formattedValue);
      onChange(formattedValue);
    }

    onBlur?.();
    if (isTouched && isInvalid) {
      validateField(form, name as string);
    }
    setIsFocused(false);
  };

  const handleFocus = () => setIsFocused(true);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["-", "e", "E", "+"].includes(e.key) || (prefix === "percent" && e.key === ".")) {
      e.preventDefault();
    }
  };

  const displayValue = isFocused ? inputValue : 
    prefix === "currency" && inputValue ? parseFloat(inputValue).toFixed(decimalScale) : inputValue;

  const hasValue = displayValue !== "";

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label htmlFor={name as string} className={getLabelClasses(disabled)}>
          {label}
          {withAsterisk && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {prefix && (
          <div className={cn("absolute left-2", disabled ? "text-gray-300" : "text-gray-400")}>
            {prefix === "currency" ? (
              <DollarSign className="w-3.5 h-3.5" />
            ) : (
              <Percent className="w-3.5 h-3.5" />
            )}
          </div>
        )}

        <input
          {...htmlAttributes}
          id={name as string}
          name={name as string}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || (prefix === "currency" ? "0.00" : prefix === "percent" ? "0" : "")}
          className={cn(
            getInputClasses(isInvalid, disabled, hasValue, !!clearable),
            prefix && "pl-7"
          )}
          disabled={disabled}
        />

        {hasValue && clearable && !disabled && (
          <button
            type="button"
            onClick={() => { onChange(""); setInputValue(""); }}
            className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Clear input"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isInvalid && error && (
        <p className="mt-1 text-xs text-red-500 animate-fadeIn">{error}</p>
      )}
    </div>
  );
}