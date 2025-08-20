import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { ChevronLeft } from "lucide-react";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  FilePlus,
  BarChart2,
  AlertCircle,
  List,
  Users,
  UserCog,
  BookOpen,
} from "lucide-react";
import { ROLES } from "../../utils/roles";

const mainLinks = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA],
  },
  {
    to: "/tugas-mingguan",
    label: "Tugas Mingguan",
    icon: ClipboardList,
    roles: [ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA, ROLES.PIMPINAN],
  },
  {
    to: "/tugas-tambahan",
    label: "Tugas Tambahan",
    icon: FilePlus,
    roles: [ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA, ROLES.PIMPINAN],
  },
  {
    to: "/laporan-harian",
    label: "Laporan Harian",
    icon: FileText,
    roles: [ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA],
  },
  {
    to: "/monitoring",
    label: "Monitoring",
    icon: BarChart2,
    roles: [ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA, ROLES.PIMPINAN],
  },
  {
    to: "/laporan-terlambat",
    label: "Keterlambatan",
    icon: AlertCircle,
    roles: [ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA, ROLES.PIMPINAN],
  },
  {
    to: "/panduan",
    label: "Panduan",
    icon: BookOpen,
    roles: [ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA, ROLES.PIMPINAN],
  },
];

const manageLinks = [
  {
    to: "/master-kegiatan",
    label: "Master Kegiatan",
    icon: List,
    roles: [ROLES.ADMIN, ROLES.KETUA],
  },
  {
    to: "/users",
    label: "Kelola Pengguna",
    icon: Users,
    roles: [ROLES.ADMIN],
  },
  {
    to: "/teams",
    label: "Kelola Tim",
    icon: UserCog,
    roles: [ROLES.ADMIN],
  },
];

export default function Sidebar({ setSidebarOpen }) {
  const { user } = useAuth();

  const isLinkVisible = (link) =>
    !link.roles || link.roles.includes(user?.role);
  const visibleMainLinks = mainLinks.filter(isLinkVisible);
  const visibleManageLinks = manageLinks.filter(isLinkVisible);
  const isPimpinan = user?.role === ROLES.PIMPINAN;
  const isKetuaOrAnggota =
    user?.role === ROLES.KETUA || user?.role === ROLES.ANGGOTA;

  const getLink = (path) => visibleMainLinks.find((l) => l.to === path);
  const monitoringLink = getLink("/monitoring");
  const terlambatLink = getLink("/laporan-terlambat");
  const mingguanLink = getLink("/tugas-mingguan");
  const tambahanLink = getLink("/tugas-tambahan");

  const renderLink = (link) => {
    const Icon = link.icon;
    return (
      <NavLink
        key={link.to}
        to={link.to}
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
    <aside className="relative h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 shadow-md overflow-y-auto flex flex-col">
      <div className="flex items-center justify-center gap-2 mb-6">
        <img
          src="/logo.png"
          alt="Logo SEMAKIN 6502"
          className="h-8 w-8 object-contain"
        />
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          SEMAKIN 6502
        </div>
      </div>

      <nav className="space-y-2">
        {isPimpinan ? (
          <>
            {monitoringLink && renderLink(monitoringLink)}
            {terlambatLink && renderLink(terlambatLink)}
            <hr className="my-4 border-gray-200 dark:border-gray-700" />
            <div className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Data Pegawai
            </div>
            {mingguanLink && renderLink(mingguanLink)}
            {tambahanLink && renderLink(tambahanLink)}
          </>
        ) : isKetuaOrAnggota ? (
          <>
            {visibleMainLinks
              .filter(
                (link) =>
                  !["/monitoring", "/laporan-terlambat"].includes(link.to)
              )
              .map(renderLink)}
            {monitoringLink && renderLink(monitoringLink)}
            <hr className="my-4 border-gray-200 dark:border-gray-700" />
            {terlambatLink && renderLink(terlambatLink)}
          </>
        ) : (
          visibleMainLinks.flatMap((link) =>
            isKetuaOrAnggota && link.to === "/monitoring"
              ? [
                  renderLink(link),
                  <hr
                    key="monitoring-separator"
                    className="my-4 border-gray-200 dark:border-gray-700"
                  />,
                ]
              : [renderLink(link)]
          )
        )}
        {visibleManageLinks.length > 0 && (
          <hr className="my-4 border-gray-200 dark:border-gray-700" />
        )}
        {visibleManageLinks.map(renderLink)}
      </nav>
      <button
        className="mt-auto flex items-center justify-center
    text-lg text-blue-700 dark:text-white
    font-semibold  bg-white dark:bg-gray-800
    rounded-full px-4 py-2
    bg-gradient-to-tr from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800
    hover:from-blue-200 hover:to-blue-100 dark:hover:from-blue-800 dark:hover:to-blue-700
    shadow-sm hover:shadow-md
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500
    transition-all duration-200 ease-in-out"
        onClick={() => setSidebarOpen(false)}
        aria-label="Tutup menu"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="ml-2 text-sm">Tutup Sidebar</span>
      </button>
    </aside>
  );
}
