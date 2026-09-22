import React, { useEffect, useMemo, useCallback, useState, memo } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  BookMarked,
  BookOpen,
  Contact,
  Home,
  Users,
  User,
  Menu,
  X,
} from "lucide-react";
import { TOKEN_KEY } from "@/constants/auth";

/* ------------------------------------------------ */
/* NAV ITEMS (guest/public) */
/* ------------------------------------------------ */

const baseNav = [
  { name: "Home", icon: Home, href: "/" },
  { name: "Courses", icon: BookOpen, href: "/courses" },
  { name: "About", icon: BookMarked, href: "/about" },
  { name: "Contact", icon: Contact, href: "/contact" },
];

/* ------------------------------------------------ */
/* DESKTOP NAV ITEM */
/* ------------------------------------------------ */

const DesktopNavItem = memo(({ item, navClass }) => {
  const Icon = item.icon;
  return (
    <NavLink to={item.href} className={navClass}>
      <Icon size={17} />
      {item.name}
    </NavLink>
  );
});

/* ------------------------------------------------ */
/* MOBILE NAV ITEM */
/* ------------------------------------------------ */

const MobileNavItem = memo(({ item, setMobileOpen }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.href}
      onClick={() => setMobileOpen(false)}
      className={({ isActive }) => `
        flex items-center gap-3
        rounded-xl px-4 py-4
        transition-all duration-200
        ${
          isActive
            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
            : "text-slate-700 hover:bg-slate-100"
        }
      `}
    >
      <Icon size={18} />
      <span className="font-medium">{item.name}</span>
    </NavLink>
  );
});

/* ------------------------------------------------ */
/* MAIN NAVBAR — only renders when NOT signed in */
/* ------------------------------------------------ */

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* If user is signed-in, this component renders nothing.
     The Sidebar component handles logged-in navigation. */
  const token = useMemo(() => localStorage.getItem(TOKEN_KEY), []);
  const isSignedIn = !!token;

  /* Scroll effect */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Body lock */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /* Desktop nav style */
  const navClass = useCallback(
    ({ isActive }) => `
      relative flex items-center gap-2
      rounded-xl px-4 py-2.5
      text-sm font-semibold
      transition-all duration-300
      ${
        isActive
          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
          : "text-slate-700 hover:bg-slate-100 hover:text-cyan-600"
      }
    `,
    [],
  );

  /* Don't render navbar at all when signed-in — Sidebar takes over */
  if (isSignedIn) return null;

  return (
    <>
      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}
      <nav
        className={`
          fixed left-0 right-0 top-0 z-50
          transition-all duration-300
          ${
            isScrolled
              ? "border-b border-white/10 bg-white/75 shadow-lg shadow-black/5 backdrop-blur-2xl"
              : "bg-transparent"
          }
        `}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-20 items-center justify-between">
            {/* LOGO */}
            <Link to="/" className="group flex items-center gap-3">
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-[2px] shadow-lg shadow-cyan-500/20">
                <div className="rounded-lg bg-white p-1">
                  <img
                    src={logo}
                    alt="SkillForge"
                    loading="eager"
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  SkillForge
                </h1>
                <p className="-mt-1 text-[11px] font-medium tracking-wide text-slate-500">
                  Learn • Build • Grow
                </p>
              </div>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden items-center gap-2 rounded-lg border border-white/20 bg-white/70 p-2 shadow-lg shadow-black/5 backdrop-blur-xl lg:flex">
              {baseNav.map((item) => (
                <DesktopNavItem
                  key={item.name}
                  item={item}
                  navClass={navClass}
                />
              ))}
            </div>

            {/* RIGHT SIDE — Login / Signup */}
            <div className="hidden items-center gap-5 lg:flex">
              <NavLink
                to="/login"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:bg-slate-100"
              >
                Login
              </NavLink>

              <NavLink
                to="/signup"
                className="
                  group relative overflow-hidden rounded-lg
                  bg-gradient-to-r from-cyan-500 to-blue-600
                  px-6 py-3 text-sm font-semibold text-white
                  shadow-lg shadow-cyan-500/20
                  transition-all duration-300
                  hover:scale-105 hover:shadow-cyan-500/40 active:scale-95
                "
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 translate-x-[-100%] bg-white/20 transition-transform duration-700 group-hover:translate-x-[100%]" />
              </NavLink>
            </div>

            {/* MOBILE BUTTON */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white/70 shadow-md backdrop-blur-xl transition-all duration-300 hover:bg-white lg:hidden"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ================================================= */}
      {/* MOBILE MENU */}
      {/* ================================================= */}
      <div
        className={`
          fixed inset-0 z-40 transition-all duration-300 lg:hidden
          ${mobileOpen ? "visible opacity-100" : "invisible opacity-0"}
        `}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        <div
          className={`
            absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col
            border-l border-white/10 bg-white/90 shadow-2xl backdrop-blur-2xl
            transition-transform duration-300
            ${mobileOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          {/* top */}
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <h2 className="text-xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                SkillForge
              </h2>
              <p className="text-sm text-slate-500">Learn smarter.</p>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-xl p-2 hover:bg-slate-100"
            >
              <X size={22} />
            </button>
          </div>

          {/* links */}
          <div className="flex-1 space-y-2 overflow-y-auto p-5">
            {baseNav.map((item) => (
              <MobileNavItem
                key={item.name}
                item={item}
                setMobileOpen={setMobileOpen}
              />
            ))}
          </div>

          {/* bottom */}
          <div className="border-t border-slate-200 p-5">
            <NavLink
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="
                flex w-full items-center justify-center gap-2
                rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600
                px-5 py-4 font-semibold text-white
                shadow-lg shadow-cyan-500/20
              "
            >
              <User size={18} />
              Login / Signup
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
