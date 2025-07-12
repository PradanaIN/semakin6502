import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

// eslint-disable-next-line no-unused-vars
export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth();

  const links = [];

  links.push({ to: "/", label: "Dashboard" });

  if (["admin", "pimpinan"].includes(user?.role)) {
    links.push({ to: "/users", label: "Kelola Pengguna" });
    links.push({ to: "/teams", label: "Kelola Tim" });
  }

  if (["ketua", "admin"].includes(user?.role)) {
    links.push({ to: "/master-kegiatan", label: "Master Kegiatan" });
    links.push({ to: "/penugasan", label: "Penugasan Mingguan" });
  }

  if (["anggota", "ketua", "admin"].includes(user?.role)) {
    links.push({ to: "/laporan-harian", label: "Laporan Harian" });
    links.push({ to: "/kegiatan-tambahan", label: "Kegiatan Tambahan" });
  }

  if (["admin", "pimpinan", "ketua"].includes(user?.role)) {
    links.push({ to: "/monitoring", label: "Monitoring Kinerja" });
  }

  return (
    <aside className="h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 shadow-md overflow-y-auto flex flex-col">
      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6 text-center">
        SEMAKIN 6502
      </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition-all ${
                isActive
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
