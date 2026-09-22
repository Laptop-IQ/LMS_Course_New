import jwt from "jsonwebtoken";

export const optionalAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.cookies?.adminToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    next();
  }
};
