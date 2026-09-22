import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            success: false,
            message: "Token expired, please login again",
          });
        }

        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

     const user = await User.findById(decoded.id).select(
       "username avatar email role",
     );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // 🔥 normalize user object (VERY IMPORTANT)
req.user = {
  id: user._id, // ✅ ADD THIS
  _id: user._id,
  name: user.username || user.fullName || user.email.split("@")[0],
  email: user.email,
  avatar: user.avatar,
  role: user.role,
};

      req.userId = user._id;

      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
