// Example form setup with custom error messages
interface UserForm {
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  phone: string;
  website: string;
  birthDate: string;
}

function UserRegistration() {
  const form = useForm<UserForm>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      age: 0,
      phone: '',
      website: '',
      birthDate: '',
    },
    rules: {
      email: { 
        required: 'Please enter your email address',
        validate: (value) => {
          if (!value.includes('@')) return 'Email must contain @ symbol';
          return true;
        }
      },
      password: { 
        required: 'Password is required',
        minLength: 'Password must be at least 8 characters long',
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/ 
      },
      confirmPassword: { 
        equals: 'password' as const, // This will use default message
        validate: (value, values) => {
          if (value !== values.password) {
            return 'Passwords do not match';
          }
          return true;
        }
      },
      age: { 
        min: 'You must be at least 18 years old',
        max: 'Age must be less than 120' 
      },
      phone: { 
        validate: (value) => {
          if (value && !/^\d{10}$/.test(value)) {
            return 'Please enter a valid 10-digit phone number';
          }
          return true;
        }
      },
      website: {
        validate: (value) => {
          if (value && !value.startsWith('https://')) {
            return 'Website must start with https://';
          }
          return true;
        }
      },
      birthDate: {
        validate: (value) => {
          if (value) {
            const birthDate = new Date(value);
            const today = new Date();
            if (birthDate > today) {
              return 'Birth date cannot be in the future';
            }
          }
          return true;
        }
      }
    },
  });

  return (
    <form>
      <TextInput<UserForm>
        label="Email"
        name="email"
        form={form}
        withAsterisk
        type="email"
      />
      
      <TextInput<UserForm>
        label="Password"
        name="password"
        form={form}
        withAsterisk
        type="password"
      />
      
      <TextInput<UserForm>
        label="Confirm Password"
        name="confirmPassword"
        form={form}
        withAsterisk
        type="password"
      />
      
      <NumberInput<UserForm>
        label="Age"
        name="age"
        form={form}
        withAsterisk
        min={18}
        max={120}
      />
      
      <TextInput<UserForm>
        label="Phone"
        name="phone"
        form={form}
        placeholder="1234567890"
      />
      
      <TextInput<UserForm>
        label="Website"
        name="website"
        form={form}
        placeholder="https://example.com"
      />
      
      <DateInput<UserForm>
        label="Birth Date"
        name="birthDate"
        form={form}
      />
    </form>
  );
}






// hooks/use-custom-validation.ts
import { useCallback } from 'react';

export const useCustomValidation = () => {
  const validateEmail = useCallback((value: string): string | null => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  }, []);

  const validatePassword = useCallback((value: string): string | null => {
    if (!value) return null;
    if (value.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(value)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(value)) {
      return 'Password must contain at least one number';
    }
    return null;
  }, []);

  const validatePhone = useCallback((value: string): string | null => {
    if (!value) return null;
    const phoneRegex = /^(\+\d{1,3})?[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/;
    if (!phoneRegex.test(value)) {
      return 'Please enter a valid phone number';
    }
    return null;
  }, []);

  const validateUrl = useCallback((value: string): string | null => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  }, []);

  return {
    validateEmail,
    validatePassword,
    validatePhone,
    validateUrl,
  };
};




// Usage in component
function MyForm() {
  const { validateEmail, validatePassword } = useCustomValidation();
  
  return (
    <form>
      <TextInput
        label="Email"
        name="email"
        form={form}
        customValidator={validateEmail}
      />
      
      <TextInput
        label="Password"
        name="password"
        form={form}
        type="password"
        customValidator={validatePassword}
      />
    </form>
  );
}







// Example enhanced TextInput with custom validation
export function TextInput<T extends object>({
  label,
  name,
  form,
  withAsterisk,
  placeholder,
  clearable,
  disabled = false,
  type = "text",
  className,
  customValidator, // Add custom validator prop
  ...htmlAttributes
}: TextInputProps<T> & { 
  customValidator?: (value: string) => string | null;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'>) {
  
  const { value, onChange, onBlur } = form.getInputProps(name);
  const error = getFieldError(form, name as string);
  const isInvalid = isFieldInvalid(form, name as string);
  const isTouched = form.touched[name as string];

  const handleBlur = () => {
    onBlur?.();
    
    // Run custom validation on blur
    if (customValidator && isTouched) {
      const customError = customValidator(String(value || ''));
      if (customError) {
        form.setFieldError(name as string, customError);
      }
    }
    
    if (isTouched && isInvalid) {
      validateField(form, name as string);
    }
  };

  // ... rest of the component
}






// Real-time validation with debouncing
import { useDebounce } from '../../hooks/use-debounce';

export function TextInputWithRealTimeValidation<T extends object>({
  label,
  name,
  form,
  withAsterisk,
  placeholder,
  disabled = false,
  type = "text",
  className,
  realTimeValidator,
  debounceMs = 300,
  ...htmlAttributes
}: TextInputProps<T> & { 
  realTimeValidator?: (value: string) => string | null;
  debounceMs?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'>) {
  
  const { value, onChange, onBlur } = form.getInputProps(name);
  const error = getFieldError(form, name as string);
  const isInvalid = isFieldInvalid(form, name as string);
  
  const debouncedValidate = useDebounce((value: string) => {
    if (realTimeValidator) {
      const validationError = realTimeValidator(value);
      if (validationError) {
        form.setFieldError(name as string, validationError);
      } else if (error) {
        // Clear error if validation passes
        form.setFieldError(name as string, '');
      }
    }
  }, debounceMs);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    
    // Run real-time validation
    if (realTimeValidator) {
      debouncedValidate(e.target.value);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* ... rest of the component */}
      <input
        {...htmlAttributes}
        type={type}
        value={stringValue}
        onChange={handleChange} // Use custom change handler
        onBlur={onBlur}
        // ... other props
      />
      {/* ... error display */}
    </div>
  );
}