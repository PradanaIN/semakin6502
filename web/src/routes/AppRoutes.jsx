import { Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense } from "react";
import { useAuth } from "../pages/auth/useAuth";
import Loading from "../components/Loading";
import ErrorBoundary from "../components/ErrorBoundary";
import { ROLES } from "../utils/roles";

const LoginPage = React.lazy(() => import("../pages/auth/LoginPage"));
const Dashboard = React.lazy(() => import("../pages/dashboard/Dashboard"));
const Layout = React.lazy(() => import("../pages/layout/Layout"));
const UsersPage = React.lazy(() => import("../pages/users/UsersPage"));
const TeamsPage = React.lazy(() => import("../pages/teams/TeamsPage"));
const MasterKegiatanPage = React.lazy(() =>
  import("../pages/master/MasterKegiatanPage")
);
const PenugasanPage = React.lazy(() =>
  import("../pages/penugasan/PenugasanPage")
);
const PenugasanDetailPage = React.lazy(() =>
  import("../pages/penugasan/PenugasanDetailPage")
);
const WeeklyTasksPage = React.lazy(() =>
  import("../pages/penugasan/WeeklyTasksPage")
);
const LaporanHarianPage = React.lazy(() =>
  import("../pages/laporan/LaporanHarianPage")
);
const TugasTambahanPage = React.lazy(() =>
  import("../pages/tambahan/TugasTambahanPage")
);
const TugasTambahanDetailPage = React.lazy(() =>
  import("../pages/tambahan/TugasTambahanDetailPage")
);
const MonitoringPage = React.lazy(() =>
  import("../pages/monitoring/MonitoringPage")
);
const MissedReportsPage = React.lazy(() =>
  import("../pages/monitoring/MissedReportsPage")
);
const ProfilePage = React.lazy(() => import("../pages/profile/ProfilePage"));
const NotFound = React.lazy(() => import("../pages/NotFound"));

function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (roles && !roles.includes(user?.role)) {
    return (
      <Navigate
        to={user?.role === ROLES.PIMPINAN ? "/monitoring" : "/dashboard"}
        replace
      />
    );
  }
  return children;
}

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading fullScreen />}>
        <Routes>
        {/* Login tidak pakai layout */}
        <Route
          path="/login"
          element={
            user ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
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
          <Route
            path="dashboard"
            element={
              <RoleRoute roles={[ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA]}>
                <Dashboard />
              </RoleRoute>
            }
          />
          <Route path="profile" element={<ProfilePage />} />

          <Route
            path="users"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <UsersPage />
              </RoleRoute>
            }
          />
          <Route
            path="teams"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <TeamsPage />
              </RoleRoute>
            }
          />
          <Route
            path="master-kegiatan"
            element={
              <RoleRoute roles={[ROLES.ADMIN, ROLES.KETUA]}>
                <MasterKegiatanPage />
              </RoleRoute>
            }
          />
          <Route
            path="tugas-mingguan"
            element={
              <RoleRoute roles={[ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA]}>
                <PenugasanPage />
              </RoleRoute>
            }
          />
          <Route
            path="tugas-mingguan/:id"
            element={
              <RoleRoute roles={[ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA]}>
                <PenugasanDetailPage />
              </RoleRoute>
            }
          />
          <Route
            path="laporan-harian"
            element={
              <RoleRoute roles={[ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA]}>
                <LaporanHarianPage />
              </RoleRoute>
            }
          />
          <Route
            path="monitoring"
            element={
              <RoleRoute roles={[ROLES.ADMIN, ROLES.PIMPINAN, ROLES.KETUA, ROLES.ANGGOTA]}>
                <MonitoringPage />
              </RoleRoute>
            }
          />
          <Route
            path="laporan-terlambat"
            element={
              <RoleRoute roles={[ROLES.ADMIN, ROLES.PIMPINAN, ROLES.KETUA, ROLES.ANGGOTA]}>
                <MissedReportsPage />
              </RoleRoute>
            }
          />
          <Route
            path="tugas-tambahan"
            element={
              <RoleRoute roles={[ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA]}>
                <TugasTambahanPage />
              </RoleRoute>
            }
          />
          <Route
            path="tugas-tambahan/:id"
            element={
              <RoleRoute roles={[ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA]}>
                <TugasTambahanDetailPage />
              </RoleRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
