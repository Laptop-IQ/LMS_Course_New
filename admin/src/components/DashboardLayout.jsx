import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  ShoppingBag,
  ChartSpline,
  Bell,
  ChevronDown,
  User,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  Users,
} from "lucide-react";

import logo from "../assets/logo.png";
import { adminAuthService } from "../api/adminAuth.service";
import API from "../api/adminApi";
import { useNotifications } from "../context/NotificationContext";

/* ─────────────────────────────────────────────────────────
   Helper: read & parse admin from localStorage
───────────────────────────────────────────────────────── */
const getStoredAdmin = () => {
  try {
    return JSON.parse(localStorage.getItem("adminUser")) || {};
  } catch {
    return {};
  }
};

/* ─────────────────────────────────────────────────────────
   Sub-component: Avatar — shows photo if available,
   falls back to coloured initials
───────────────────────────────────────────────────────── */
const AdminAvatar = ({ admin, size = "md" }) => {
  const name = admin?.name || admin?.username || "Admin";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeClass =
    size === "sm"
      ? "w-8 h-8 text-xs"
      : size === "lg"
        ? "w-10 h-10 text-sm"
        : "w-9 h-9 text-sm";

  if (admin?.avatar) {
    return (
      <img
        src={admin.avatar}
        alt={name}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-cyan-500/30 shrink-0`}
        onError={(e) => {
          // If image fails to load, hide it so the parent can show initials
          e.currentTarget.style.display = "none";
          e.currentTarget.nextSibling?.style.removeProperty("display");
        }}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 font-bold shrink-0`}
    >
      {initials}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Main Layout
───────────────────────────────────────────────────────── */
const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { notifications, unreadCount, markAllRead } = useNotifications();

  // ── Admin state — re-reads on every "userUpdated" event ──
  const [admin, setAdmin] = useState(getStoredAdmin);

  useEffect(() => {
    const sync = () => setAdmin(getStoredAdmin());
    window.addEventListener("userUpdated", sync);
    // Also sync when localStorage changes from another tab
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("userUpdated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const adminName = admin?.name || admin?.username || "Admin";
  const adminEmail = admin?.email || "";
  const adminRole = admin?.role || "";

  // ── Logout ──
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await adminAuthService.logout();
    } catch {}
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

 const nav = [
   { label: "Overview", icon: LayoutDashboard, path: "/" },
   { label: "Add Course", icon: PlusCircle, path: "/addcourse" },
   { label: "Courses", icon: ListChecks, path: "/listcourse" },
   {
     label: "Analytics",
     icon: ChartSpline,
     path: "/AnalyticsDashboard",
   },
   { label: "Bookings", icon: ShoppingBag, path: "/bookings" },
   { label: "Users", icon: Users, path: "/userspage" },
 ];

  return (
    <div className="flex min-h-screen bg-[#05060a] text-white">
      {/* ════════════ SIDEBAR ════════════ */}
      <aside
        className={`
          fixed left-0 top-0 h-full z-40
          border-r border-white/10
          bg-[#0b0f1a]/80 backdrop-blur-xl
          transition-all duration-300
          ${collapsed ? "w-20" : "w-72"}
        `}
      >
        {/* LOGO */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src={logo} className="h-9 w-9 rounded-lg" alt="logo" />
            {!collapsed && (
              <div>
                <h1 className="font-bold flex items-center gap-1">
                  SkillForge <Sparkles size={14} className="text-cyan-400" />
                </h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* NAV LINKS */}
        <nav className="mt-4 px-2 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200 relative
                  ${
                    active
                      ? "bg-cyan-500/10 text-cyan-300"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
                {active && (
                  <span className="absolute right-2 w-1.5 h-6 bg-cyan-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Sidebar: Admin Info + Logout (expanded) ── */}
        {!collapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              {/* ← Live avatar here */}
              <AdminAvatar admin={admin} size="md" />
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">
                  {adminName}
                </p>
                <p className="text-xs text-gray-400 truncate">{adminEmail}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <LogOut size={16} />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}

        {/* ── Sidebar: Logout only (collapsed) ── */}
        {collapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10 flex justify-center">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}

        {/* COLLAPSE TOGGLE */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -right-3 -translate-y-1/2 bg-[#0b0f1a] border border-white/10 rounded-full p-2 shadow-lg hover:bg-white/10 transition z-50"
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
      </aside>

      {/* ════════════ MAIN AREA ════════════ */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-72"
        }`}
      >
        {/* TOP BAR */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#0b0f1a]/60 backdrop-blur-xl sticky top-0 z-30">
          <h2 className="font-semibold text-white/90">
            {nav.find((n) => n.path === location.pathname)?.label ||
              "Dashboard"}
          </h2>

          <div className="flex items-center gap-4">
            {/* NOTIFICATIONS */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                }}
                className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-[#0f172a] border border-white/10 rounded-xl shadow-xl z-[999] overflow-hidden">
                  <div className="flex items-center justify-between p-3 border-b border-white/10">
                    <span className="text-sm font-medium">Notifications</span>
                    <button
                      onClick={markAllRead}
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      Mark All Read
                    </button>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-sm text-gray-400">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className="p-3 border-b border-white/10 hover:bg-white/5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-2">
                                {new Date(
                                  notification.createdAt,
                                ).toLocaleString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 border-t border-white/10">
                    <Link
                      to="/Notifications"
                      onClick={() => setNotifOpen(false)}
                      className="w-full flex items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 py-2 text-sm font-medium transition-colors"
                    >
                      View All Notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                {/* ← Live avatar here */}
                <AdminAvatar admin={admin} size="sm" />
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium leading-none">
                    {adminName}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {adminRole}
                  </p>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[#0f172a] border border-white/10 rounded-xl shadow-xl z-[999] overflow-hidden">
                  {/* Dropdown header with avatar */}
                  <div className="p-3 border-b border-white/10 flex items-center gap-3">
                    <AdminAvatar admin={admin} size="lg" />
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">
                        {adminName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {adminEmail}
                      </p>
                      <span className="mt-1 inline-block text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full capitalize">
                        {adminRole}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/admin/profile");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 text-sm transition-colors"
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-500/10 text-sm text-red-400 transition-colors disabled:opacity-50"
                  >
                    <LogOut size={16} />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
