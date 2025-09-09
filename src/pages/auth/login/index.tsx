import { useEffect } from "react";
import Footer from "../../../components/Footer";
import { Button } from "../../../components/ui/Button";
import { useAuthContext } from "../../../hooks";
import type { Login } from "../../../types";
// import { isNotEmpty, useForm } from "@mantine/form";
import { Link } from "react-router-dom";
import { PasswordInput } from "../../../components/ui/form/password-input/PasswordInput";
import { TextInput } from "../../../components/ui/form/text-input/TextInput";
import { useForm } from "../../../hooks/use-form";

function UserLogin() {
  const { login, isLoading } = useAuthContext();

  const form = useForm<Login>({
    initialValues: {
      username: "",
      password: "",
    },

    rules: {
      username: { required: "Email is required", pattern: /^\S+@\S+$/i },
      password: {
        required: "Password is required",
        minLength: 6,
        // message: "Password must be at least 6 characters",
      },

      // username: (value) => {
      //   const notEmptyValidation = isNotEmpty("Email is required")(value);
      //   const emailValidation =
      //     /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(value)
      //       ? null
      //       : "Invalid email address";

      //   return notEmptyValidation || emailValidation;
      // },
      // password: (value) => {
      //   const isNotEmptyValidation = isNotEmpty("Password is required")(value);
      //   const minLengthValidation =
      //     value.length >= 6 ? null : "Password must be at least 6 characters";

      //   return isNotEmptyValidation || minLengthValidation;
      // },
    },
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values: typeof form.values) => {
    await login(values);
  };

  useEffect(() => {
    document.title = "Login";
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
              Welcome Back to Sentinel!
              <br />
              Please login to your Sentinel account to continue
            </h2>

            <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-6">
              <div>
                <TextInput
                  label="Email"
                  name="username"
                  form={form}
                  withAsterisk
                />
              </div>

              <div>
                <PasswordInput
                  label="Password"
                  name="password"
                  form={form}
                  withAsterisk
                />
              </div>

              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" loading={isLoading} className="w-full h-10">
                Sign In
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* footer is pushed to the bottom */}
      <Footer />
    </div>
  );
}

export default UserLogin;
