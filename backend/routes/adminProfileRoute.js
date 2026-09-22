import express from "express";

import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  deleteAdminAccount,
  updateAdminProfilePhoto,
  removeAdminProfilePhoto,
  getAdminStats,
  getPublicFaculty, // ← new
} from "../controllers/adminProfileController.js";

import { protectAdmin } from "../middleware/adminAuth.middleware.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

/* ── Public (no auth) ─────────────────────────── */
router.get("/faculty", getPublicFaculty); // GET /api/admin/profile/faculty

/* ── Protected (admin only) ───────────────────── */
router.get("/", protectAdmin, getAdminProfile);
router.get("/stats", protectAdmin, getAdminStats);
router.put("/update", protectAdmin, updateAdminProfile);
router.put("/change-password", protectAdmin, changeAdminPassword);
router.post(
  "/photo",
  protectAdmin,
  upload.single("profilePic"),
  updateAdminProfilePhoto,
);
router.delete("/photo", protectAdmin, removeAdminProfilePhoto);
router.delete("/delete", protectAdmin, deleteAdminAccount);

export default router;
