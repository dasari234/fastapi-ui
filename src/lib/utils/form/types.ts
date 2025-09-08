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

export interface FormOptions<T extends Record<string, unknown>> {
    initialValues: T;
    validate?: (values: T) => Partial<Record<keyof T, string>> | Promise<Partial<Record<keyof T, string>>>;
    rules?: FormRules<T>;
    validateInputOnBlur?: boolean;
    validateInputOnChange?: boolean;
    validationDebounce?: number;
}

export interface FormState<T extends Record<string, unknown>> {
    values: T;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    dirty: Record<string, boolean>;
    isSubmitting: boolean;
    isValidating: boolean;
    hasSubmitted: boolean;
}

export interface FormReturn<T extends Record<string, unknown>> {
    values: T;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    dirty: Record<string, boolean>;
    isSubmitting: boolean;
    isValidating: boolean;
    hasSubmitted: boolean;
    setValues: (values: Partial<T>) => void;
    setFieldValue: <P extends Path<T>>(field: P, value: PathValue<T, P>) => void;
    setFieldError: (field: string, error: string) => void;
    setFieldTouched: (field: string, touched: boolean) => void;
    validate: () => Promise<boolean>;
    validateField: (field: string) => Promise<void>;
    reset: () => void;
    onSubmit: (handler: (values: T) => void | Promise<void>) => (e?: React.FormEvent) => Promise<void>;
    getInputProps: <P extends Path<T>>(
        field: P,
        options?: { type?: 'checkbox' | 'radio' | 'input' }
    ) => {
        name: string;
        value: unknown;
        checked?: boolean;
        onChange: (e: React.ChangeEvent<unknown> | unknown) => void;
        onBlur: () => void;
    };
    getFieldError: (field: string) => string | undefined;
    isDirty: (field?: string) => boolean;
    isTouched: (field?: string) => boolean;
    insertListItem: <P extends Path<T>>(field: P, item: PathValue<T, P> extends Array<infer U> ? U : never) => void;
    removeListItem: <P extends Path<T>>(field: P, index: number) => void;
    reorderListItem: <P extends Path<T>>(field: P, from: number, to: number) => void;
}