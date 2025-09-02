import { AxiosError } from "axios";

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export const errorHandler = (error: unknown): void => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;

    if (data?.message) {
      console.error(data.message);
      return;
    }

    if (data?.errors) {
      const firstErrorKey = Object.keys(data.errors)[0];
      if (firstErrorKey && data.errors[firstErrorKey].length) {
        console.error(data.errors[firstErrorKey][0]);
        return;
      }
    }

    switch (error.code) {
      case "ECONNABORTED":
        console.error("The request took too long to complete. Please try again.");
        return;
      default:
        if (error.message === "Network Error") {
          console.error("Please check your internet connection and try again.");
          return;
        }
        break;
    }

    console.error(error.message || "An unexpected error occurred.");
    return;
  }

  if (error instanceof Error) {
    console.error(error.message || "An unexpected error occurred.");
    return;
  }

  console.error("An unexpected error occurred.");
};