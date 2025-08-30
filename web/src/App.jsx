import React, { Suspense } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAuth } from "./pages/auth/useAuth";
import Loading from "./components/Loading";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundaryWrapper from "./components/ErrorBoundaryWrapper";
import { initHttp } from "./utils/http";

const LoginPage = React.lazy(() => import("./pages/auth/LoginPage"));

export default function App() {
  // Initialize axios interceptors once
  initHttp();
  const { user } = useAuth();

  return (
    <ErrorBoundaryWrapper>
      <Suspense fallback={<Loading fullScreen />}>
        {user ? <AppRoutes /> : <LoginPage />}
      </Suspense>
    </ErrorBoundaryWrapper>
  );
}
