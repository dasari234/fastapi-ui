import { X } from "lucide-react";
import type { FormFieldProps } from "../../../../types";
import { cn } from "../../../../lib/utils";

export function TextInput<T>({
  label,
  name,
  form,
  withAsterisk,
  placeholder,
  clearable,
  disabled = false,
  ...htmlAttributes
}: FormFieldProps<T> & { prefix?: string }) {
  const { value, onChange, onBlur } = form.getInputProps(name as string);
  const error = form.errors[name] as string | undefined;
  const isInvalid = !!error;

  const handleClear = () => {
    onChange("");
  };

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
        <input
          {...htmlAttributes}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={name as string}
          placeholder={placeholder}
          className={cn(
            "w-full px-3 py-2.5 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-1",
            value && "pr-8",
            {
              "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed":
                disabled,
              "border-red-500 focus:ring-red-500": isInvalid && !disabled,
              "border-gray-300 focus:ring-blue-500": !isInvalid && !disabled,
            }
          )}
          disabled={disabled}
          readOnly={disabled}
        />

        {/* Clear button */}
        {value && clearable && (
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

      {isInvalid && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
