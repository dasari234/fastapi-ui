import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router-dom";

import LoginRedirect from "./LoginRedirect";
import ProtectedRoute from "./ProtectedRoute";

const RootLayout = lazy(() => import("../layouts/RootLayout"));
const LoginPage = lazy(() => import("../pages/auth/login"));
const Unauthorized = lazy(() => import("../pages/unauthorized"));

// Lazy load the HomePage component
const UserDashboardPage = lazy(() => import("../pages/dashboard"));
const AdminDashboardPage = lazy(() => import("../pages/admin"));

export const nonAuthRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginRedirect />,
  },
  {
    path: "*",
    element: <LoginPage />,
  },
];

export const authRoutes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute requiredRole="user">
            <UserDashboardPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/admin",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/unauthorized",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Unauthorized />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];
