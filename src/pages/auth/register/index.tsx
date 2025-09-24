import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../../../services/userService";
import type { Signup, UserResponse } from "../../../types";

import { DynamicForm, type Field } from "../../../components/DynamicForm";
import type { UseFormReturnType } from "../../../lib/use-form/types";

function UserSignup() {
  const navigate = useNavigate();

  const formFields: Field<Signup>[] = [
    { label: "First Name", name: "first_name", type: "text", disabled: false,rules: { required: "First Name is required", minLength: 3 } },
    { label: "Last Name", name: "last_name", type: "text", disabled: false ,rules: { required: "Last Name is required", minLength: 3  }},
    { label: "Email", name: "email", type: "email", disabled: false ,rules: { required: "Email is required", pattern: /^\S+@\S+$/i }},
    { label: "Password", name: "password", type: "password", disabled: false ,rules: { required: "Password is required", minLength: 8,pattern: /[A-Z]/,}},
    {
      label: "Role",
      name: "role",
      type: "select",
      options: [
        { label: "User", value: "user" },
        { label: "Admin", value: "admin" },
      ],
      disabled: false,
    },
  ];

  const handleSubmit = async (
    values: Signup,
    form: UseFormReturnType<Signup>
  ) => {
    try {
      const payload = { ...values };
      const signupResponse = (await UserService.register(payload)) as
        | { success?: boolean; message?: string; data?: UserResponse }
        | undefined;

      if (signupResponse?.success && signupResponse.data) {
        form.reset();
        navigate("/");
      }
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  useEffect(() => {
    document.title = "Signup";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7FA]">
      {/* content wrapper */}
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
          <div className="p-8">
            <div className="w-full flex justify-center text-4xl mb-2 text-blue-500 font-semibold">
              Sentinel
            </div>

            <h2 className="text-md font-bold text-center mb-6 text-gray-800">
              Welcome
            </h2>
            <DynamicForm<Signup>
              buttonLabel="Sign Up"
              formFields={formFields}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSignup;
