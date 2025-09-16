import { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";

export default function Unauthorized(): JSX.Element {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <section
        role="alert"
        aria-labelledby="unauth-title"
        aria-describedby="unauth-desc"
        className="w-full max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-8 md:p-12 flex flex-col gap-6"
      >
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {/* simple warning / lock icon */}
            <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm-2 6V6a2 2 0 114 0v2H8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h1
              id="unauth-title"
              className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100"
            >
              Unauthorized
            </h1>
            <p
              id="unauth-desc"
              className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300"
            >
              You don't have permission to access this page. Contact your
              administrator or sign in with an account that has the proper role.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
              <Button
                type="button"
                onClick={() => navigate(-1)}
              >
                Go back
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
