import { Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense } from "react";
import { useAuth } from "../pages/auth/useAuth";
import Loading from "../components/Loading";

const LoginPage = React.lazy(() => import("../pages/auth/LoginPage"));
const Dashboard = React.lazy(() => import("../pages/dashboard/Dashboard"));
const Layout = React.lazy(() => import("../pages/layout/Layout"));
const UsersPage = React.lazy(() => import("../pages/users/UsersPage"));
const TeamsPage = React.lazy(() => import("../pages/teams/TeamsPage"));
const MasterKegiatanPage = React.lazy(() => import("../pages/master/MasterKegiatanPage"));
const PenugasanPage = React.lazy(() => import("../pages/penugasan/PenugasanPage"));
const PenugasanDetailPage = React.lazy(() => import("../pages/penugasan/PenugasanDetailPage"));
const LaporanHarianPage = React.lazy(() => import("../pages/laporan/LaporanHarianPage"));
const KegiatanTambahanPage = React.lazy(() => import("../pages/tambahan/KegiatanTambahanPage"));
const KegiatanTambahanDetailPage = React.lazy(() => import("../pages/tambahan/KegiatanTambahanDetailPage"));

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
    <Suspense fallback={<Loading />}>
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
        <Route path="laporan-harian" element={<LaporanHarianPage />} />
        <Route path="kegiatan-tambahan" element={<KegiatanTambahanPage />} />
        <Route path="kegiatan-tambahan/:id" element={<KegiatanTambahanDetailPage />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
