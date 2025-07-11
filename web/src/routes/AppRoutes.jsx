import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import Dashboard from "../pages/dashboard/Dashboard";
import Layout from "../pages/layout/Layout";
import { useAuth } from "../pages/auth/useAuth";

function PrivateRoute({ children }) {
  const { token, user } = useAuth();
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function AppRoutes() {
  const { token, user } = useAuth();

  return (
    <Routes>
      {/* Login tidak pakai layout */}
      <Route
        path="/login"
        element={token && user ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* Halaman lain pakai layout */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        {/* Tambahkan rute lainnya nanti di sini */}
      </Route>
    </Routes>
  );
}
