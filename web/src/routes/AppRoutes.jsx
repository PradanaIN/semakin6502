import { Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense } from "react";
import { useAuth } from "../features/auth/hooks/useAuth";
import Loading from "../components/Loading";

const LoginPage = React.lazy(() => import("../features/auth/pages/LoginPage"));
const Dashboard = React.lazy(() => import("../features/dashboard/pages/Dashboard"));
const Layout = React.lazy(() => import("../pages/layout/Layout"));
const UsersPage = React.lazy(() => import("../features/users/pages/UsersPage"));
const TeamsPage = React.lazy(() => import("../features/teams/pages/TeamsPage"));
const MasterKegiatanPage = React.lazy(() =>
  import("../features/master/pages/MasterKegiatanPage")
);
const PenugasanPage = React.lazy(() =>
  import("../features/penugasan/pages/PenugasanPage")
);
const PenugasanDetailPage = React.lazy(() =>
  import("../features/penugasan/pages/PenugasanDetailPage")
);
const LaporanHarianPage = React.lazy(() =>
  import("../features/laporan/pages/LaporanHarianPage")
);
const TugasTambahanPage = React.lazy(() =>
  import("../features/tambahan/pages/TugasTambahanPage")
);
const TugasTambahanDetailPage = React.lazy(() =>
  import("../features/tambahan/pages/TugasTambahanDetailPage")
);
const MonitoringPage = React.lazy(() =>
  import("../features/monitoring/pages/MonitoringPage")
);
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
          <Route path="users" element={<UsersPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="master-kegiatan" element={<MasterKegiatanPage />} />
          <Route path="tugas-mingguan" element={<PenugasanPage />} />
          <Route path="tugas-mingguan/:id" element={<PenugasanDetailPage />} />
          <Route path="laporan-harian" element={<LaporanHarianPage />} />
          <Route path="monitoring" element={<MonitoringPage />} />
          <Route path="tugas-tambahan" element={<TugasTambahanPage />} />
          <Route
            path="tugas-tambahan/:id"
            element={<TugasTambahanDetailPage />}
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
