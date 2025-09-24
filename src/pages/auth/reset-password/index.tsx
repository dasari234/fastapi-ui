import { XCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { DynamicForm, type Field } from "../../../components/DynamicForm";
import type { UseFormReturnType } from "../../../lib/use-form/types";
import AuthService from "../../../services/auth";
import type { UserResponse } from "../../../types";

type ResetPasswordForm = {
  password: string;
  confirm_password: string;
};

const RestPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const passwordFields: Field[] = [
    {
      label: "New Password",
      name: "password",
      type: "password",
      disabled: false,
      rules: {
        required: "Password is required",
        minLength: 8,
        pattern: /[A-Z]/,
      },
    },
    {
      label: "Confirm Password",
      name: "confirm_password",
      type: "password",
      disabled: false,
      rules: {
        required: "Password is required",
        minLength: 8,
        pattern: /[A-Z]/,
      },
    },
  ];

  const handleResetPassword = async (
    values: Partial<UserResponse>,
    form: UseFormReturnType<Partial<ResetPasswordForm>>
  ) => {
    try {
      if (form.values.password !== form.values.confirm_password) {
        toast.error("Passwords do not match");
        return;
      }
      const payload = {
        new_password: form.values.password,
        token: token!,
      };
      const response = (await AuthService.resetPassword(payload)) as
        | { success?: boolean; message?: string }
        | undefined;
      if (response?.success) {
        toast.success("Password Reset SuccessFully");
        navigate("/login");
      }
      if (!response?.success) {
        form.reset();
      }
    } catch {
      toast.error("Failed to Update");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              The reset link is invalid or has expired. Please request a new
              password reset.
            </p>
            <button
              onClick={() => navigate("/forgot-password")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex  justify-center bg-gray-50">
      <div className="w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your new password below
        </p>
        <DynamicForm
          formFields={passwordFields}
          buttonLabel="Reset Password"
          onSubmit={handleResetPassword}
        />
      </div>
    </div>
  );
};

export default RestPassword;
