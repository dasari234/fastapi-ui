import { Navigate } from "react-router-dom";
import { useAuthContext } from "../hooks";
import LoginPage from "../pages/auth/login";

const LoginRedirect = () => {
  const { isAuthenticated, user } = useAuthContext();
  
  if (isAuthenticated && user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  }
  
  return <LoginPage />;
};

export default LoginRedirect;