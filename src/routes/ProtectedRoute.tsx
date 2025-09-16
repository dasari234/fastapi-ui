import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../hooks";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: "admin" | "user";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuthContext();

if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;