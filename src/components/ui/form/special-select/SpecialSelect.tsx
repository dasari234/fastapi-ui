// SpecialSelect.tsx
import { useState, useEffect, useRef, useMemo } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "../../../../lib/utils";
import type { UseFormReturnType, Path } from "../../../../lib/use-form/types";
import { getFieldError, isFieldInvalid, getLabelClasses, validateField } from "../../../../lib/use-form/form-utils";

export interface FieldOption {
  label: string;
  value: string | number;
  product_type?: string;
}

export interface SpecialSelectProps<T extends object> {
  label?: string;
  name: Path<T>;
  form: UseFormReturnType<T>;
  withAsterisk?: boolean;
  options: FieldOption[];
  searchable?: boolean;
  placeholder?: string;
  clearable?: boolean;
  maxWidth?: string;
  disabled?: boolean;
  renderOption?: (option: FieldOption, isSelected: boolean) => React.ReactNode;
  renderSelected?: (label: string) => React.ReactNode;
  className?: string;
}

export function SpecialSelect<T extends object>({
  label,
  name,
  form,
  withAsterisk,
  options,
  searchable = true,
  placeholder = "Select an option",
  clearable = true,
  maxWidth = "100%",
  disabled = false,
  renderOption,
  renderSelected,
  className,
}: SpecialSelectProps<T>) {
  const { value, onChange, onBlur } = form.getInputProps(name);
  const error = getFieldError(form, name as string);
  const isInvalid = isFieldInvalid(form, name as string);
  const isTouched = form.touched[name as string];


  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<string | number>(value);
  const [position, setPosition] = useState<"above" | "below">("below");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    const term = (searchTerm || "").toLowerCase().trim();
    if (!searchable) return options || [];
    return options.filter((option) => {
      const label = option?.label?.toLowerCase() || "";
      const category = option?.product_type?.toLowerCase() || "";
      return label.includes(term) || category.includes(term);
    });
  }, [searchable, options, searchTerm]);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onBlur?.();
      }
    };

    if (isTouched && isInvalid) {
      validateField(form, name as string);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onBlur]);

  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - wrapperRect.bottom;
      const spaceAbove = wrapperRect.top;
      const dropdownHeight = 300;
      const shouldPositionAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
      setPosition(shouldPositionAbove ? "above" : "below");
      if (inputRef.current) inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (value: string | number) => {
    setSelected(value);
    onChange(value);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected("");
    onChange("");
    setSearchTerm("");
    setIsOpen(false);
  };

  const getSelectedOption = () => {
    if (!selected) return null;
    return options.find((option) => option.value === selected);
  };

  const selectedOption = getSelectedOption();

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div ref={wrapperRef} style={{ maxWidth }} className={className}>
      {label && (
        <label htmlFor={name as string} className={getLabelClasses(disabled)}>
          {label}
          {withAsterisk && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          className={cn(
            "flex items-center w-full px-3 py-2.5 border rounded-md shadow-sm text-sm cursor-pointer",
            isInvalid ? "border-red-500" : "border-gray-300",
            isOpen && "ring-1 ring-blue-500",
            disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white focus-within:ring-1 focus-within:ring-blue-500"
          )}
          onClick={() => !disabled && setIsOpen(true)}
        >
          <div className="flex-grow min-w-0">
            {isOpen && searchable ? (
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search options..."
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0"
                disabled={disabled}
              />
            ) : (
              <div className="truncate">
                {selectedOption ? (
                  renderSelected ? (
                    renderSelected(selectedOption.label)
                  ) : (
                    selectedOption.label
                  )
                ) : (
                  <span className="text-gray-400">{placeholder}</span>
                )}
              </div>
            )}
          </div>

          {clearable && selected && !isOpen && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className={cn(
                "ml-2 flex-shrink-0",
                disabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={toggleDropdown}
            disabled={disabled}
            className={cn(
              "ml-2 flex-shrink-0 transition-colors",
              disabled
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
          </button>
        </div>

        {isOpen && (
          <div
            className={cn(
              "absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden",
              position === "above" ? "bottom-full mb-1" : "top-full mt-1"
            )}
          >
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = selected === option.value;
                  return (
                    <div
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        "py-3 pr-3 text-sm cursor-pointer flex items-start gap-3 hover:bg-blue-50 transition-colors",
                        isSelected && "bg-blue-50"
                      )}
                    >
                      {renderOption ? (
                        renderOption(option, isSelected)
                      ) : (
                        <>
                          {isSelected && (
                            <Check className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={3} />
                          )}
                          <span className="flex-1">{option.label}</span>
                        </>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-3 text-sm text-gray-500 text-center">
                  {searchable && searchTerm
                    ? "No matching options found"
                    : "No options available"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isInvalid && error && (
        <p className="mt-1 text-xs text-red-500 animate-fadeIn">{error}</p>
      )}
    </div>
  );
}