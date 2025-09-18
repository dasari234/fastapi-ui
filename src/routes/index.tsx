import { lazy } from "react";
import { type RouteObject } from "react-router-dom";

import NotFound from "../pages/not-found";
import ProtectedRoute from "./ProtectedRoute";

const RootLayout = lazy(() => import("../layouts/RootLayout"));
const Unauthorized = lazy(() => import("../pages/unauthorized"));
const LoginPage = lazy(() => import("../pages/auth/login"));
const UserDashboardPage = lazy(() => import("../pages/dashboard"));
const AdminDashboardPage = lazy(() => import("../pages/admin"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/forgot-password"));
const RestPasswordPage = lazy(() => import("../pages/auth/reset-password"));

export const routes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
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
    path: "/forgot-password",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <ForgotPasswordPage />,
      },
    ],
  },
  {
    path: "/reset-password",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <RestPasswordPage />,
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
    element: <NotFound />,
  },
];
