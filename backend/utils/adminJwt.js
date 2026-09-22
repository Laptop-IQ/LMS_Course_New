import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.ADMIN_ACCESS_SECRET || "admin_access_secret";
const REFRESH_SECRET = process.env.ADMIN_REFRESH_SECRET || "admin_refresh_secret";

const ACCESS_EXPIRY = "15m";   // short-lived
const REFRESH_EXPIRY = "7d";   // long-lived

/* =======================================================
   GENERATE TOKENS
======================================================= */

export const generateAccessToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      type: "admin",
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRY }
  );
};

export const generateRefreshToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      type: "admin",
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRY }
  );
};

/* =======================================================
   VERIFY TOKENS
======================================================= */

export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};
