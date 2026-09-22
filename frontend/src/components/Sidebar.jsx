import React, { useState, useEffect, useCallback, useRef } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { useNotifications } from "@/context/NotificationContext";
import { useSidebar } from "@/context/SidebarContext";
import {
  Home,
  BookOpen,
  BookOpenText,
  BookMarked,
  Users,
  Contact,
  Bell,
  User,
  LogOut,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  Settings,
  LayoutDashboard,
  Menu,
  BookText,
  X,
  ChevronDown,
  GraduationCap,
  Zap,
  TrendingUp,
  Clock,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { TOKEN_KEY } from "@/constants/auth";

/* ------------------------------------------------ */
/* NAV ITEMS                                        */
/* ------------------------------------------------ */
const sidebarNav = [
  {
    section: "Learning",
    items: [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        href: "/userdashboard",
        badge: null,
      },
      {
        name: "My Courses",
        icon: BookOpenText,
        href: "/mycoursespage",
        badge: "New",
      },
      {
        name: "Browse Courses",
        icon: BookOpen,
        href: "/coursespage",
        badge: null,
      },
      {
        name: "Top Selling Courses",
        icon: BookText,
        href: "/homecoures",
        badge: null,
      },
    ],
  },

  {
    section: "Account",
    items: [{ name: "Profile", icon: User, href: "/profile", badge: null }],
  },

  {
    section: "Explore",
    items: [
      { name: "Contact", icon: Contact, href: "/contactpage", badge: null },
    ],
  },
];

const allNavItems = sidebarNav.flatMap((s) => s.items);

