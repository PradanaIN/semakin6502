import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  FilePlus,
  BarChart2,
  List,
  Users,
  UserCog,
} from "lucide-react";
import { ROLES } from "../../utils/roles";

export default function Sidebar({ setSidebarOpen }) {
  const { user } = useAuth();

  const mainLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { to: "/tugas-mingguan", label: "Tugas Mingguan", icon: ClipboardList, show: true },
    { to: "/kegiatan-tambahan", label: "Tugas Tambahan", icon: FilePlus, show: true },
    { to: "/laporan-harian", label: "Laporan Harian", icon: FileText, show: true },
    {
      to: "/monitoring",
      label: "Monitoring",
      icon: BarChart2,
      show: [ROLES.ADMIN, ROLES.KETUA, ROLES.PIMPINAN].includes(user?.role),
    },
  ];

  const manageLinks = [
    {
      to: "/master-kegiatan",
      label: "Master Kegiatan",
      icon: List,
      show: [ROLES.ADMIN, ROLES.KETUA].includes(user?.role),
    },
    { to: "/users", label: "Kelola Pengguna", icon: Users, show: user?.role === ROLES.ADMIN },
    { to: "/teams", label: "Kelola Tim", icon: UserCog, show: user?.role === ROLES.ADMIN },
  ];

  const renderLink = (link) => {
    const Icon = link.icon;
    return (
      <NavLink
        key={link.to}
        to={link.to}
        onClick={() => setSidebarOpen(false)}
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
