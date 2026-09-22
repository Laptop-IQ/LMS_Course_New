import express from "express";
import {
  adminSignup,
  verifySignupOTP,
  adminLogin,
  verifyLoginOTP,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  changePassword,
  refreshAccessToken,
  adminLogout,
  getAdminProfile,
} from "../controllers/adminAuth.controller.js";

import { protectAdmin } from "../middleware/adminAuth.middleware.js";

const router = express.Router();

/* =======================================================
   PUBLIC ROUTES  (no auth required)
======================================================= */

// Signup
router.post("/signup", adminSignup);
router.post("/verify-otp", verifySignupOTP);

// Login (2-step)
router.post("/login", adminLogin);
router.post("/verify-login-otp", verifyLoginOTP);

// OTP
router.post("/resend-otp", resendOTP);

// Forgot / Reset password
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

// Token
router.post("/refresh-token", refreshAccessToken);

/* =======================================================
   PROTECTED ROUTES  (JWT required)
======================================================= */
router.use(protectAdmin); // everything below requires valid JWT

router.get("/me", getAdminProfile);
router.post("/change-password", changePassword);
router.post("/logout", adminLogout);

export default router;
