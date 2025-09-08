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
};

export type Validator = typeof validators;