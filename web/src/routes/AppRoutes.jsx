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
import KegiatanTambahanPage from "../pages/tambahan/KegiatanTambahanPage";
import KegiatanTambahanDetailPage from "../pages/tambahan/KegiatanTambahanDetailPage";

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
        element={token && user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
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
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="master-kegiatan" element={<MasterKegiatanPage />} />
        <Route path="tugas-mingguan" element={<PenugasanPage />} />
        <Route path="tugas-mingguan/:id" element={<PenugasanDetailPage />} />
        <Route path="tugas-tambahan" element={<KegiatanTambahanPage />} />
        <Route path="tugas-tambahan/:id" element={<KegiatanTambahanDetailPage />} />
        <Route path="laporan-harian" element={<LaporanHarianPage />} />
        <Route path="kegiatan-tambahan" element={<KegiatanTambahanPage />} />
        <Route path="kegiatan-tambahan/:id" element={<KegiatanTambahanDetailPage />} />
      </Route>
    </Routes>
  );
}
