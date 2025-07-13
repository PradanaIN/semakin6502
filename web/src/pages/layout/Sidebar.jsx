import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

// eslint-disable-next-line no-unused-vars
export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth();

  const links = [
    { to: "/", label: "Dashboard", show: true },
    { to: "/penugasan", label: "Penugasan Mingguan", show: true },
    { to: "/laporan-harian", label: "Laporan Harian", show: true },
    { to: "/kegiatan-tambahan", label: "Kegiatan Tambahan", show: true },
    {
      to: "/master-kegiatan",
      label: "Master Kegiatan",
      show: ["admin", "ketua"].includes(user?.role),
    },
    {
      to: "/users",
      label: "Kelola Pengguna",
      show: user?.role === "admin",
    },
    { to: "/teams", label: "Kelola Tim", show: user?.role === "admin" },
  ];

  return (
    <aside className="h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 shadow-md overflow-y-auto flex flex-col">
      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6 text-center">
        SEMAKIN 6502
      </div>
      <nav className="space-y-2">
        {links.filter((l) => l.show).map((link) => (
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
