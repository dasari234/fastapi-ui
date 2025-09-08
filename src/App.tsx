import { useEffect } from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthProvider";
import { useAuthContext } from "./hooks";
import "./index.css";
import { authRoutes, nonAuthRoutes } from "./routes";

const AppRoutes = () => {
  const { isAuthenticated } = useAuthContext();
  const routes = useRoutes(isAuthenticated ? authRoutes : nonAuthRoutes);
  return routes;
};

function App() {
  useEffect(() => {
    console.info(`Application running in ${import.meta.env.VITE_MODE} mode.`);
    // console.info("Git Commit:", __COMMIT_HASH__);
    // console.log("Commit Date:", __COMMIT_DATE__);
    window.scrollTo(0, 0);
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={2000} />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
