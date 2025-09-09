import { X } from "lucide-react";
import { cn } from "../../../../lib/utils";
import type { TextInputProps } from "../../../../lib/use-form/types";
import {
  getFieldError,
  getInputClasses,
  getLabelClasses,
  isFieldInvalid,
  validateField,
} from "../../../../lib/use-form/form-utils";

export function TextInput<T extends object>({
  label,
  name,
  form,
  withAsterisk,
  placeholder,
  clearable,
  disabled = false,
  type = "text",
  className,
  ...htmlAttributes
}: TextInputProps<T> &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  const { value, onChange, onBlur } = form.getInputProps(name);
  const error = getFieldError(form, name as string);
  const isInvalid = isFieldInvalid(form, name as string);
  const isTouched = form.touched[name as string];

  const handleClear = () => {
    onChange("");
  };

  const handleBlur = () => {
    onBlur?.();
    if (isTouched && isInvalid) {
      validateField(form, name as string);
    }
  };

  const stringValue = value == null ? "" : String(value);
  const hasValue = stringValue !== "";

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label htmlFor={name as string} className={getLabelClasses(disabled)}>
          {label}
          {withAsterisk && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          {...htmlAttributes}
          type={type}
          id={name as string}
          name={name as string}
          value={stringValue}
          onChange={onChange}
          onBlur={handleBlur}
          autoComplete={name as string}
          placeholder={placeholder}
          className={getInputClasses(
            isInvalid,
            disabled,
            hasValue,
            !!clearable
          )}
          disabled={disabled}
          readOnly={disabled}
        />

        {hasValue && clearable && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
