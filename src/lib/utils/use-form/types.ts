export type Path<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends Array<unknown>
          ? `${K}` | `${K}.${number}` | `${K}.${number}.${Path<T[K][number]>}`
          : T[K] extends object
          ? `${K}` | `${K}.${Path<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

export type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends Path<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : K extends `${number}`
    ? T extends Array<infer U>
      ? Rest extends Path<U>
        ? PathValue<U, Rest>
        : never
      : never
    : never
  : P extends keyof T
  ? T[P]
  : P extends `${number}`
  ? T extends Array<infer U>
    ? U
    : never
  : never;

export type ValidationRule<T = unknown> = {
  required?: boolean | string;
  min?: number | string;
  max?: number | string;
  minLength?: number | string;
  maxLength?: number | string;
  pattern?: RegExp | string;
  validate?: (value: unknown, values: T) => boolean | string | Promise<boolean | string>;
  equals?: unknown | string;
};

export type FormRules<T> = {
  [K in Path<T>]?: ValidationRule<T>;
};

export interface FormOptions<T extends object> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<string, string>> | Promise<Partial<Record<string, string>>>;
  rules?: FormRules<T>;
  validateInputOnBlur?: boolean;
  validateInputOnChange?: boolean;
  validationDebounce?: number;
  onSubmit?: (values: T) => void | Promise<void>;
  transformValues?: (values: T) => T;
}

export interface FormState<T extends object> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  isSubmitting: boolean;
  isValidating: boolean;
  hasSubmitted: boolean;
}

export interface UseFormReturnType<T extends object> {
  // State
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  isSubmitting: boolean;
  isValidating: boolean;
  hasSubmitted: boolean;
  
  // Methods
  setValues: (values: Partial<T>) => void;
  setFieldValue: <P extends Path<T>>(field: P, value: PathValue<T, P>) => void;
  setFieldError: (field: string, error: string) => void;
  setFieldTouched: (field: string, touched: boolean) => void;
  setFieldDirty: (field: string, dirty: boolean) => void;
  
  // Validation
  validate: () => Promise<boolean>;
  validateField: (field: string) => Promise<void>;
  clearErrors: () => void;
  reset: () => void;
  
  // Form handling
  onSubmit: (handler: (values: T) => void | Promise<void>) => (e?: React.FormEvent) => Promise<void>;
  getInputProps: <P extends Path<T>>(
    field: P,
    options?: { type?: 'checkbox' | 'radio' | 'input' | 'select' | 'textarea' }
  ) => {
    name: string;
    value: unknown;
    checked?: boolean;
    onChange: (e: React.ChangeEvent<unknown> | unknown) => void;
    onBlur: () => void;
  };
  
  // Utilities
  getFieldError: (field: string) => string | undefined;
  isDirty: (field?: string) => boolean;
  isTouched: (field?: string) => boolean;
  isValid: () => boolean;
  
  // Array operations
  insertListItem: <P extends Path<T>>(field: P, item: PathValue<T, P> extends Array<infer U> ? U : never) => void;
  removeListItem: <P extends Path<T>>(field: P, index: number) => void;
  reorderListItem: <P extends Path<T>>(field: P, from: number, to: number) => void;
  swapListItem: <P extends Path<T>>(field: P, indexA: number, indexB: number) => void;
  
  // Enhanced methods
  resetDirty: (values?: T) => void;
  resetTouched: () => void;
  setInitialValues: (values: T) => void;
}