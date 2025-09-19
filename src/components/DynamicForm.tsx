import { useForm } from "../lib/use-form";
import type { Path, UseFormReturnType, ValidationRule } from "../lib/use-form/types";
import { Button } from "./ui/Button";
import { PasswordInput } from "./ui/form/password-input/PasswordInput";
import { Select } from "./ui/form/select/Select";
import { TextInput } from "./ui/form/text-input/TextInput";

export interface Field<T extends object = Record<string, unknown>> {
  label: string;
  name: Path<T>;
  type: "text" | "email" | "password" | "select";
  disabled: boolean;
  options?: { label: string; value: string }[];
  rules?: ValidationRule<T>;
  isVisible?: boolean;
}

interface FormProps<T extends object> {
  buttonLabel: string;
  formFields: Field<T>[];
  onSubmit: (values: T, form: UseFormReturnType<T>) => void | Promise<void>;
  initialValues?: Partial<T>;
  isLoading?: boolean;
}

export function DynamicForm<T extends object>({
  formFields,
  onSubmit,
  initialValues,
  buttonLabel,
  isLoading = false,
}: FormProps<T>) {

  const form = useForm<T>({
    initialValues: formFields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]:
          initialValues?.[field.name as unknown as keyof T] ??
          (field.type === "select" ? field.options?.[0]?.value ?? "" : ""),
      }),
      {} as Partial<T>
    ) as T,

    rules: formFields.reduce((acc, field) => {
      if (field.rules && field.isVisible !== false) {
        acc[field.name] = field.rules;
      }
      return acc;
    }, {} as Record<Path<T>, ValidationRule<T>>),
    validateInputOnBlur: true,
  });

  return (
    <form
      onSubmit={form.onSubmit((values) => onSubmit(values, form))}
      className="space-y-6"
    >
      {formFields.map((field) => {
        if ((field.type === "text" || field.type === "email") && (field.isVisible ?? true)) {
          return (
            <TextInput<T>
              key={field.name}
              label={field.label}
              name={field.name}
               // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-expect-error
              form={form}
              disabled={field.disabled}
              withAsterisk
            />
          );
        }
        if (field.type === "password" && (field.isVisible ?? true)) {
          return (
            <PasswordInput<T>
              key={field.name}
              label={field.label}
              name={field.name}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-expect-error
              form={form}
              withAsterisk
              disabled={field.disabled}
            />
          );
        }

        if ((field.type === "select" && field.options) && (field.isVisible ?? true)) {
          return (
            <Select<T>
              key={field.name}
              label={field.label}
              name={field.name}
              form={form}
              options={field.options}
              withAsterisk
              disabled={field.disabled}
              clearable={false}
            />
          );
        }
        return null;
      })}
      <Button type="submit" loading={isLoading} className="w-full h-10">
        {buttonLabel}
      </Button>
    </form>
  );
}
