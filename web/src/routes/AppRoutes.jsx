import { Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense } from "react";
import { useAuth } from "../pages/auth/useAuth";
import Loading from "../components/Loading";
import ErrorBoundary from "../components/ErrorBoundary";

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
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="master-kegiatan" element={<MasterKegiatanPage />} />
          <Route path="tugas-mingguan" element={<PenugasanPage />} />
          <Route path="tugas-mingguan/all" element={<WeeklyTasksPage />} />
          <Route path="tugas-mingguan/:id" element={<PenugasanDetailPage />} />
          <Route path="laporan-harian" element={<LaporanHarianPage />} />
          <Route path="monitoring" element={<MonitoringPage />} />
          <Route path="laporan-terlambat" element={<MissedReportsPage />} />
          <Route path="tugas-tambahan" element={<TugasTambahanPage />} />
          <Route
            path="tugas-tambahan/:id"
            element={<TugasTambahanDetailPage />}
          />
          <Route path="*" element={<NotFound />} />
        </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
