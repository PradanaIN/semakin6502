import React, { Suspense } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAuth } from "./pages/auth/useAuth";
import Loading from "./components/Loading";

const LoginPage = React.lazy(() => import("./pages/auth/LoginPage"));

export default function App() {
  const { token, user } = useAuth();

  if (!token || !user) {
    return (
      <Suspense fallback={<Loading fullScreen />}>
        <LoginPage />
      </Suspense>
    );
  }

  return <AppRoutes />;
}
