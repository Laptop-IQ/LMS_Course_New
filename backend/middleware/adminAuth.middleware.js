import { verifyAccessToken } from "../utils/adminJwt.js";
import Admin from "../models/Admin.model.js";

/* =======================================================
   PROTECT — verify JWT
======================================================= */
export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Access denied.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    // Ensure token belongs to an admin
    if (decoded.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized as admin.",
      });
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found.",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is deactivated.",
      });
    }

    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

/* =======================================================
   AUTHORIZE — role-based access
   Usage: authorizeAdmin("superadmin")
          authorizeAdmin("superadmin", "admin")
======================================================= */
export const authorizeAdmin = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}.`,
      });
    }
    next();
  };
};
