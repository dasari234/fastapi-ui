import { cn } from "../../lib/utils";
import type { UseFormReturnType } from "./types";

export const getFieldError = <T extends object>(
  form: UseFormReturnType<T>,
  name: string
): string | undefined => {
  return form.errors[name];
};

export const isFieldInvalid = <T extends object>(
  form: UseFormReturnType<T>,
  name: string
): boolean => {
  return !!form.errors[name];
};

export const isFieldTouched = <T extends object>(
  form: UseFormReturnType<T>,
  name: string
): boolean => {
  return !!form.touched[name];
};

export const isFieldDirty = <T extends object>(
  form: UseFormReturnType<T>,
  name: string
): boolean => {
  return !!form.dirty[name];
};

export const getInputClasses = (
  isInvalid: boolean,
  disabled: boolean,
  hasValue: boolean,
  clearable: boolean,
  className?: string
): string => {
  return cn(
    "w-full px-3 py-2.5 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 transition-colors duration-200",
    hasValue && clearable && "pr-8",
    disabled && "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed",
    isInvalid && !disabled && "border-red-500 focus:ring-red-500",
    !isInvalid && !disabled && cn(
      "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
      "hover:border-gray-400"
    ),
    className
  );
};

export const getLabelClasses = (disabled: boolean): string => {
  return cn(
    "block text-sm font-medium mb-1 transition-colors duration-200",
    disabled ? "text-gray-400" : "text-gray-700"
  );
};

export const validateField = async <T extends object>(
  form: UseFormReturnType<T>,
  name: string
): Promise<void> => {
  await form.validateField(name);
};