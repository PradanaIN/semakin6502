import React, { Suspense } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAuth } from "./pages/auth/useAuth";
import Loading from "./components/Loading";
import ErrorBoundary from "./components/ErrorBoundary";

const LoginPage = React.lazy(() => import("./pages/auth/LoginPage"));

export default function App() {
  const { user } = useAuth();

  if (!user) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<Loading fullScreen />}>
          <LoginPage />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}
