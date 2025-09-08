import { useState, useCallback, useEffect, useRef } from 'react';

import { FormOptions, FormReturn, FormState, Path, PathValue } from '../utils/form/types';
import { flattenObject } from '../utils/form/flattenObject';
import { get } from '../utils/form/get';
import { set } from '../utils/form/set';

export function useForm<T extends Record<string, unknown>>(
  options: FormOptions<T>
): FormReturn<T> {
  const {
    initialValues,
    validate,
    rules,
    validateInputOnBlur = true,
    validateInputOnChange = false,
    validationDebounce = 0,
  } = options;

  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    dirty: {},
    isSubmitting: false,
    isValidating: false,
    hasSubmitted: false,
  });

  const debounceTimeout = useRef<Record<string, NodeJS.Timeout>>({});

  // Initialize dirty fields
  useEffect(() => {
    const flatInitial = flattenObject(initialValues);
    const initialDirty = Object.keys(flatInitial).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as Record<string, boolean>);
    
    setState(prev => ({
      ...prev,
      dirty: initialDirty,
    }));
  }, []);

  const validateField = useCallback(
    async (field: string): Promise<string | null> => {
      const value = get(state.values, field as Path<T>);
      const fieldRules = rules?.[field as Path<T>];

      if (!fieldRules) return null;

      let error: string | null = null;

      // Check required
      if (fieldRules.required) {
        const message = typeof fieldRules.required === 'string' ? fieldRules.required : undefined;
        error = validators.required(value, message);
        if (error) return error;
      }

      // Check min
      if (fieldRules.min !== undefined && typeof value === 'number') {
        const message = typeof fieldRules.min === 'string' ? fieldRules.min : undefined;
        error = validators.min(value, Number(fieldRules.min), message);
        if (error) return error;
      }

      // Check max
      if (fieldRules.max !== undefined && typeof value === 'number') {
        const message = typeof fieldRules.max === 'string' ? fieldRules.max : undefined;
        error = validators.max(value, Number(fieldRules.max), message);
        if (error) return error;
      }

      // Check minLength for strings
      if (fieldRules.minLength !== undefined && typeof value === 'string') {
        const message = typeof fieldRules.minLength === 'string' ? fieldRules.minLength : undefined;
        error = validators.minLength(value, Number(fieldRules.minLength), message);
        if (error) return error;
      }

      // Check maxLength for strings
      if (fieldRules.maxLength !== undefined && typeof value === 'string') {
        const message = typeof fieldRules.maxLength === 'string' ? fieldRules.maxLength : undefined;
        error = validators.maxLength(value, Number(fieldRules.maxLength), message);
        if (error) return error;
      }

      // Check pattern
      if (fieldRules.pattern !== undefined && typeof value === 'string') {
        const pattern = fieldRules.pattern instanceof RegExp 
          ? fieldRules.pattern 
          : new RegExp(fieldRules.pattern as string);
        const message = typeof fieldRules.pattern === 'string' ? fieldRules.pattern : undefined;
        error = validators.pattern(value, pattern, message);
        if (error) return error;
      }

      // Check equals
      if (fieldRules.equals !== undefined) {
        const equalsValue = get(state.values, fieldRules.equals as Path<T>);
        const message = typeof fieldRules.equals === 'string' ? fieldRules.equals : undefined;
        error = validators.equals(value, equalsValue, message);
        if (error) return error;
      }

      // Custom validation function
      if (fieldRules.validate) {
        const validationResult = await fieldRules.validate(value, state.values);
        if (typeof validationResult === 'string') {
          return validationResult;
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
    setState(prev => ({ ...prev, isValidating: true }));

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

    setState(prev => ({
      ...prev,
      errors: newErrors,
      isValidating: false,
    }));

    return isValid;
  }, [state.values, rules, validate, validateField]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setState(prev => {
      const updatedValues = { ...prev.values, ...newValues };
      const flatNew = flattenObject(newValues);
      const updatedDirty = { ...prev.dirty };

      Object.keys(flatNew).forEach(key => {
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
      setState(prev => {
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
            setState(prev => ({
              ...prev,
              errors: {
                ...prev.errors,
                [field as string]: error || '',
              },
            }));
          }, validationDebounce);
        } else {
          validateField(field as string).then(error => {
            setState(prev => ({
              ...prev,
              errors: {
                ...prev.errors,
                [field as string]: error || '',
              },
            }));
          });
        }
      }
    },
    [validateField, validateInputOnChange, validationDebounce]
  );

  const setFieldError = useCallback((field: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error,
      },
    }));
  }, []);

  const setFieldTouched = useCallback((field: string, touched: boolean) => {
    setState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [field]: touched,
      },
    }));

    if (touched && validateInputOnBlur) {
      validateField(field).then(error => {
        setState(prev => ({
          ...prev,
          errors: {
            ...prev.errors,
            [field]: error || '',
          },
        }));
      });
    }
  }, [validateField, validateInputOnBlur]);

  const reset = useCallback(() => {
    const flatInitial = flattenObject(initialValues);
    const initialDirty = Object.keys(flatInitial).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as Record<string, boolean>);

    const initialTouched = Object.keys(flatInitial).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as Record<string, boolean>);

    setState({
      values: initialValues,
      errors: {},
      touched: initialTouched,
      dirty: initialDirty,
      isSubmitting: false,
      isValidating: false,
      hasSubmitted: false,
    });
  }, [initialValues]);

  const handleChange = useCallback(
    <P extends Path<T>>(field: P, type?: 'checkbox' | 'radio' | 'input') => 
      (e: React.ChangeEvent<any> | any) => {
        let value: any;
        
        if (e && e.target) {
          if (type === 'checkbox') {
            value = e.target.checked;
          } else if (e.target.type === 'number') {
            value = e.target.value === '' ? '' : Number(e.target.value);
          } else {
            value = e.target.value;
          }
        } else {
          value = e;
        }

        setFieldValue(field, value);
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
    (handler: (values: T) => void | Promise<void>) => async (e?: React.FormEvent) => {
      e?.preventDefault();
      
      setState(prev => ({ ...prev, isSubmitting: true }));
      const isValid = await validateAll();

      if (isValid) {
        try {
          await handler(state.values);
          setState(prev => ({ ...prev, hasSubmitted: true }));
        } finally {
          setState(prev => ({ ...prev, isSubmitting: false }));
        }
      } else {
        setState(prev => ({ ...prev, isSubmitting: false }));
      }
    },
    [state.values, validateAll]
  );

  const getInputProps = useCallback(
    <P extends Path<T>>(field: P, options?: { type?: 'checkbox' | 'radio' | 'input' }) => {
      const type = options?.type;
      const value = get(state.values, field);
      
      return {
        name: field,
        value: type === 'checkbox' || type === 'radio' ? undefined : value,
        checked: type === 'checkbox' || type === 'radio' ? Boolean(value) : undefined,
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
      return Object.values(state.dirty).some(dirty => dirty);
    },
    [state.dirty]
  );

  const isTouched = useCallback(
    (field?: string) => {
      if (field) {
        return state.touched[field] || false;
      }
      return Object.values(state.touched).some(touched => touched);
    },
    [state.touched]
  );

  const insertListItem = useCallback(
    <P extends Path<T>>(field: P, item: PathValue<T, P> extends Array<infer U> ? U : never) => {
      const currentValue = get(state.values, field) || [];
      if (!Array.isArray(currentValue)) {
        throw new Error(`Field ${field} is not an array`);
      }
      setFieldValue(field, [...currentValue, item] as any);
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
      setFieldValue(field, newValue as any);
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
      setFieldValue(field, newValue as any);
    },
    [state.values, setFieldValue]
  );

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    dirty: state.dirty,
    isSubmitting: state.isSubmitting,
    isValidating: state.isValidating,
    hasSubmitted: state.hasSubmitted,
    setValues,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validate: validateAll,
    validateField: async (field: string) => {
      const error = await validateField(field);
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: error || '',
        },
      }));
    },
    reset,
    onSubmit,
    getInputProps,
    getFieldError,
    isDirty,
    isTouched,
    insertListItem,
    removeListItem,
    reorderListItem,
  };
}