import { useForm } from "@/lib/use-form";
import { Radio } from "@/components/ui/Radio";

interface MyFormValues {
  gender: string;
}

export function RadioFormExample() {
  const form = useForm<MyFormValues>({
    initialValues: {
      gender: "male",
    },
    validate: {
      gender: (value) => (!value ? "Please select a gender" : null),
    },
  });

  const handleSubmit = (values: MyFormValues) => {
    console.log("Submitted values:", values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-3">
      <Radio
        form={form}
        name="gender"
        label="Male"
        value="male"
        description="Select if you are male"
      />

      <Radio
        form={form}
        name="gender"
        label="Female"
        value="female"
        description="Select if you are female"
      />

      <Radio
        form={form}
        name="gender"
        label="Other"
        value="other"
      />

      {form.errors.gender && (
        <p className="text-red-500 text-sm">{form.errors.gender}</p>
      )}

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Submit
      </button>
    </form>
  );
}
