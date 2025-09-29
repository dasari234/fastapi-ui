import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DynamicForm, type Field } from "../../components/DynamicForm";
import { useAuthContext } from "../../hooks";
import type { UseFormReturnType } from "../../lib/use-form/types";
import { setLocalStorage } from "../../lib/utils";
import UserService from "../../services/userService";
import type { UserResponse } from "../../types";

export default function MyProfile() {
  const { user, setUser } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const formFields: Field[] = [
    { label: "First Name", name: "first_name", type: "text", disabled: false },
    { label: "Last Name", name: "last_name", type: "text", disabled: false },
    { label: "Email", name: "email", type: "email", disabled: true },
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

  const handleUpdate = async (
    values: Partial<UserResponse>,
    form: UseFormReturnType<Partial<UserResponse>>
  ) => {
    if (!user?.id) return;

    try {
      setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    document.title = "My Profile";
  }, []);

  return (
    <>
      {user ? (
        <div className="w-lg">
          <DynamicForm
            formFields={formFields}
            initialValues={
              user
                ? ({ ...user } as Partial<Record<string, unknown>>)
                : undefined
            }
            buttonLabel="Update"
            onSubmit={handleUpdate}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <p>User Details not Found</p>
      )}
    </>
  );
}
