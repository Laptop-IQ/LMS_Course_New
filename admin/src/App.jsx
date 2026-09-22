import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./components/DashboardLayout";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

// Auth Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Dashboard Pages
import Home from "./pages/Home";
import Add from "./pages/Add";
import List from "./pages/List";
import Bookings from "./pages/Bookings";
import UsersPage from "./components/Userspage ";
import NotificationsPage from "./components/NotificationsPage";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import AdminCommentPage from "./pages/AdminCommentPage";
import { NotificationProvider } from "./context/NotificationContext";
import AdminProfilePage from "./pages/AdminProfilePage";


const App = () => {
  return (
    <Routes>
      {/* ================================================
          PUBLIC AUTH ROUTES
      ================================================ */}
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/signup" element={<Signup />} />
      <Route path="/admin/forgot-password" element={<ForgotPassword />} />

      {/* ================================================
          PROTECTED DASHBOARD ROUTES
      ================================================ */}
      <Route
        element={
          <AdminProtectedRoute>
            <NotificationProvider>
              <DashboardLayout />
            </NotificationProvider>
          </AdminProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/addcourse" element={<Add />} />
        <Route path="/listcourse" element={<List />} />
        <Route path="/AnalyticsDashboard" element={<AnalyticsDashboard />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/userspage" element={<UsersPage />} />
        <Route path="/Notifications" element={<NotificationsPage />} />
        <Route path="/admin/comments" element={<AdminCommentPage />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />
      </Route>

      {/* ================================================
          FALLBACK
      ================================================ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
