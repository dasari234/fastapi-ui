import { lazy } from "react";
import { type RouteObject } from "react-router-dom";

import NotFound from "../pages/not-found";
import LoginRedirect from "./LoginRedirect";
import ProtectedRoute from "./ProtectedRoute";

const RootLayout = lazy(() => import("../layouts/RootLayout"));
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
    element: <NotFound />,
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
    element: <NotFound />,
  },
];
