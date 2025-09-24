import { toast } from "react-toastify";
import { DynamicForm, type Field } from "../../../components/DynamicForm";
import AuthService from "../../../services/auth";

const ForgotPassword = () => {
  const emailField: Field[] = [
    {
      label: "Email",
      name: "email",
      type: "email",
      disabled: false,
      rules: { required: "Email is required", pattern: /^\S+@\S+$/i },
    },
  ];

  const handleForgotPassword = async (form: Record<string, string>) => {
    try {
      const response = (await AuthService.forgotPassword(form.email)) as
        | { success?: boolean; message?: string }
        | undefined;

      if (response?.success) {
        toast.success("Reset password link sent to registed email");
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      console.error(" error:", err);
      toast.error("Failed to send Email");
    }
  };

  return (
    <div className="min-h-screen flex flex-row justify-center bg-gray-50">
      <div className="w-md ">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Forgot Password
        </h2>
        <DynamicForm
          formFields={emailField}
          buttonLabel="Send Link"
          onSubmit={handleForgotPassword}
        />
      </div>
    </div>
  );
};

export default ForgotPassword;
