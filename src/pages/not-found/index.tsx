import { Link } from "react-router-dom";
import { useAuthContext } from "../../hooks";


const NotFound = () => {
  const { isAuthenticated } = useAuthContext();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2">
          Sorry, the page you are looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to={isAuthenticated ? "/" : "/login"}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isAuthenticated ? "Go to Dashboard" : "Go to Login"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;