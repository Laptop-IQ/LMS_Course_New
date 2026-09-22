import API from "./adminApi";

export const adminAuthService = {
  signup: (data) => API.post("/api/admin/auth/signup", data),

  verifySignupOTP: (data) => API.post("/api/admin/auth/verify-otp", data),

  login: (data) => API.post("/api/admin/auth/login", data),

  verifyLoginOTP: (data) => API.post("/api/admin/auth/verify-login-otp", data),

  resendOTP: (data) => API.post("/api/admin/auth/resend-otp", data),

  forgotPassword: (data) => API.post("/api/admin/auth/forgot-password", data),

  verifyResetOTP: (data) => API.post("/api/admin/auth/verify-reset-otp", data),

  resetPassword: (data) => API.post("/api/admin/auth/reset-password", data),

  logout: () => API.post("/api/admin/auth/logout"),

  getProfile: () => API.get("/api/admin/auth/me"),
};
