import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../auth/useAuth";
import { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useTheme } from "../../theme/useTheme.jsx";
import Swal from "sweetalert2";
import confirmAlert from "../../utils/confirmAlert";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import {
  FaBell,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaSignOutAlt,
  FaIdBadge,
  FaCheckCircle,
} from "react-icons/fa";
import { ROLES } from "../../utils/roles";
import dayjs from "../../utils/dayjs";

export default function Layout() {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const profileRef = useRef();
  const notifRef = useRef();

  const fetchNotifications = useCallback(async () => {
    if (!user || user.role === ROLES.PIMPINAN) return;
    try {
      const res = await axios.get("/notifications");
      const data = Array.isArray(res.data) ? res.data : [];
      if (!Array.isArray(res.data)) {
        console.warn("Unexpected notifications response", res.data);
      }
      setNotifications(data);
      setNotifCount(data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
    }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleLogout = async () => {
    const r = await confirmAlert({
      title: "Logout?",
      text: "Anda yakin ingin logout?",
      icon: "warning",
      confirmButtonText: "Logout",
    });
    if (!r.isConfirmed) return;
    await axios.post("/auth/logout", {}, { withCredentials: true });
    localStorage.removeItem("user");
    setUser(null);
  };

  const markAllAsRead = async () => {
    try {
      await axios.post("/notifications/read-all");
      const updated = notifications.map((n) => ({ ...n, isRead: true }));
      setNotifications(updated);
      setNotifCount(0);
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notifications", err);
    }
  };

  const markAsRead = async (id, link) => {
    try {
      await axios.post(`/notifications/${id}/read`);
      if (link) navigate(link);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setNotifCount((c) => Math.max(0, c - 1));
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getPageTitle = useCallback(() => {
    const slug = location.pathname.split("/")[1] || "dashboard";
    return slug
      .replaceAll("-", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>{`SEMAKIN 6502 - ${getPageTitle()}`}</title>
        <meta
          name="description"
          content="Sistem Evaluasi dan Monitoring Kinerja"
        />
        <meta
          property="og:title"
          content={`SEMAKIN 6502 - ${getPageTitle()}`}
        />
      </Helmet>
      <div className="h-screen overflow-hidden flex text-gray-800 dark:text-gray-100 bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <div
          className={`fixed md:static top-0 left-0 z-40 h-full overflow-hidden transition-all duration-300 w-64 ${
          sidebarOpen ? "translate-x-0 md:w-64" : "-translate-x-full md:w-0"
        } md:translate-x-0`}
        >
          <Sidebar setSidebarOpen={setSidebarOpen} />
        </div>

      {/* Overlay untuk mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-30 md:hidden"
        />
      )}

      {/* Konten utama */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button
              className={`text-xl text-gray-700 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-blue-500 ${sidebarOpen ? "hidden" : ""}`}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <FaBars />
            </button>
            <div className="text-lg sm:text-xl font-semibold capitalize truncate max-w-[200px] sm:max-w-xs">
              {getPageTitle()}
            </div>
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            {/* Notifikasi */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-blue-500"
                aria-label="Notifications"
              >
                <FaBell className="text-xl cursor-pointer" />
                {notifCount > 0 && (
                  <>
                    {/* Ping animation */}
                    <span className="absolute -top-1 -right-2 inline-flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
                    </span>
                    {/* Badge */}
                    <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full shadow-sm">
                      {notifCount > 99 ? '99+' : notifCount}
                    </span>
                  </>
                )}
              </button>
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto custom-scrollbar bg-white/95 dark:bg-gray-800/95 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 py-2">
                  <div className="px-4 py-2 font-semibold border-b dark:border-gray-600 flex justify-between items-center">
                    <span>Notifikasi</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Tandai sudah dibaca
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400 text-center">
                      Tidak ada notifikasi
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        type="button"
                        onClick={() => markAsRead(notif.id, notif.link)}
                        aria-label={`Buka notifikasi ${notif.text}`}
                        className={`w-full text-left px-4 py-2 text-sm flex items-start gap-3 transition-colors ${
                          notif.isRead
                            ? "text-gray-500 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-gray-700/60"
                            : "bg-blue-50/60 dark:bg-gray-700/60 hover:bg-blue-100/60 dark:hover:bg-gray-700/80"
                        }`}
                      >
                        {/* Unread dot */}
                        <span className={`mt-1 inline-block h-2 w-2 rounded-full ${notif.isRead ? 'bg-gray-300' : 'bg-blue-500'}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`truncate ${notif.isRead ? '' : 'font-medium'}`}>{notif.text}</div>
                          <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {dayjs(notif.createdAt).fromNow()}
                          </div>
                        </div>
                        <FaCheckCircle
                          className={`mt-0.5 flex-shrink-0 ${
                            notif.isRead ? "text-green-400" : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Dark Mode */}
            <div className="hidden sm:flex items-center space-x-2">
              <FaSun className="text-yellow-400" />
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={theme === "dark"}
                  onChange={toggleTheme}
                  className="sr-only peer"
                  aria-label="Toggle dark mode"
                />
                <div className="relative w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
              <FaMoon className="text-blue-400" />
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-blue-500"
              >
                {user?.role === ROLES.ADMIN ? (
                  <FaUserCircle className="text-2xl" />
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.nama ?? "User"
                    )}`}
                    alt={user?.nama ?? "User"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div className="hidden md:block text-left">
                  {user?.role === ROLES.ADMIN ? (
                    <div className="font-semibold">Admin</div>
                  ) : (
                    <>
                      <div className="font-semibold">{user?.nama}</div>
                      <div className="text-xs capitalize text-gray-500 dark:text-gray-400">
                        {user?.role === ROLES.PIMPINAN
                          ? "Pimpinan"
                          : `${
                              user?.role === ROLES.KETUA
                                ? "Ketua Tim"
                                : "Anggota Tim"
                            } ${
                              user?.team ||
                              user?.teamName ||
                              user?.namaTim ||
                              user?.members?.[0]?.team?.namaTim ||
                              ""
                            }`}
                      </div>
                    </>
                  )}
                </div>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 py-2">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FaIdBadge className="mr-2" /> Lihat Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FaSignOutAlt className="mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Konten */}
        <main className="p-4 overflow-y-auto flex-1 bg-gray-100 dark:bg-gray-900">
          <Outlet />
        </main>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme={theme}
          newestOnTop
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          toastClassName="custom-toast"
          bodyClassName="custom-toast-body"
          progressClassName="custom-toast-progress"
        />
      </div>
    </div>
    </>
  );
}
