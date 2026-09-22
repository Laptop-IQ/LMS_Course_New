import express from "express";
import User from "../models/userModel.js";
import {
  changePassword,
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  verification,
  verifyOTP,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/userAuthenticated.js";
import { userSchema, validateUser } from "../validators/userValidate.js";

const router = express.Router();

router.post("/register", validateUser(userSchema), registerUser);
router.post("/verify", verification);
router.post("/login", loginUser);
router.post("/logout", isAuthenticated, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp/:email", verifyOTP);
router.post("/change-password/:email", changePassword);

// GET current logged-in user
router.get("/", isAuthenticated, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }
  res.json({ success: true, user: req.user });
});

// GET all users - admin
router.get("/all", async (req, res) => {
  try {
    const { search, role, isVerified, limit = 200, page = 1 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "all") query.role = role;

    if (isVerified === "true" || isVerified === "false") {
      query.isVerified = isVerified === "true";
    }

    const users = await User.find(query)
      // ✅ FIX: "name" → "name" sahi hai kyunki Course model mein field "name" hai
      //    lekin agar Course model mein "title" use hota hai toh "title" karo
      //    Apne courseModel.js mein check karo: name ya title?
      .populate("enrolledCourses", "name title") // dono bhejo — frontend dono handle karta hai
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select(
        "-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpiry -token",
      );

    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: create user directly
router.post("/admin/create", async (req, res) => {
  try {
    const { username, email, password, phone, role, location } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Username, email and password are required",
        });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.default.hash(password, 10);

    const newUser = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      role: role || "student",
      location: location || "",
      isVerified: true, // admin-created users are pre-verified
    });

    const {
      password: _p,
      otp: _o,
      otpExpiry: _oe,
      token: _t,
      ...safeUser
    } = newUser.toObject();

    return res.status(201).json({ success: true, user: safeUser });
  } catch (err) {
    console.error("admin/create error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE user - admin
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
