import express from "express";
import { isAuthenticated } from "../middleware/userAuthenticated.js";
import { protectAdmin } from "../middleware/adminAuth.middleware.js";
import {
  getComments,
  addComment,
  adminReplyToComment,
  updateComment,
  deleteComment,
  toggleLike,
} from "../controllers/adminCommentController.js";

const router = express.Router();

// ── ADMIN ROUTES FIRST (before /:param routes) ───────────────────────
router.post("/admin/:courseId/reply", protectAdmin, adminReplyToComment);
router.put("/admin/:id", protectAdmin, updateComment);
router.delete("/admin/:id", protectAdmin, deleteComment);
router.post("/admin/:id/like", protectAdmin, toggleLike);

// ── STUDENT ROUTES ───────────────────────────────────────────────────
router.get("/:courseId", getComments);
router.post("/", isAuthenticated, addComment);
router.put("/:id", isAuthenticated, updateComment);
router.delete("/:id", isAuthenticated, deleteComment);
router.post("/:id/like", isAuthenticated, toggleLike);

export default router;
