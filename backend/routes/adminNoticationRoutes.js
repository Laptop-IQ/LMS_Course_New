import express from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notificationController.js";

import { isAuthenticated } from "../middleware/userAuthenticated.js";
import { protectAdmin } from "../middleware/adminAuth.middleware.js";

const router = express.Router();

// ✅ Admin routes — protectAdmin use karo
router.get("/", protectAdmin, getNotifications);
router.put("/read-all", protectAdmin, markAllNotificationsRead);
router.put("/:id/read", protectAdmin, markNotificationRead);
router.delete("/clear", protectAdmin, clearAllNotifications);
router.delete("/:id", protectAdmin, deleteNotification);

export default router;
