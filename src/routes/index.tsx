import type { RouteObject } from "react-router-dom";
import { lazy } from "react";

const RootLayout = lazy(() => import("../layouts/RootLayout"));
const LoginPage = lazy(() => import("../pages/auth/login"));

// Lazy load the HomePage component
const DashboardPage = lazy(() => import("../pages/dashboard"));


export const nonAuthRoutes: RouteObject[] = [
    {
        path: "/login",
        element: <LoginPage />,
        index: true,
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
                element: <DashboardPage />,
            },
        ],
    },
    //   {
    //     path: "/home",
    //     element: <RootLayout />,
    //     children: [
    //       {
    //         index: true,
    //         element: <HomePage />,
    //       },
    //     ],
    //   },
    //   {
    //     path: "/sites",
    //     element: <RootLayout />,
    //     children: [
    //       {
    //         index: true,
    //         element: <SiteListPage />,
    //       },
    //     ],
    //   },
    //   {
    //     path: "/sites/site/:siteId",
    //     element: <RootLayout />,
    //     children: [
    //       {
    //         index: true,
    //         element: <SiteDetailsPage />,
    //       },
    //     ],
    //   },

];
