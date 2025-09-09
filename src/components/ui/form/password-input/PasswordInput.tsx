import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "../../../../lib/utils";
import type { Path, UseFormReturnType } from "../../../../lib/utils/use-form/types";


interface CuratedInputProps {
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  readOnly?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  clearable?: boolean;
}

interface PasswordInputProps<T extends object> extends CuratedInputProps {
  name: Path<T>;
  form: UseFormReturnType<T>;
  label?: string;
  withAsterisk?: boolean;
}

export function PasswordInput<T extends object>({
  label,
  name,
  form,
  withAsterisk,
  placeholder,
  disabled,
  required,
  className,
  autoFocus,
  autoComplete,
  clearable,
  readOnly,
  maxLength,
  minLength,
  pattern,
}: PasswordInputProps<T>) {
  const [visible, setVisible] = useState(false);
  const { value, onChange, onBlur } = form.getInputProps(name);
  const error = form.errors[name as string];
  const isInvalid = !!error;

  const stringValue = value == null ? '' : String(value);

  return (
    <div>
      {label && (
        <label
          htmlFor={name as string}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {withAsterisk && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={name as string}
          name={name as string}
          type={visible ? "text" : "password"}
          value={stringValue}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          autoComplete={autoComplete || name as string}
          readOnly={readOnly}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          className={cn(
            "w-full px-3 py-2.5 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-1",
            stringValue && clearable && "pr-8",
            disabled && "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed",
            isInvalid && !disabled && "border-red-500 focus:ring-red-500",
            !isInvalid && !disabled && "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
            className
          )}
        />

        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 focus:outline-none"
          aria-label={visible ? "Hide password" : "Show password"}
          disabled={disabled}
        >
          {!visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {isInvalid && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}