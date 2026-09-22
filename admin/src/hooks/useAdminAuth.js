import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminAuthService } from "../api/adminAuth.service";

export const useAdminAuth = () => {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser")) || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clearError = () => setError("");

  // ── Save tokens + user after login/signup ─────────────
  const saveSession = (data) => {
    localStorage.setItem("adminAccessToken", data.accessToken);
    localStorage.setItem("adminRefreshToken", data.refreshToken);
    localStorage.setItem("adminUser", JSON.stringify(data.admin));
    setAdmin(data.admin);
  };

  // ── SIGNUP ────────────────────────────────────────────
  const signup = async (formData) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await adminAuthService.signup(formData);
      return { success: true, adminId: data.adminId };
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed.";
      setError(msg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ── VERIFY SIGNUP OTP ─────────────────────────────────
  const verifySignupOTP = async (adminId, otp) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await adminAuthService.verifySignupOTP({ adminId, otp });
      saveSession(data);
      navigate("/admin/dashboard");
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ── LOGIN ─────────────────────────────────────────────
  const login = async (formData) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await adminAuthService.login(formData);
      return { success: true, adminId: data.adminId };
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ── VERIFY LOGIN OTP ──────────────────────────────────
  const verifyLoginOTP = async (adminId, otp) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await adminAuthService.verifyLoginOTP({ adminId, otp });
      saveSession(data);
      navigate("/admin/dashboard");
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ── RESEND OTP ────────────────────────────────────────
  const resendOTP = async (adminId, purpose) => {
    setLoading(true);
    setError("");
    try {
      await adminAuthService.resendOTP({ adminId, purpose });
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ── FORGOT PASSWORD ───────────────────────────────────
  const forgotPassword = async (email) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await adminAuthService.forgotPassword({ email });
      return { success: true, adminId: data.adminId };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ── VERIFY RESET OTP ──────────────────────────────────
  const verifyResetOTP = async (adminId, otp) => {
    setLoading(true);
    setError("");
    try {
      await adminAuthService.verifyResetOTP({ adminId, otp });
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ── RESET PASSWORD ────────────────────────────────────
  const resetPassword = async (adminId, newPassword, confirmPassword) => {
    setLoading(true);
    setError("");
    try {
      await adminAuthService.resetPassword({ adminId, newPassword, confirmPassword });
      navigate("/admin/login");
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ── LOGOUT ────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await adminAuthService.logout();
    } catch {}
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("adminUser");
    setAdmin(null);
    navigate("/admin/login");
  }, [navigate]);

  const isAuthenticated = !!admin;

  return {
    admin,
    loading,
    error,
    clearError,
    isAuthenticated,
    signup,
    verifySignupOTP,
    login,
    verifyLoginOTP,
    resendOTP,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    logout,
  };
};
