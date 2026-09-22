import express from "express";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notificationController.js";

import { isAuthenticated } from "../middleware/userAuthenticated.js";

const router = express.Router();

/* ========================================================= */

router.get("/", isAuthenticated, getNotifications);

router.put("/read-all", isAuthenticated, markAllNotificationsRead);

router.put("/:id/read", isAuthenticated, markNotificationRead);

router.delete("/clear", isAuthenticated, clearAllNotifications);

router.delete("/:id", isAuthenticated, deleteNotification);

/* ========================================================= */

export default router;
