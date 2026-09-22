import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ArrowUp } from "lucide-react";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Faculty from "./pages/Faculty";
import Courses from "./pages/Courses";
import CourseDetailPageHome from "./pages/CourseDetailPageHome";
import Mycourse from "./pages/Mycourse";
import FAQs from "./pages/FAQs";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import VerifyPaymentPage from "./constants/VerifyPaymentPage";

import Signup from "@/features/auth/Signup";
import Login from "@/features/auth/Login";
import VerifyEmail from "@/features/auth/VerifyEmail";
import Verify from "@/features/auth/Verify";
import ForgotPassword from "@/features/auth/ForgotPassword";
import VerifyOTP from "@/features/auth/VerifyOTP";
import ChangePassword from "@/features/auth/ChangePassword";
import AuthSuccess from "@/features/auth/AuthSuccess";

import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import HomeCourses from "./components/HomeCourses";
import ContactPage from "./components/ContactPage";
import MyCoursesPage from "./components/MyCoursesPage";
import CoursePage from "./components/CoursesPage";
import UserDashboard from "./components/Userdashboard";

/* -------------------------------------------------------------------------- */
/*                               Protected Route                              */
/* -------------------------------------------------------------------------- */

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/* -------------------------------------------------------------------------- */
/*                                 Public Route                               */
/* -------------------------------------------------------------------------- */

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/homecoures" replace />;
  }

  return children;
};

/* -------------------------------------------------------------------------- */
/*                              Auth Route Config                             */
/* -------------------------------------------------------------------------- */

// ✅ FIX: Saare auth/public routes yahan add karo
// Inpe Sidebar aur Navbar DONO nahi dikhenge
const AUTH_ROUTES = [
  "/signup",
  "/login",
  "/verify",
  "/forgot-password",
  "/verify-otp",
  "/change-password",
  "/auth-success", // ✅ FIX: Protected se hataya, auth route mein add kiya
];

const isAuthRoute = (pathname) =>
  AUTH_ROUTES.some((route) => pathname.startsWith(route));

/* -------------------------------------------------------------------------- */
/*                          Sidebar Hidden Route Config                       */
/* -------------------------------------------------------------------------- */

const SIDEBAR_HIDDEN_ROUTES = ["/course/", "/courses/"];

const shouldHideSidebar = (pathname) =>
  SIDEBAR_HIDDEN_ROUTES.some((route) => pathname.startsWith(route));

/* -------------------------------------------------------------------------- */
/*                            Scroll To Top Button                            */
/* -------------------------------------------------------------------------- */

const ScrollTopButton = ({ threshold = 200 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > threshold);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="
        fixed bottom-6 right-6 z-50
        rounded-full border border-white/20
        bg-white/10 p-2 backdrop-blur-sm
        shadow-lg transition-transform hover:scale-105
      "
    >
      <ArrowUp className="h-6 w-6 text-sky-600" />
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/*                         Scroll On Route Change                             */
/* -------------------------------------------------------------------------- */

const ScrollToTopOnRouteChange = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/* -------------------------------------------------------------------------- */
/*                                App Layout                                  */
/* -------------------------------------------------------------------------- */

const AppLayout = ({ children }) => {
  const { pathname } = useLocation();
  const { collapsed } = useSidebar();

  // ✅ FIX: useMemo hataya — seedha check karo taaki har route change pe fresh value mile
  const isSignedIn = Boolean(localStorage.getItem("token"));

  const hideNav = isAuthRoute(pathname);
  const hideSidebar = shouldHideSidebar(pathname);

  // Sidebar sirf tab dikhao jab: auth route nahi, user logged in hai, aur course detail page nahi
  const showSidebar = !hideNav && isSignedIn && !hideSidebar;

  // Navbar sirf tab dikhao jab: auth route nahi aur user logged out hai
  const showNavbar = !hideNav && !isSignedIn;

  return (
    <div className="flex min-h-screen bg-[#05060a]">
      {/* Sidebar */}
      {showSidebar && <Sidebar />}

      {/* Navbar */}
      {showNavbar && <Navbar />}

      {/* Main Content */}
      <main
        className={`
          flex-1 w-full transition-all duration-300
          ${showSidebar ? `pt-16 ${collapsed ? "lg:ml-20" : "lg:ml-72"}` : ""}
          ${showNavbar ? "pt-20" : ""}
        `}
      >
        {children}
      </main>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                    App                                     */
/* -------------------------------------------------------------------------- */

const App = () => {
  const token = localStorage.getItem("token");

  return (
    <SidebarProvider>
      <ScrollToTopOnRouteChange />

      <AppLayout>
        <Routes>
          {/* ---------------------------------------------------------------- */}
          {/*                         ROOT AUTO REDIRECT                       */}
          {/* ---------------------------------------------------------------- */}

          <Route
            path="/"
            element={token ? <Navigate to="/homecoures" replace /> : <Home />}
          />

          {/* ---------------------------------------------------------------- */}
          {/*                              PUBLIC ROUTES                       */}
          {/* ---------------------------------------------------------------- */}

          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/verify/:token" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp/:email" element={<VerifyOTP />} />
          <Route path="/change-password/:email" element={<ChangePassword />} />

          {/* ✅ FIX: auth-success ko protected se hataya — yeh login flow ka hissa hai */}
          <Route path="/auth-success" element={<AuthSuccess />} />

          {/* ---------------------------------------------------------------- */}
          {/*                           PROTECTED ROUTES                       */}
          {/* ---------------------------------------------------------------- */}

          <Route
            path="/homecoures"
            element={
              <ProtectedRoute>
                <HomeCourses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/contactpage"
            element={
              <ProtectedRoute>
                <ContactPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/coursespage"
            element={
              <ProtectedRoute>
                <CoursePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mycourses"
            element={
              <ProtectedRoute>
                <Mycourse />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mycoursespage"
            element={
              <ProtectedRoute>
                <MyCoursesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/userdashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* ---------------------------------------------------------------- */}
          {/*                              COURSE ROUTES                       */}
          {/* ---------------------------------------------------------------- */}

          <Route path="/course/:id" element={<CourseDetailPageHome />} />
          <Route path="/courses/:id" element={<CourseDetailPageHome />} />

          {/* ---------------------------------------------------------------- */}
          {/*                             PAYMENT ROUTES                       */}
          {/* ---------------------------------------------------------------- */}

          <Route path="/booking/success" element={<VerifyPaymentPage />} />
          <Route path="/booking/cancel" element={<VerifyPaymentPage />} />

          {/* ---------------------------------------------------------------- */}
          {/*                              FALLBACK ROUTE                      */}
          {/* ---------------------------------------------------------------- */}

          <Route
            path="*"
            element={<Navigate to={token ? "/homecoures" : "/"} replace />}
          />
        </Routes>
      </AppLayout>

      <ScrollTopButton threshold={250} />
    </SidebarProvider>
  );
};

export default App;
