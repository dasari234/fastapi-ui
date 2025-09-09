import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "../../../../lib/utils";
import type { TextInputProps } from "../../../../lib/use-form/types";
import {
  getFieldError,
  isFieldInvalid,
  getInputClasses,
  getLabelClasses,
  validateField
} from "../../../../lib/use-form/form-utils";

export function PasswordInput<T extends object>({
  label,
  name,
  form,
  withAsterisk,
  placeholder,
  disabled = false,
  className,
  ...htmlAttributes
}: TextInputProps<T> & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'>) {
  const [visible, setVisible] = useState(false);
  const { value, onChange, onBlur } = form.getInputProps(name);
  const error = getFieldError(form, name as string);
  const isInvalid = isFieldInvalid(form, name as string);
  const isTouched = form.touched[name as string];

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
        <label
          htmlFor={name as string}
          className={getLabelClasses(disabled)}
        >
          {label}
          {withAsterisk && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          {...htmlAttributes}
          id={name as string}
          name={name as string}
          type={visible ? "text" : "password"}
          value={stringValue}
          onChange={onChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete={name as string}
          className={cn(
            getInputClasses(isInvalid, disabled, hasValue, false),
            "pr-10"
          )}
          disabled={disabled}
        />

        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none transition-colors duration-200"
          aria-label={visible ? "Hide password" : "Show password"}
          disabled={disabled}
        >
          {!visible ? (
            <EyeOff size={18} className={disabled ? "text-gray-400" : "text-gray-600"} />
          ) : (
            <Eye size={18} className={disabled ? "text-gray-400" : "text-gray-600"} />
          )}
        </button>
      </div>

      {isInvalid && error && (
        <p className="mt-1 text-xs text-red-500 animate-fadeIn">{error}</p>
      )}
    </div>
  );
}