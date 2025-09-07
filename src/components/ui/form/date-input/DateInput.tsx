import React, {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
  useCallback,
  useLayoutEffect,
} from "react";
import dayjs from "dayjs";

import { cn } from "../../../../lib/utils";
import type { DateInputProps } from "../../../../types";

export function DateInput<T>({
  label,
  name,
  form,
  withAsterisk,
  disabled = false,
}: DateInputProps<T>) {
  const { value, onChange, onBlur } = form.getInputProps(name as string);
  const error = form.errors[name as string];
  const isInvalid = !!error;
  const [showPicker, setShowPicker] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [alignRight, setAlignRight] = useState(false);

  // Position state
  const [position, setPosition] = useState<"below" | "above">("below");

  // Handle date changes
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

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node) &&
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Position picker below input with auto-positioning
  const calculatePosition = useCallback(() => {
    if (inputRef.current && pickerRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const pickerHeight = pickerRef.current.offsetHeight || 300;

      // Calculate space below and above
      const spaceBelow = window.innerHeight - inputRect.bottom - 20;
      const spaceAbove = inputRect.top - 20;

      // Determine best position
      const shouldPositionAbove =
        spaceBelow < pickerHeight && spaceAbove > spaceBelow;
      setPosition(shouldPositionAbove ? "above" : "below");
    }
  }, []);

  // Position picker below input with auto-positioning
  useEffect(() => {
    if (showPicker) {
      // Add delay to ensure picker has rendered
      setTimeout(calculatePosition, 10);

      const handleResize = () => {
        calculatePosition();
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [showPicker, calculatePosition]);

  // Parse current value to Date object
  const currentDate =
    value && dayjs(value, "MM/DD/YYYY").isValid()
      ? dayjs(value, "MM/DD/YYYY").toDate()
      : null;

  // Check if input has value
  const hasValue = !!value;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
    // Remove any non-digit or non-slash characters
    let sanitized = input.replace(/[^\d/]/g, "");

    // Auto-insert slashes as user types
    if (sanitized.length > 2 && sanitized[2] !== "/") {
      sanitized = sanitized.substring(0, 2) + "/" + sanitized.substring(2);
    }
    if (sanitized.length > 5 && sanitized[5] !== "/") {
      sanitized = sanitized.substring(0, 5) + "/" + sanitized.substring(5);
    }

    // Limit total length to 10 characters (MM/DD/YYYY)
    if (sanitized.length > 10) {
      sanitized = sanitized.substring(0, 10);
    }

    return sanitized;
  };

  // Check if input is a valid date
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
      const screenWidth = window.innerWidth;

      if (rect.right > screenWidth) {
        setAlignRight(true);
      } else {
        setAlignRight(false);
      }
    }
  }, [showPicker]);

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label
          htmlFor={`date-input-${String(name)}`}
          className={cn(
            "block text-sm font-medium mb-1",
            disabled ? "text-gray-400" : "text-gray-700"
          )}
        >
          {label}
          {withAsterisk && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center z-12">
        {/* Icon prefix */}
        <div
          className="absolute left-2 text-gray-400"
          onClick={(e) => {
            if (disabled) {
              e.preventDefault();
              return;
            }
            setShowPicker(!showPicker);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
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
          onChange={(e) => {
            if (!disabled) handleInputChange(e);
          }}
          onBlur={onBlur}
          onFocus={() => {
            if (!disabled) setShowPicker(true);
          }}
          onKeyDown={(e) => {
            if (!disabled) handleKeyDown(e);
          }}
          placeholder="MM/DD/YYYY"
          className={cn(
            "w-full pl-8 pr-10 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-1",
            disabled
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : isInvalid
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          )}
        />

        {/* Clear button (only shows when value exists) */}
        {hasValue && (
          <button
            type="button"
            className="absolute right-3 text-gray-400 hover:text-gray-600"
            onClick={handleClear}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
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
            "date-picker absolute z-30 bg-white border border-gray-300 rounded-md shadow-lg min-w-[280px]",
            position === "above" ? "bottom-full" : "mt-1",
            alignRight ? "right-0" : "ml-[-3rem]"
          )}
        >
          <DatePicker
            selected={currentDate}
            onChange={handleDateChange}
            minDate={dayjs().startOf("day").toDate()}
          />
        </div>
      )}

      {isInvalid && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Updated DatePicker without Today/Clear buttons
const DatePicker = ({
  selected,
  onChange,
  minDate,
}: {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate: Date;
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
