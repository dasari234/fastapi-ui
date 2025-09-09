import dayjs from "dayjs";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../../../lib/utils";
import type { UseFormReturnType, Path } from "../../../../lib/use-form/types";
import {
  getFieldError,
  isFieldInvalid,
  getLabelClasses,
  validateField,
} from "../../../../lib/use-form/form-utils";

export interface DateInputProps<T extends object> {
  label?: string;
  name: Path<T>;
  form: UseFormReturnType<T>;
  withAsterisk?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function DateInput<T extends object>({
  label,
  name,
  form,
  withAsterisk,
  disabled = false,
  className,
  minDate,
  maxDate,
}: DateInputProps<T>) {
  const { value, onChange, onBlur } = form.getInputProps(name);
  const error = getFieldError(form, name as string);
  const isInvalid = isFieldInvalid(form, name as string);
  const isTouched = form.touched[name as string];


  const [showPicker, setShowPicker] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [alignRight, setAlignRight] = useState(false);
  const [position, setPosition] = useState<"below" | "above">("below");

  const handleDateChange = useCallback(
    (date: Date | null) => {
      const formattedDate = date ? dayjs(date).format("MM/DD/YYYY") : "";
      onChange(formattedDate);
      setShowPicker(false);
    },
    [onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onChange("");
      setShowPicker(false);
    },
    [onChange]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node) &&
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
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

  const calculatePosition = useCallback(() => {
    if (inputRef.current && pickerRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const pickerHeight = pickerRef.current.offsetHeight || 300;
      const spaceBelow = window.innerHeight - inputRect.bottom - 20;
      const spaceAbove = inputRect.top - 20;
      const shouldPositionAbove =
        spaceBelow < pickerHeight && spaceAbove > spaceBelow;
      setPosition(shouldPositionAbove ? "above" : "below");
    }
  }, []);

  useEffect(() => {
    if (showPicker) {
      setTimeout(calculatePosition, 10);
      const handleResize = () => calculatePosition();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [showPicker, calculatePosition]);

  const currentDate =
    typeof value === "string" && value && dayjs(value, "MM/DD/YYYY").isValid()
      ? dayjs(value, "MM/DD/YYYY").toDate()
      : null;

  const hasValue = !!value;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "Backspace",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "/",
    ];
    const isDigit = /^[0-9]$/.test(e.key);
    if (!isDigit && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const validateAndFormatDate = (input: string): string => {
    let sanitized = input.replace(/[^\d/]/g, "");
    if (sanitized.length > 2 && sanitized[2] !== "/") {
      sanitized = sanitized.substring(0, 2) + "/" + sanitized.substring(2);
    }
    if (sanitized.length > 5 && sanitized[5] !== "/") {
      sanitized = sanitized.substring(0, 5) + "/" + sanitized.substring(5);
    }
    if (sanitized.length > 10) {
      sanitized = sanitized.substring(0, 10);
    }
    return sanitized;
  };

  const isValidDate = (dateStr: string): boolean => {
    return dayjs(dateStr, "MM/DD/YYYY", true).isValid();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = validateAndFormatDate(e.target.value);
    onChange(newValue);
    if (isValidDate(newValue)) {
      setShowPicker(false);
    }
  };

  useLayoutEffect(() => {
    if (showPicker && pickerRef.current) {
      const rect = pickerRef.current.getBoundingClientRect();
      setAlignRight(rect.right > window.innerWidth);
    }
  }, [showPicker]);

  return (
    <div className={cn("relative", className)} ref={wrapperRef}>
      {label && (
        <label
          htmlFor={`date-input-${String(name)}`}
          className={getLabelClasses(disabled)}
        >
          {label}
          {withAsterisk && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <div
          className={cn(
            "absolute left-2",
            disabled ? "text-gray-300" : "text-gray-400 cursor-pointer"
          )}
          onClick={() => !disabled && setShowPicker(!showPicker)}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <input
          ref={inputRef}
          id={`date-input-${String(name)}`}
          type="text"
          value={(value as string) || ""}
          onChange={handleInputChange}
          onBlur={onBlur}
          onFocus={() => !disabled && setShowPicker(true)}
          onKeyDown={handleKeyDown}
          placeholder="MM/DD/YYYY"
          className={cn(
            "w-full pl-8 pr-10 py-2.5 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-1",
            disabled
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : isInvalid
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
          )}
          disabled={disabled}
        />

        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className={cn(
              "absolute right-3",
              disabled
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {showPicker && (
        <div
          ref={pickerRef}
          className={cn(
            "absolute z-30 bg-white border border-gray-300 rounded-md shadow-lg min-w-[280px]",
            position === "above" ? "bottom-full mb-1" : "mt-1",
            alignRight ? "right-0" : "left-0"
          )}
        >
          <DatePicker
            selected={currentDate}
            onChange={handleDateChange}
            minDate={minDate || dayjs().startOf("day").toDate()}
            maxDate={maxDate}
          />

          {isInvalid && error && (
            <p className="mt-1 text-xs text-red-500 animate-fadeIn">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}

const DatePicker = ({
  selected,
  onChange,
  minDate,
  maxDate,
}: {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate: Date;
  maxDate?: Date;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Generate calendar days
  const days = [];

  // Previous month days
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(
      <div key={`empty-${i}`} className="p-2 text-center text-gray-300"></div>
    );
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear, currentMonth, i);
    const isDisabled = date < minDate;
    const isToday = dayjs(date).isSame(dayjs(), "day");
    const isSelected =
      selected &&
      selected.getDate() === i &&
      selected.getMonth() === currentMonth &&
      selected.getFullYear() === currentYear;

    days.push(
      <button
        key={i}
        type="button"
        disabled={isDisabled}
        className={cn(
          "p-2 w-8 h-8 flex items-center justify-center text-sm rounded-full transition-colors",
          {
            "bg-blue-500 text-white": isSelected,
            "bg-blue-100 text-blue-800": isToday && !isSelected,
            "text-gray-300 cursor-not-allowed": isDisabled,
            "text-gray-700 hover:bg-gray-100":
              !isSelected && !isToday && !isDisabled,
          }
        )}
        onClick={() => onChange(date)}
      >
        {i}
      </button>
    );
  }

  // Navigate months
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Month names
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-2">
        <button
          type="button"
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Previous month"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div className="font-medium text-gray-800 text-sm">
          {monthNames[currentMonth]} {currentYear}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Next month"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 p-1"
          >
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
};
