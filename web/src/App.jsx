import React, { Suspense } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAuth } from "./pages/auth/useAuth";

const LoginPage = React.lazy(() => import("./pages/auth/LoginPage"));

export default function App() {
  const { token, user } = useAuth();

  if (!token || !user) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <LoginPage />
      </Suspense>
    );
  }

  return <AppRoutes />;
}
