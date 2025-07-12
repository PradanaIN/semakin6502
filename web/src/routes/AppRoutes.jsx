import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import Dashboard from "../pages/dashboard/Dashboard";
import Layout from "../pages/layout/Layout";
import { useAuth } from "../pages/auth/useAuth";
import UsersPage from "../pages/users/UsersPage";
import MasterKegiatanPage from "../pages/master/MasterKegiatanPage";

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
        <Route path="users" element={<UsersPage />} />
        <Route path="master-kegiatan" element={<MasterKegiatanPage />} />
        {/* Tambahkan rute lainnya nanti di sini */}
      </Route>
    </Routes>
  );
}
