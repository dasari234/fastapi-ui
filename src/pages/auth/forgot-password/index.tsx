const ForgotPassword = () => {
  // {

  //           email: email,
  //         }

    // const handleForgotPassword = async () => {
    //   try {
    //     const response = (await AuthService.forgotPassword(
    //       email
    //     )) as { success?: boolean; message?: string } | undefined;
  
    //     if (response?.success) {
    //       toast.success("Reset password link sent to registed email");
    //     } else {
    //       toast.error(response?.message);
    //     }
    //   } catch (err) {
    //     console.error("Logout error:", err);
    //     toast.error("Unexpected error during logout");
    //   }
    // };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Forgot Password
        </h2>
      </div>
    </div>
  );
};

export default ForgotPassword;
