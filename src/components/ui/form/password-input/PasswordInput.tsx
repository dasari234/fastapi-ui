import { useState, type InputHTMLAttributes } from "react";
import type { UseFormReturnType } from "@mantine/form";
import { Eye, EyeOff } from "lucide-react"; 
import { cn } from "../../../../lib/utils";


type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  name: string;
  form: UseFormReturnType<Record<string, unknown>>;
  withAsterisk?: boolean;
};

export function PasswordInput({
  label,
  name,
  form,
  withAsterisk,
  ...htmlAttributes
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const { value, onChange, onBlur } = form.getInputProps(name);
  const error = form.errors[name];
  const isInvalid = !!error;

  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {withAsterisk && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={name}
          className={cn(
            "w-full px-3 py-2.5 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500",
            isInvalid ? "border-red-500" : "border-gray-300"
          )}
          {...htmlAttributes}
        />

        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 focus:outline-none"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {!visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {isInvalid && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
