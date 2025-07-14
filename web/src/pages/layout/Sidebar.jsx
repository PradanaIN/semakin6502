import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  FilePlus,
  List,
  Users,
  UserCog,
} from "lucide-react";

// eslint-disable-next-line no-unused-vars
export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth();

  const mainLinks = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, show: true },
    { to: "/penugasan", label: "Penugasan Mingguan", icon: ClipboardList, show: true },
    { to: "/laporan-harian", label: "Laporan Harian", icon: FileText, show: true },
    { to: "/kegiatan-tambahan", label: "Kegiatan Tambahan", icon: FilePlus, show: true },
  ];

  const manageLinks = [
    {
      to: "/master-kegiatan",
      label: "Master Kegiatan",
      icon: List,
      show: ["admin", "ketua"].includes(user?.role),
    },
    { to: "/users", label: "Kelola Pengguna", icon: Users, show: user?.role === "admin" },
    { to: "/teams", label: "Kelola Tim", icon: UserCog, show: user?.role === "admin" },
  ];

  const renderLink = (link) => {
    const Icon = link.icon;
    return (
      <NavLink
        key={link.to}
        to={link.to}
        onClick={() => setMobileOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-2 rounded transition-all ${
            isActive
              ? "bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white font-semibold"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`
        }
      >
        <Icon size={18} />
        {link.label}
      </NavLink>
    );
  };

  return (
    <aside className="h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 shadow-md overflow-y-auto flex flex-col">
      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6 text-center">
        SEMAKIN 6502
      </div>
      <nav className="space-y-2">
        {mainLinks.filter((l) => l.show).map(renderLink)}
        {manageLinks.some((l) => l.show) && (
          <hr className="my-4 border-gray-200 dark:border-gray-700" />
        )}
        {manageLinks.filter((l) => l.show).map(renderLink)}
      </nav>
    </aside>
  );
}
