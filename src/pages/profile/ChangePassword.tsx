import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { DynamicForm, type Field } from "../../components/DynamicForm";
import { useAuthContext } from "../../hooks";
import type { UseFormReturnType } from "../../lib/use-form/types";
import UserService from "../../services/userService";
import type { UserResponse } from "../../types";

type ResetPasswordForm = {
  new_password: string;
  confirm_password: string;
  current_password: string;
};

export default function ChangePassword() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  const passwordFields: Field[] = [
    {
      label: "Current Password",
      name: "current_password",
      type: "password",
      disabled: false,
      rules: {
        required: "Password is required",
        minLength: 8,
        pattern: /[A-Z]/,
      },
    },
    {
      label: "New Password",
      name: "new_password",
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

  const handleUpdatePassword = async (
    values: Partial<UserResponse>,
    form: UseFormReturnType<Partial<ResetPasswordForm>>
  ) => {
    try {
      if (form.values.new_password !== form.values.confirm_password) {
        toast.error("Passwords do not match");
        return;
      }
      if (form.values.current_password === form.values.new_password) {
        toast.error("New Password should not match old password ");
        return;
      }

      const payload = { ...form.values };

      const response = (await UserService.changePassword(payload)) as
        | { success?: boolean; message?: string }
        | undefined;
      if (response?.success) {
        toast.success("Password Chnanged Successfully");
        logout();
        navigate("/login");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error);
    }
  };

  useEffect(() => {
    document.title = "Change Password";
  }, []);

  return (
    <div className="w-md">
      <DynamicForm
        formFields={passwordFields}
        buttonLabel="Update Password"
        onSubmit={handleUpdatePassword}
      />
    </div>
  );
}
