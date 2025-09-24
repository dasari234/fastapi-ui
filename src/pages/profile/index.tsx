import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { DynamicForm, type Field } from "../../components/DynamicForm";
import { useAuthContext } from "../../hooks";
import type { UseFormReturnType } from "../../lib/use-form/types";
import { setLocalStorage } from "../../lib/utils";
import UserService from "../../services/userService";
import type { UserResponse } from "../../types";

type ResetPasswordForm = {
  new_password: string;
  confirm_password: string;
  current_password: string;
};

export default function Profile() {
  const { user, setUser } = useAuthContext();
  const navigate = useNavigate();

  const formFields: Field[] = [
    { label: "First Name", name: "first_name", type: "text", disabled: false },
    { label: "Last Name", name: "last_name", type: "text", disabled: false },
    { label: "Email", name: "email", type: "email", disabled: false },
    {
      label: "Role",
      name: "role",
      type: "select",
      options: [
        { label: "User", value: "user" },
        { label: "Admin", value: "admin" },
      ],
      disabled: true,
    },
  ];

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

  const handleUpdate = async (
    values: Partial<UserResponse>,
    form: UseFormReturnType<Partial<UserResponse>>
  ) => {
    if (!user?.id) return;

    try {
      await UserService.updateUser(
        user.id,
        Object.fromEntries(
          Object.entries(form.values).map(([k, v]) => [
            k,
            v != null ? String(v) : undefined,
          ])
        ) as Record<string, string | undefined>
      );
      const updatedUser = { ...user, ...form.values };
      setUser(updatedUser);
      setLocalStorage("user", JSON.stringify(updatedUser));
      toast.success("User Updated");
    } catch {
      toast.error("Failed to update user");
    }
  };

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
        navigate("/login");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error);
    }
  };

  useEffect(() => {
    document.title = "Profile";
  }, []);

  return (
    <>
      {/* <h1>User's Profile</h1> */}
      <h1 className="m-2 text-3xl font-medium text-blue-500 ">My Profile</h1>
      {user ? (
        <div className="p-4 justify-self-center w-lg">
          <DynamicForm
            formFields={formFields}
            initialValues={
              user
                ? ({ ...user } as Partial<Record<string, unknown>>)
                : undefined
            }
            buttonLabel="Update"
            onSubmit={handleUpdate}
          />
        </div>
      ) : (
        <p>User Details not Found</p>
      )}
      <hr className="mt-5 mb-10" />
      <h1 className="m-2 text-3xl font-medium text-blue-500 ">
        Change Password
      </h1>
      <div className="w-md justify-self-center">
        <DynamicForm
          formFields={passwordFields}
          buttonLabel="Update Password"
          onSubmit={handleUpdatePassword}
        />
      </div>
    </>
  );
}
