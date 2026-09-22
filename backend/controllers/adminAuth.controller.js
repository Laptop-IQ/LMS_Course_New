import Admin from "../models/Admin.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/adminJwt.js";
import { sendOTPEmail } from "../utils/sendEmail.js";

/* =======================================================
   HELPER — send token response
======================================================= */
const sendTokenResponse = async (admin, res, statusCode = 200) => {
  const accessToken = generateAccessToken(admin);
  const refreshToken = generateRefreshToken(admin);

  // Save refresh token in DB
  admin.refreshToken = refreshToken;
  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
};

/* =======================================================
   1. SIGNUP
   POST /api/admin/auth/signup
======================================================= */
export const adminSignup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin with this email already exists.",
      });
    }

    const admin = await Admin.create({ name, email, password, role });

    // Generate OTP for email verification
    const otp = admin.generateOTP();
    await admin.save({ validateBeforeSave: false });

    await sendOTPEmail({
      to: email,
      otp,
      subject: "Verify your Admin Account",
      purpose: "verify",
    });

    res.status(201).json({
      success: true,
      message: "Admin registered. OTP sent to email for verification.",
      adminId: admin._id,
    });
  } catch (err) {
    console.error("adminSignup error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* =======================================================
   2. VERIFY SIGNUP OTP
   POST /api/admin/auth/verify-otp
======================================================= */
export const verifySignupOTP = async (req, res) => {
  try {
    const { adminId, otp } = req.body;

    if (!adminId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Admin ID and OTP are required.",
      });
    }

    const admin = await Admin.findById(adminId).select("+otp +otpExpiry");

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    if (!admin.isOTPValid(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    admin.clearOTP();
    admin.otpVerified = true;
    await admin.save({ validateBeforeSave: false });

    await sendTokenResponse(admin, res, 200);
  } catch (err) {
    console.error("verifySignupOTP error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* =======================================================
   3. LOGIN
   POST /api/admin/auth/login
======================================================= */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Contact superadmin.",
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Send OTP for 2-step login verification
    const otp = admin.generateOTP();
    await admin.save({ validateBeforeSave: false });

    await sendOTPEmail({
      to: admin.email,
      otp,
      subject: "Admin Login OTP",
      purpose: "login",
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to registered email. Please verify to complete login.",
      adminId: admin._id,
    });
  } catch (err) {
    console.error("adminLogin error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* =======================================================
   4. VERIFY LOGIN OTP
   POST /api/admin/auth/verify-login-otp
======================================================= */
export const verifyLoginOTP = async (req, res) => {
  try {
    const { adminId, otp } = req.body;

    if (!adminId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Admin ID and OTP are required.",
      });
    }

    const admin = await Admin.findById(adminId).select("+otp +otpExpiry");

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    if (!admin.isOTPValid(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    admin.clearOTP();
    await admin.save({ validateBeforeSave: false });

    await sendTokenResponse(admin, res, 200);
  } catch (err) {
    console.error("verifyLoginOTP error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* =======================================================
   5. RESEND OTP
   POST /api/admin/auth/resend-otp
======================================================= */
export const resendOTP = async (req, res) => {
  try {
    const { adminId, purpose } = req.body; // purpose: "verify" | "login" | "reset"

    if (!adminId) {
      return res.status(400).json({ success: false, message: "Admin ID is required." });
    }

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    const otp = admin.generateOTP();
    await admin.save({ validateBeforeSave: false });

    await sendOTPEmail({
      to: admin.email,
      otp,
      subject: "Resend OTP",
      purpose: purpose || "verify",
    });

    res.status(200).json({
      success: true,
      message: "OTP resent successfully.",
    });
  } catch (err) {
    console.error("resendOTP error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* =======================================================
   6. FORGOT PASSWORD
   POST /api/admin/auth/forgot-password
======================================================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const admin = await Admin.findOne({ email });

    // Always respond the same to prevent email enumeration
    if (!admin) {
      return res.status(200).json({
        success: true,
        message: "If this email exists, an OTP has been sent.",
      });
    }

    const otp = admin.generateOTP();
    await admin.save({ validateBeforeSave: false });

    await sendOTPEmail({
      to: admin.email,
      otp,
      subject: "Admin Password Reset OTP",
      purpose: "reset",
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to email for password reset.",
      adminId: admin._id,
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* =======================================================
   7. VERIFY FORGOT PASSWORD OTP
   POST /api/admin/auth/verify-reset-otp
======================================================= */
export const verifyResetOTP = async (req, res) => {
  try {
    const { adminId, otp } = req.body;

    if (!adminId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Admin ID and OTP are required.",
      });
    }

    const admin = await Admin.findById(adminId).select("+otp +otpExpiry");

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    if (!admin.isOTPValid(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    // Mark OTP verified but don't clear yet (needed for reset step)
    admin.otpVerified = true;
    await admin.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "OTP verified. You can now reset your password.",
      adminId: admin._id,
    });
  } catch (err) {
    console.error("verifyResetOTP error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* =======================================================
   8. RESET PASSWORD
   POST /api/admin/auth/reset-password
======================================================= */
export const resetPassword = async (req, res) => {
  try {
    const { adminId, newPassword, confirmPassword } = req.body;

    if (!adminId || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const admin = await Admin.findById(adminId).select("+otp +otpExpiry");

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    if (!admin.otpVerified) {
      return res.status(403).json({
        success: false,
        message: "OTP not verified. Please verify OTP first.",
      });
    }

    admin.password = newPassword; // pre-save hook will hash it
    admin.clearOTP();
    admin.otpVerified = false;
    admin.refreshToken = undefined;

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. Please log in.",
    });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* =======================================================
   9. CHANGE PASSWORD  (logged-in admin)
   POST /api/admin/auth/change-password
======================================================= */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    const admin = await Admin.findById(req.admin._id).select("+password");

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* =======================================================
   10. REFRESH TOKEN
   POST /api/admin/auth/refresh-token
======================================================= */
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: "Refresh token required." });
    }

    const decoded = verifyRefreshToken(refreshToken);

    const admin = await Admin.findById(decoded.id).select("+refreshToken");

    if (!admin || admin.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
    }

    const newAccessToken = generateAccessToken(admin);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Refresh token expired or invalid. Please log in again.",
    });
  }
};

/* =======================================================
   11. LOGOUT
   POST /api/admin/auth/logout
======================================================= */
export const adminLogout = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    admin.refreshToken = undefined;
    await admin.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    console.error("adminLogout error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* =======================================================
   12. GET PROFILE  (logged-in admin)
   GET /api/admin/auth/me
======================================================= */
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    res.status(200).json({ success: true, admin });
  } catch (err) {
    console.error("getAdminProfile error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
