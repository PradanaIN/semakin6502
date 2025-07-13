import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import Dashboard from "../pages/dashboard/Dashboard";
import Layout from "../pages/layout/Layout";
import { useAuth } from "../pages/auth/useAuth";
import UsersPage from "../pages/users/UsersPage";
import TeamsPage from "../pages/teams/TeamsPage";
import MasterKegiatanPage from "../pages/master/MasterKegiatanPage";
import PenugasanPage from "../pages/penugasan/PenugasanPage";
import PenugasanDetailPage from "../pages/penugasan/PenugasanDetailPage";
import LaporanHarianPage from "../pages/laporan/LaporanHarianPage";

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
        <Route path="teams" element={<TeamsPage />} />
        <Route path="master-kegiatan" element={<MasterKegiatanPage />} />
        <Route path="penugasan" element={<PenugasanPage />} />
        <Route path="penugasan/:id" element={<PenugasanDetailPage />} />
        <Route path="laporan-harian" element={<LaporanHarianPage />} />
      </Route>
    </Routes>
  );
}
