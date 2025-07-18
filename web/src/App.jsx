import React, { Suspense } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAuth } from "./features/auth/hooks/useAuth";
import Loading from "./components/Loading";

const LoginPage = React.lazy(() => import("./features/auth/pages/LoginPage"));

export default function App() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Suspense fallback={<Loading fullScreen />}>
        <LoginPage />
      </Suspense>
    );
  }

  return <AppRoutes />;
}
