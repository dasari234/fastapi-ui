import { X } from "lucide-react";
import { cn } from "../../../../lib/utils";
import type { Path, UseFormReturnType } from "../../../../lib/utils/use-form/types";


interface TextareaInputProps<T extends object> {
  label?: string;
  name: Path<T>;
  form: UseFormReturnType<T>;
  withAsterisk?: boolean;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

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
}: TextareaInputProps<T> & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'>) {
  const { value, onChange, onBlur } = form.getInputProps(name);
  const error = form.errors[name];
  const isInvalid = !!error;

  const handleClear = () => {
    onChange("");
  };

  // Safely convert value to string
  const stringValue = value == null ? '' : String(value);

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

      <div className="relative">
        <textarea
          {...htmlAttributes}
          id={name}
          name={name}
          value={stringValue}
          rows={rows}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={name}
          placeholder={placeholder}
          className={cn(
            "w-full px-3 py-2.5 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 resize-y min-h-[80px]",
            stringValue && clearable && "pr-8",
            disabled && "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed",
            isInvalid && !disabled && "border-red-500 focus:ring-red-500",
            !isInvalid && !disabled && "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
            className
          )}
          disabled={disabled}
          readOnly={disabled}
        />

        {stringValue && clearable && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 rounded"
            aria-label="Clear input"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isInvalid && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}