/* ------------------------------------------------ */
/* SIDEBAR                                          */
/* ------------------------------------------------ */
const Sidebar = () => {
  const { collapsed, setCollapsed } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = () => setUser(JSON.parse(localStorage.getItem("user")));
    load();
    window.addEventListener("userUpdated", load);
    return () => window.removeEventListener("userUpdated", load);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".notif-dropdown")) setNotifOpen(false);
      if (!e.target.closest(".profile-dropdown")) setProfileOpen(false);
      if (!e.target.closest(".search-box")) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const logoutHandler = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    setMobileOpen(false);
    navigate("/", { replace: true });
  }, [navigate]);

  const filteredSearch = searchQuery.trim()
    ? allNavItems.filter((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const currentPage = allNavItems.find((n) =>
    n.href === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(n.href),
  );

  /* ---- Active link class ---- */
  const navLinkClass = ({ isActive }) => `
    group relative flex items-center gap-3
    rounded-xl px-3 py-2.5
    text-sm font-medium
    transition-all duration-200
    ${
      isActive
        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/20"
        : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
    }
    ${collapsed ? "justify-center px-2.5" : ""}
  `;

  /* ======================================================= */
  /* SIDEBAR INNER                                           */
  /* ======================================================= */
  const SidebarInner = ({ isMobile = false }) => (
    <div
      className={`
      relative flex flex-col h-full overflow-visible
      transition-all duration-300
      ${!isMobile ? (collapsed ? "w-[72px]" : "w-[272px]") : "w-[272px]"}
    `}
      style={{
        background:
          "linear-gradient(180deg, #080d1a 0%, #060b14 60%, #050910 100%)",
      }}
    >
     

      {/* ---- glow blobs ---- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-16 h-72 w-72 rounded-full bg-cyan-500/[0.07] blur-3xl" />
        <div className="absolute top-1/2 -right-20 h-56 w-56 rounded-full bg-blue-600/[0.06] blur-3xl" />
        <div className="absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-indigo-500/[0.06] blur-3xl" />
      </div>

      {/* ---- border right accent ---- */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />

      {/* ======== LOGO ======== */}
      <div
        className={`
        relative flex items-center h-[64px] shrink-0
        border-b border-white/[0.06]
        ${collapsed && !isMobile ? "justify-center px-3" : "px-5 gap-3"}
      `}
      >
        {!collapsed || isMobile ? (
          <>
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-lg bg-cyan-500/20 blur-md" />
              <div className="relative h-9 w-9 rounded-lg overflow-hidden ring-1 ring-white/10">
                <img
                  src={logo}
                  className="h-full w-full object-cover"
                  alt="logo"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-[15px]">
                  SkillForge
                </span>
                <Sparkles size={12} className="text-cyan-400 shrink-0" />
              </div>
              <p className="text-[10px] text-slate-500 tracking-wide mt-0.5">
                Learn • Build • Grow
              </p>
            </div>
          </>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-cyan-500/20 blur-md" />
            <div className="relative h-9 w-9 rounded-xl overflow-hidden ring-1 ring-white/10">
              <img
                src={logo}
                className="h-full w-full object-cover"
                alt="logo"
              />
            </div>
          </div>
        )}
      </div>

      {/* ======== NAV LINKS ======== */}
      <nav
        className="relative flex-1 mt-4 px-3 pb-3
        "
      >
        {sidebarNav.map((section) => (
          <div key={section.section} className="mb-2">
            {/* section label */}
            {(!collapsed || isMobile) && (
              <p className="px-2 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600">
                {section.section}
              </p>
            )}
            {collapsed && !isMobile && (
              <div className="mb-1 border-t border-white/[0.06] mx-1" />
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.href);

                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.href === "/"}
                    className={navLinkClass}
                  >
                    <div
                      className={`relative shrink-0 ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"} transition-colors`}
                    >
                      <Icon size={17} />
                      {/* active glow on icon */}
                      {isActive && (
                        <div className="absolute inset-0 blur-sm opacity-60">
                          <Icon size={17} className="text-cyan-400" />
                        </div>
                      )}
                    </div>

                    {(!collapsed || isMobile) && (
                      <>
                        <span className="flex-1 truncate text-[13px]">
                          {item.name}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-bold tracking-wide bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-full px-1.5 py-0.5 shrink-0">
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <span className="w-1 h-4 bg-cyan-400 rounded-full shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                        )}
                      </>
                    )}

                    {/* tooltip when collapsed */}
                    {collapsed && !isMobile && (
                      <span
                        className="
                        absolute left-full ml-4 px-3 py-1.5
                        bg-[#0f172a] border border-white/10
                        text-white text-xs rounded-lg
                        whitespace-nowrap opacity-0 group-hover:opacity-100
                        pointer-events-none transition-all duration-150 z-50
                        shadow-xl translate-x-1 group-hover:translate-x-0
                      "
                      >
                        {item.name}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ======== LOGOUT ======== */}
      <div
        className={`
        relative px-3 pb-14 pt-2 border-t border-white/[0.06] shrink-0
        ${collapsed && !isMobile ? "flex justify-center" : ""}
      `}
      >
        <button
          onClick={logoutHandler}
          className={`
            group relative flex items-center gap-3
            rounded-lg px-3 py-2.5
            text-[13px] font-medium text-slate-500
            hover:bg-red-500/10 hover:text-red-400
            border border-transparent hover:border-red-500/15
            transition-all duration-200
            ${collapsed && !isMobile ? "justify-center w-11 px-0" : "w-full"}
          `}
        >
          <LogOut size={16} className="shrink-0" />
          {(!collapsed || isMobile) && <span>Sign out</span>}
          {collapsed && !isMobile && (
            <span className="absolute left-full ml-4 px-3 py-1.5 bg-[#0f172a] border border-white/10 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 shadow-xl translate-x-1 group-hover:translate-x-0">
              Sign out
            </span>
          )}
        </button>
      </div>

      {/* ======== COLLAPSE BUTTON ======== */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="
            absolute top-1/2 -right-6 -translate-y-1/2
            h-10 w-10
            bg-[#0c1220] border border-white/15
            rounded-full
            shadow-lg shadow-black/40
            hover:border-cyan-500/40 hover:bg-[#0f172a]
            text-slate-500 hover:text-cyan-400
            flex items-center justify-center
            transition-all duration-200 z-50
          "
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
      )}
    </div>
  );

  /* ======================================================= */
  /* TOP BAR                                                 */
  /* ======================================================= */
  const TopBar = () => (
    <header
      className="
        fixed top-0 right-0 z-30 h-[64px]
        flex items-center justify-between px-6
        transition-all duration-300
      "
      style={{
        left: window.innerWidth >= 1024 ? (collapsed ? "72px" : "272px") : 0,
        background:
          "linear-gradient(180deg, rgba(8,13,26,0.95) 0%, rgba(8,13,26,0.80) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* ---- left: breadcrumb ---- */}
      <div className="hidden lg:flex items-center gap-2">
        <GraduationCap size={16} className="text-cyan-500/60" />
        <span className="text-slate-600 text-sm">/</span>
        <span className="text-sm font-semibold text-white/80">
          {currentPage?.name || "Dashboard"}
        </span>
      </div>

      {/* mobile logo */}
      <Link to="/" className="flex items-center gap-2.5 lg:hidden">
        <div className="h-8 w-8 rounded-xl overflow-hidden ring-1 ring-white/10">
          <img src={logo} className="h-full w-full object-cover" alt="logo" />
        </div>
        <span className="font-bold text-white text-sm tracking-tight">
          SkillForge
        </span>
      </Link>

      {/* ---- right: actions ---- */}
      <div className="flex items-center gap-1 ml-auto">
        {/* --- NOTIFICATIONS --- */}
        <div className="relative notif-dropdown">
          <button
            onClick={() => {
              setNotifOpen((p) => !p);
              setProfileOpen(false);
            }}
            className={`
              relative flex items-center justify-center
              h-9 w-9 rounded-lg
              transition-all duration-200
              ${
                notifOpen
                  ? "bg-cyan-500/15 border border-cyan-500/25 text-cyan-400"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10"
              }
            `}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span
                className="
                absolute -top-0.5 -right-0.5
                h-4 w-4 min-w-[16px]
                rounded-full bg-red-500
                text-[9px] text-white font-bold
                flex items-center justify-center
                shadow-lg shadow-red-500/30
              "
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="
              absolute right-0 mt-2 w-[340px]
              rounded-lg border border-white/10
              shadow-lg shadow-black/60 z-[999]
              overflow-hidden
            "
              style={{
                background: "linear-gradient(180deg, #0f172a 0%, #0c1220 100%)",
              }}
            >
              {/* header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.07]">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-cyan-400" />
                  <span className="text-sm font-semibold text-white">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-cyan-500/20">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <Link
                  to="/Notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                >
                  View all →
                </Link>
              </div>

              <div
                className="max-h-[320px] overflow-y-auto
                [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-white/10"
              >
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                      <Bell size={18} className="text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-500">
                      You're all caught up!
                    </p>
                  </div>
                ) : (
                  notifications.slice(0, 7).map((n, i) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        if (!n.read) markAsRead(n._id);
                      }}
                      className={`
                        cursor-pointer px-4 py-3.5
                        border-b border-white/[0.04]
                        hover:bg-white/[0.04] transition-colors
                        ${!n.read ? "bg-cyan-500/[0.03]" : ""}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${!n.read ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" : "bg-slate-600"}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-semibold ${!n.read ? "text-white" : "text-slate-400"}`}
                          >
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* divider */}
        <div className="h-5 w-px bg-white/[0.08] mx-1" />

        {/* --- PROFILE --- */}
        <div className="relative profile-dropdown">
          <button
            onClick={() => {
              setProfileOpen((p) => !p);
              setNotifOpen(false);
            }}
            className={`
              flex items-center gap-2.5 pl-1 pr-3 py-1
              rounded-lg transition-all duration-200
              ${
                profileOpen
                  ? "bg-white/[0.07] border border-white/15"
                  : "hover:bg-white/[0.05] border border-transparent hover:border-white/10"
              }
            `}
          >
            <div className="relative">
              <div className="h-8 w-8 overflow-hidden rounded-lg ring-1 ring-white/10">
                <img
                  src={
                    user?.profilePic ||
                    user?.avatar ||
                    "https://i.pravatar.cc/300"
                  }
                  alt="profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-lg bg-emerald-400 ring-2 ring-[#080d1a]" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[12px] font-semibold text-white leading-tight">
                {user?.username || "Student"}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                Premium
              </p>
            </div>
            <ChevronDown
              size={13}
              className={`text-slate-500 transition-transform duration-200 hidden sm:block ${profileOpen ? "rotate-180" : ""}`}
            />
          </button>

          {profileOpen && (
            <div
              className="
              absolute right-0 mt-2 w-[220px]
              rounded-lg border border-white/10
              shadow-2xl shadow-black/60 z-[999]
              overflow-hidden
            "
              style={{
                background: "linear-gradient(180deg, #0f172a 0%, #0c1220 100%)",
              }}
            >
              {/* user info */}
              <div className="px-4 py-4 border-b border-white/[0.07]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-lg ring-1 ring-white/10 shrink-0">
                    <img
                      src={
                        user?.profilePic ||
                        user?.avatar ||
                        "https://i.pravatar.cc/300"
                      }
                      alt="profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {user?.username || "Student"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {user?.email || "student@example.com"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/15 rounded-lg px-2.5 py-1.5">
                  <Zap size={11} className="text-amber-400 shrink-0" />
                  <span className="text-[11px] text-amber-400/90 font-medium">
                    Premium Member
                  </span>
                </div>
              </div>

              {/* menu items */}
              <div className="p-1.5">
                {[
                  { icon: User, label: "Profile", href: "/profile" },
                  { icon: Clock, label: "My courses", href: "/mycourses" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.05] text-[13px] text-slate-400 hover:text-white transition-colors"
                    >
                      <Icon size={14} className="shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="p-1.5 pt-0 border-t border-white/[0.06] mt-1">
                <button
                  onClick={logoutHandler}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-[13px] text-red-400/80 hover:text-red-400 transition-colors"
                >
                  <LogOut size={14} className="shrink-0" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* mobile menu toggle */}
        <button
          onClick={() => setMobileOpen((p) => !p)}
          className="lg:hidden ml-1 h-9 w-9 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/10 text-slate-400 hover:text-white transition-colors"
        >
          {mobileOpen ? <X size={17} /> : <Menu size={17} />}
        </button>
      </div>
    </header>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`
        hidden lg:flex flex-col fixed left-0 top-0 h-full z-40
        transition-all duration-300
        ${collapsed ? "w-[72px]" : "w-[272px]"}
      `}
      >
        <SidebarInner />
      </aside>

      {/* TOP BAR */}
      <TopBar />

      {/* MOBILE DRAWER */}
      <div
        className={`
        fixed inset-0 z-50 lg:hidden
        transition-all duration-300
        ${mobileOpen ? "visible opacity-100" : "invisible opacity-0"}
      `}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />
        <aside
          className={`
          absolute left-0 top-0 h-full
          transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <SidebarInner isMobile />
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
