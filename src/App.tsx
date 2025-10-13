import { Suspense, useEffect } from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PageLoadingSpinner from "./components/loading-spinner/LoadingSpinner";
import { AuthProvider } from "./context/AuthProvider";
import "./index.css";
import { routes } from "./routes";

const AppRoutes = () => {
  const routing = useRoutes(routes);
  return routing;
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
      <ToastContainer position="top-center" autoClose={2000} />
      <AuthProvider>
      <Suspense fallback={<PageLoadingSpinner />}>
        <AppRoutes />
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
