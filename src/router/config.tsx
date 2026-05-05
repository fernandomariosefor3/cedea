import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import AppPage from "../pages/app/page";
import AuthPage from "../pages/auth/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/app",
    element: <AppPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
