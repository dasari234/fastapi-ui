import { X } from "lucide-react";
import { cn } from "../../../../lib/utils";
import type { TextareaProps } from "../../../../lib/use-form/types";
import {
  getFieldError,
  isFieldInvalid,
  getInputClasses,
  getLabelClasses,
  validateField
} from "../../../../lib/use-form/form-utils";

export function TextareaInput<T extends object>({
  label,
  name,
  form,
  withAsterisk,
  placeholder,
  clearable,
  disabled = false,
  rows = 3,
  className,
  ...htmlAttributes
}: TextareaProps<T> & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'>) {
  const { value, onChange, onBlur } = form.getInputProps(name);
  const error = getFieldError(form, name as string);
  const isInvalid = isFieldInvalid(form, name as string);
  const isTouched = form.touched[name as string];

  const handleClear = () => onChange("");
  
  const handleBlur = () => {
    onBlur?.();
    if (isTouched && isInvalid) {
      validateField(form, name as string);
    }
  };

  const stringValue = value == null ? '' : String(value);
  const hasValue = stringValue !== '';

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label htmlFor={name as string} className={getLabelClasses(disabled)}>
          {label}
          {withAsterisk && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <textarea
          {...htmlAttributes}
          id={name as string}
          name={name as string}
          value={stringValue}
          rows={rows}
          onChange={onChange}
          onBlur={handleBlur}
          autoComplete={name as string}
          placeholder={placeholder}
          className={cn(
            getInputClasses(isInvalid, disabled, hasValue, !!clearable),
            "resize-y min-h-[80px]"
          )}
          disabled={disabled}
        />

        {hasValue && clearable && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 rounded transition-colors duration-200"
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