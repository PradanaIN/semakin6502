import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import Dashboard from "../pages/dashboard/Dashboard";
import Layout from "../pages/layout/Layout";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Login tidak pakai layout */}
      <Route path="/login" element={<LoginPage />} />

      {/* Halaman lain pakai layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        {/* Tambahkan rute lainnya nanti di sini */}
      </Route>
    </Routes>
  );
}
