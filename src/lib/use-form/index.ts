import { useCallback, useEffect, useRef, useState } from "react";
import { flattenObject } from "./flattenObject";
import { get } from "./get";
import { set } from "./set";
import type {
  FormOptions,
  Path,
  PathValue,
  UseFormReturnType,
} from "./types";
import { validators } from "./validators";

export function useForm<T extends object>(
  options: FormOptions<T>
): UseFormReturnType<T> {
  const {
    initialValues,
    validate,
    rules,
    validateInputOnBlur = true,
    validateInputOnChange = false,
    validationDebounce = 0,
    transformValues,
  } = options;

  const [state, setState] = useState({
    values: initialValues,
    errors: {} as Record<string, string>,
    touched: {} as Record<string, boolean>,
    dirty: {} as Record<string, boolean>,
    isSubmitting: false,
    isValidating: false,
    hasSubmitted: false,
  });

  const initialValuesRef = useRef(initialValues);
  const debounceTimeout = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Initialize dirty and touched fields
  useEffect(() => {
    const flatInitial = flattenObject(initialValuesRef.current);
    const initialDirty = Object.keys(flatInitial).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as Record<string, boolean>);

    const initialTouched = Object.keys(flatInitial).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as Record<string, boolean>);

    setState((prev) => ({
      ...prev,
      dirty: initialDirty,
      touched: initialTouched,
    }));
  }, []);

  const validateField = useCallback(
    async (field: string): Promise<string | null> => {
      const value = get(state.values, field as Path<T>);
      const fieldRules = rules?.[field as Path<T>];

      if (!fieldRules) return null;

      let error: string | null = null;

      // Check required with custom message
      if (fieldRules.required) {
        const message = typeof fieldRules.required === 'string' ? fieldRules.required : undefined;
        error = validators.required(value, message);
        if (error) return error;
      }

      // Check min with custom message
      if (fieldRules.min !== undefined && typeof value === 'number') {
        const message = typeof fieldRules.min === 'string' ? fieldRules.min : undefined;
        error = validators.min(value, Number(fieldRules.min), message);
        if (error) return error;
      }

      // Check max with custom message
      if (fieldRules.max !== undefined && typeof value === 'number') {
        const message = typeof fieldRules.max === 'string' ? fieldRules.max : undefined;
        error = validators.max(value, Number(fieldRules.max), message);
        if (error) return error;
      }

      // Check minLength with custom message
      if (fieldRules.minLength !== undefined && typeof value === 'string') {
        const message = typeof fieldRules.minLength === 'string' ? fieldRules.minLength : undefined;
        error = validators.minLength(value, Number(fieldRules.minLength), message);
        if (error) return error;
      }

      // Check maxLength with custom message
      if (fieldRules.maxLength !== undefined && typeof value === 'string') {
        const message = typeof fieldRules.maxLength === 'string' ? fieldRules.maxLength : undefined;
        error = validators.maxLength(value, Number(fieldRules.maxLength), message);
        if (error) return error;
      }

      // Check pattern with custom message
      if (fieldRules.pattern !== undefined && typeof value === 'string') {
        const pattern = fieldRules.pattern instanceof RegExp
          ? fieldRules.pattern
          : new RegExp(fieldRules.pattern as string);
        const message = typeof fieldRules.pattern === 'string' ? fieldRules.pattern : undefined;
        error = validators.pattern(value, pattern, message);
        if (error) return error;
      }

      // Check equals with custom message
      if (fieldRules.equals !== undefined) {
        const equalsValue = get(state.values, fieldRules.equals as Path<T>);
        const message = typeof fieldRules.equals === 'string' ? fieldRules.equals : undefined;
        error = validators.equals(value, equalsValue, message);
        if (error) return error;
      }

      // Custom validation function that can return custom messages
      if (fieldRules.validate) {
        const validationResult = await fieldRules.validate(value, state.values);
        if (typeof validationResult === 'string') {
          return validationResult; // Return custom message directly
        }
        if (validationResult === false) {
          return 'Invalid value';
        }
      }

      return null;
    },
    [state.values, rules]
  );

  const validateAll = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isValidating: true }));

    let isValid = true;
    const newErrors: Record<string, string> = {};

    // Validate each field with rules
    if (rules) {
      for (const field of Object.keys(rules)) {
        const error = await validateField(field);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    }

    // Run custom validation if provided
    if (validate) {
      const customErrors = await validate(state.values);
      Object.entries(customErrors).forEach(([field, error]) => {
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      });
    }

    setState((prev) => ({
      ...prev,
      errors: newErrors,
      isValidating: false,
    }));

    return isValid;
  }, [state.values, rules, validate, validateField]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setState((prev) => {
      const updatedValues = { ...prev.values, ...newValues };
      const flatNew = flattenObject(newValues as T);
      const updatedDirty = { ...prev.dirty };

      Object.keys(flatNew).forEach((key) => {
        updatedDirty[key] = true;
      });

      return {
        ...prev,
        values: updatedValues,
        dirty: updatedDirty,
      };
    });
  }, []);

  const setFieldValue = useCallback(
    <P extends Path<T>>(field: P, value: PathValue<T, P>) => {
      setState((prev) => {
        const updatedValues = set(prev.values, field, value);
        const flatField = field.toString();
        const updatedDirty = { ...prev.dirty, [flatField]: true };

        return {
          ...prev,
          values: updatedValues,
          dirty: updatedDirty,
        };
      });

      if (validateInputOnChange) {
        if (validationDebounce > 0) {
          if (debounceTimeout.current[field as string]) {
            clearTimeout(debounceTimeout.current[field as string]);
          }

          debounceTimeout.current[field as string] = setTimeout(async () => {
            const error = await validateField(field as string);
            setState((prev) => ({
              ...prev,
              errors: {
                ...prev.errors,
                [field as string]: error || "",
              },
            }));
          }, validationDebounce);
        } else {
          validateField(field as string).then((error) => {
            setState((prev) => ({
              ...prev,
              errors: {
                ...prev.errors,
                [field as string]: error || "",
              },
            }));
          });
        }
      }
    },
    [validateField, validateInputOnChange, validationDebounce]
  );

  const setFieldError = useCallback((field: string, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error,
      },
    }));
  }, []);

  const setFieldTouched = useCallback(
    (field: string, touched: boolean) => {
      setState((prev) => ({
        ...prev,
        touched: {
          ...prev.touched,
          [field]: touched,
        },
      }));

      if (touched && validateInputOnBlur) {
        validateField(field).then((error) => {
          setState((prev) => ({
            ...prev,
            errors: {
              ...prev.errors,
              [field]: error || "",
            },
          }));
        });
      }
    },
    [validateField, validateInputOnBlur]
  );

  const setFieldDirty = useCallback((field: string, dirty: boolean) => {
    setState((prev) => ({
      ...prev,
      dirty: {
        ...prev.dirty,
        [field]: dirty,
      },
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errors: {},
    }));
  }, []);

  const reset = useCallback(() => {
    const flatInitial = flattenObject(initialValuesRef.current);
    const initialDirty = Object.keys(flatInitial).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as Record<string, boolean>);

    const initialTouched = Object.keys(flatInitial).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as Record<string, boolean>);

    setState({
      values: initialValuesRef.current,
      errors: {},
      touched: initialTouched,
      dirty: initialDirty,
      isSubmitting: false,
      isValidating: false,
      hasSubmitted: false,
    });
  }, []);

  const resetDirty = useCallback(
    (values?: T) => {
      const targetValues = values || state.values;
      const flatTarget = flattenObject(targetValues);
      const newDirty = Object.keys(flatTarget).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {} as Record<string, boolean>);

      setState((prev) => ({
        ...prev,
        dirty: newDirty,
      }));
    },
    [state.values]
  );

  const resetTouched = useCallback(() => {
    const flatValues = flattenObject(state.values);
    const newTouched = Object.keys(flatValues).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as Record<string, boolean>);

    setState((prev) => ({
      ...prev,
      touched: newTouched,
    }));
  }, [state.values]);

  const setInitialValues = useCallback((values: T) => {
    initialValuesRef.current = values;
  }, []);

  const handleChange = useCallback(
    <P extends Path<T>>(
      field: P,
      type?: "checkbox" | "radio" | "input" | "select" | "textarea"
    ) =>
      (
        e:
          | React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
          >
          | unknown
      ) => {
        let value: unknown;

        if (e && typeof e === "object" && "target" in e) {
          const target = (
            e as React.ChangeEvent<
              HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >
          ).target;

          if (type === "checkbox" && "checked" in target) {
            value = target.checked;
          } else if (type === "radio" && "value" in target) {
            value = target.value;
          } else if ("type" in target && target.type === "number") {
            value = target.value === "" ? "" : Number(target.value);
          } else if ("type" in target && target.type === "file") {
            value = (target as HTMLInputElement).files;
          } else if ("value" in target) {
            value = target.value;
          }
        } else {
          value = e;
        }

        setFieldValue(field, value as PathValue<T, P>);
      },
    [setFieldValue]
  );

  const handleBlur = useCallback(
    (field: string) => () => {
      setFieldTouched(field, true);
    },
    [setFieldTouched]
  );

  const onSubmit = useCallback(
    (handler: (values: T) => void | Promise<void>) =>
      async (e?: React.FormEvent) => {
        e?.preventDefault();

        setState((prev) => ({ ...prev, isSubmitting: true }));
        const isValid = await validateAll();

        if (isValid) {
          try {
            const valuesToSubmit = transformValues
              ? transformValues(state.values)
              : state.values;
            await handler(valuesToSubmit);
            setState((prev) => ({ ...prev, hasSubmitted: true }));
          } finally {
            setState((prev) => ({ ...prev, isSubmitting: false }));
          }
        } else {
          setState((prev) => ({ ...prev, isSubmitting: false }));
        }
      },
    [state.values, validateAll, transformValues]
  );

  const getInputProps = useCallback(
    <P extends Path<T>>(
      field: P,
      options?: {
        type?: "checkbox" | "radio" | "input" | "select" | "textarea";
      }
    ) => {
      const type = options?.type;
      const value = get(state.values, field);

      return {
        name: field,
        value: type === "checkbox" || type === "radio" ? undefined : value,
        checked:
          type === "checkbox" || type === "radio" ? Boolean(value) : undefined,
        onChange: handleChange(field, type),
        onBlur: handleBlur(field as string),
      };
    },
    [state.values, handleChange, handleBlur]
  );

  const getFieldError = useCallback(
    (field: string) => state.errors[field],
    [state.errors]
  );

  const isDirty = useCallback(
    (field?: string) => {
      if (field) {
        return state.dirty[field] || false;
      }
      return Object.values(state.dirty).some((dirty) => dirty);
    },
    [state.dirty]
  );

  const isTouched = useCallback(
    (field?: string) => {
      if (field) {
        return state.touched[field] || false;
      }
      return Object.values(state.touched).some((touched) => touched);
    },
    [state.touched]
  );

  const isValid = useCallback(() => {
    return Object.keys(state.errors).length === 0;
  }, [state.errors]);

  const insertListItem = useCallback(
    <P extends Path<T>>(
      field: P,
      item: PathValue<T, P> extends Array<infer U> ? U : never
    ) => {
      const currentValue = get(state.values, field) || [];
      if (!Array.isArray(currentValue)) {
        throw new Error(`Field ${field} is not an array`);
      }
      setFieldValue(field, [...currentValue, item] as PathValue<T, P>);
    },
    [state.values, setFieldValue]
  );

  const removeListItem = useCallback(
    <P extends Path<T>>(field: P, index: number) => {
      const currentValue = get(state.values, field);
      if (!Array.isArray(currentValue)) {
        throw new Error(`Field ${field} is not an array`);
      }
      const newValue = [...currentValue];
      newValue.splice(index, 1);
      setFieldValue(field, newValue as PathValue<T, P>);
    },
    [state.values, setFieldValue]
  );

  const reorderListItem = useCallback(
    <P extends Path<T>>(field: P, from: number, to: number) => {
      const currentValue = get(state.values, field);
      if (!Array.isArray(currentValue)) {
        throw new Error(`Field ${field} is not an array`);
      }
      const newValue = [...currentValue];
      const [moved] = newValue.splice(from, 1);
      newValue.splice(to, 0, moved);
      setFieldValue(field, newValue as PathValue<T, P>);
    },
    [state.values, setFieldValue]
  );

  const swapListItem = useCallback(
    <P extends Path<T>>(field: P, indexA: number, indexB: number) => {
      const currentValue = get(state.values, field);
      if (!Array.isArray(currentValue)) {
        throw new Error(`Field ${field} is not an array`);
      }
      const newValue = [...currentValue];
      [newValue[indexA], newValue[indexB]] = [
        newValue[indexB],
        newValue[indexA],
      ];
      setFieldValue(field, newValue as PathValue<T, P>);
    },
    [state.values, setFieldValue]
  );

  return {
    // State
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    dirty: state.dirty,
    isSubmitting: state.isSubmitting,
    isValidating: state.isValidating,
    hasSubmitted: state.hasSubmitted,

    // Methods
    setValues,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setFieldDirty,

    // Validation
    validate: validateAll,
    validateField: async (field: string) => {
      const error = await validateField(field);
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: error || "",
        },
      }));
    },
    clearErrors,
    reset,

    // Form handling
    onSubmit,
    getInputProps,

    // Utilities
    getFieldError,
    isDirty,
    isTouched,
    isValid,

    // Array operations
    insertListItem,
    removeListItem,
    reorderListItem,
    swapListItem,

    // Enhanced methods
    resetDirty,
    resetTouched,
    setInitialValues,
  };
}
