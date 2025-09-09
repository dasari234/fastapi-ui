// MultiSelect.tsx
import { useState, useEffect, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "../../../../lib/utils";
import type { UseFormReturnType, Path } from "../../../../lib/use-form/types";
import {
  getFieldError,
  isFieldInvalid,
  getLabelClasses,
  validateField,
} from "../../../../lib/use-form/form-utils";
export interface FieldOption {
  label: string;
  value: string | number;
  product_type?: string;
}

export interface MultiSelectProps<T extends object> {
  label?: string;
  name: Path<T>;
  form: UseFormReturnType<T>;
  withAsterisk?: boolean;
  options: FieldOption[];
  placeholder?: string;
  clearable?: boolean;
  maxWidth?: string;
  maxtagcount?: number;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
}

export function MultiSelect<T extends object>({
  label,
  name,
  form,
  withAsterisk,
  options,
  placeholder = "Select options",
  clearable = true,
  maxWidth = "100%",
  maxtagcount = 2,
  disabled = false,
  className,
  searchable = true,
}: MultiSelectProps<T>) {
  const { value, onChange, onBlur } = form.getInputProps(name);
  const error = getFieldError(form, name as string);
  const isInvalid = isFieldInvalid(form, name as string);
  const isTouched = form.touched[name as string];


  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<(string | number)[]>(value || []);
  const [position, setPosition] = useState<"above" | "below">("below");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setSelected(value || []);
  }, [value]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
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
      const shouldPositionAbove =
        spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
      setPosition(shouldPositionAbove ? "above" : "below");
      if (inputRef.current) inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = (value: string | number) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    setSelected(newSelected);
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    const allValues = options.map((option) => option.value);
    const newSelected = selected.length === options.length ? [] : allValues;
    setSelected(newSelected);
    onChange(newSelected);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected([]);
    onChange([]);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleRemoveTag = (e: React.MouseEvent, value: string | number) => {
    e.stopPropagation();
    const newSelected = selected.filter((v) => v !== value);
    setSelected(newSelected);
    onChange(newSelected);
  };

  const isAllSelected = selected.length === options.length;
  const isIndeterminate =
    selected.length > 0 && selected.length < options.length;

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const renderTags = () => {
    if (selected.length === 0) return null;
    const visibleTags =
      maxtagcount > 0 ? selected.slice(0, maxtagcount) : selected;
    const hiddenCount = maxtagcount > 0 ? selected.length - maxtagcount : 0;

    return (
      <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
        {visibleTags.map((val) => {
          const option = options.find((opt) => opt.value === val);
          return option ? (
            <span
              key={val}
              className="bg-blue-100 text-blue-800 text-xs pl-2 pr-1 py-0.5 rounded-full flex items-center max-w-[140px]"
            >
              <span className="truncate flex-1" title={option.label}>
                {option.label}
              </span>
              <button
                type="button"
                onClick={(e) => handleRemoveTag(e, val)}
                disabled={disabled}
                className={cn(
                  "ml-1 rounded-full p-0.5",
                  disabled
                    ? "text-blue-300 cursor-not-allowed"
                    : "text-blue-800 hover:text-blue-900 hover:bg-blue-200"
                )}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ) : null;
        })}
        {hiddenCount > 0 && (
          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
            +{hiddenCount}
          </span>
        )}
      </div>
    );
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
          <div className="flex-1 min-w-0 flex items-center">
            {isOpen && searchable ? (
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search options..."
                disabled={disabled}
                className={cn(
                  "w-full bg-transparent border-none focus:outline-none focus:ring-0 min-w-0",
                  disabled && "text-gray-400 cursor-not-allowed"
                )}
              />
            ) : selected.length > 0 ? (
              renderTags()
            ) : (
              <span className="text-gray-400 truncate">{placeholder}</span>
            )}
          </div>

          {clearable && selected.length > 0 && !isOpen && (
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
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
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
              {filteredOptions.length > 0 && (
                <div
                  onClick={handleSelectAll}
                  className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={() => { }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium">Select All</span>
                </div>
              )}

              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      onClick={() => handleToggle(option.value)}
                      className={cn(
                        "px-4 py-2.5 text-sm cursor-pointer flex items-center gap-3 hover:bg-blue-50 transition-colors",
                        isSelected && "bg-blue-50"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="flex-1 truncate">{option.label}</span>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  {searchTerm
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
