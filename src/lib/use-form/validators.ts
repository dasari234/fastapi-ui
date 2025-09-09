export interface ValidationRule<T = unknown> {
  required?: boolean | string;
  min?: number | string;
  max?: number | string;
  minLength?: number | string;
  maxLength?: number | string;
  pattern?: RegExp | string;
  validate?: (value: unknown, values: T) => boolean | string | Promise<boolean | string>;
  equals?: unknown | string;
}

export const validators = {
  required: (value: unknown, message?: string): string | null => {
    if (value === undefined || value === null || value === '') {
      return message || 'This field is required';
    }
    return null;
  },

  min: (value: number, min: number, message?: string): string | null => {
    if (value < min) {
      return message || `Must be at least ${min}`;
    }
    return null;
  },

  max: (value: number, max: number, message?: string): string | null => {
    if (value > max) {
      return message || `Must be no more than ${max}`;
    }
    return null;
  },

  minLength: (value: string, minLength: number, message?: string): string | null => {
    if (value.length < minLength) {
      return message || `Must be at least ${minLength} characters`;
    }
    return null;
  },

  maxLength: (value: string, maxLength: number, message?: string): string | null => {
    if (value.length > maxLength) {
      return message || `Must be no more than ${maxLength} characters`;
    }
    return null;
  },

  equals: (value: unknown, matchValue: unknown, message?: string): string | null => {
    if (value !== matchValue) {
      return message || 'Values must match';
    }
    return null;
  },

  pattern: (value: string, pattern: RegExp, message?: string): string | null => {
    if (!pattern.test(value)) {
      return message || 'Invalid format';
    }
    return null;
  },

  // Custom validators
  email: (value: string, message?: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return message || 'Please enter a valid email address';
    }
    return null;
  },

  url: (value: string, message?: string): string | null => {
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (value && !urlRegex.test(value)) {
      return message || 'Please enter a valid URL';
    }
    return null;
  },

  phone: (value: string, message?: string): string | null => {
    const phoneRegex = /^(\+\d{1,3})?[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/;
    if (value && !phoneRegex.test(value)) {
      return message || 'Please enter a valid phone number';
    }
    return null;
  },

  date: (value: string, message?: string): string | null => {
    if (value && isNaN(Date.parse(value))) {
      return message || 'Please enter a valid date';
    }
    return null;
  }
};

export type Validator = typeof validators;