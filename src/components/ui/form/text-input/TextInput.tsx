import { X } from "lucide-react";
import { cn } from "../../../../lib/utils";
import type { Path, UseFormReturnType } from "../../../../lib/utils/use-form/types";

interface TextInputProps<T extends object> {
  label?: string;
  name: Path<T>;
  form: UseFormReturnType<T>;
  withAsterisk?: boolean;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  className?: string;
}

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
}: TextInputProps<T> & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'>) {
  
  const { value, onChange, onBlur } = form.getInputProps(name);
  const error = form.errors[name as string]; // errors uses string keys
  const isInvalid = !!error;

  const handleClear = () => {
    onChange("");
  };

  // Convert value to string safely
  const stringValue = value == null ? "" : String(value);

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label
          htmlFor={name as string}
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
        <input
          {...htmlAttributes}
          type={type}
          id={name as string}
          name={name as string}
          value={stringValue}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={name as string}
          placeholder={placeholder}
          className={cn(
            "w-full px-3 py-2.5 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-1",
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
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            aria-label="Clear input"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isInvalid && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}