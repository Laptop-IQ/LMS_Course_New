import express from "express";
import { isAuthenticated } from "../middleware/userAuthenticated.js";
import { protectAdmin } from "../middleware/adminAuth.middleware.js";
import {
  getStudentChatHistory,
  sendStudentMessage,
  getAdminConversations,
  getThreadWithUser,
  sendAdminReply,
  deleteMessage,
  editMessage,
  deleteConversation,
  clearThread,
} from "../controllers/adminChat.controller.js";

const router = express.Router();

/* ─────────────────────────────────────────────────────────
   ADMIN ROUTES
───────────────────────────────────────────────────────── */

// List all conversations
router.get(
  "/admin/conversations/:courseId",
  protectAdmin,
  getAdminConversations,
);

// Get thread with user
router.get("/admin/thread/:courseId/:userId", protectAdmin, getThreadWithUser);

// Send reply
router.post("/admin/reply/:courseId/:userId", protectAdmin, sendAdminReply);

// Full conversation delete
router.delete(
  "/admin/conversation/:courseId/:threadId",
  protectAdmin,
  deleteConversation,
);

// Clear all messages from thread
router.delete(
  "/admin/thread/clear/:courseId/:threadId",
  protectAdmin,
  clearThread,
);

// Delete single message
router.delete("/admin/message/:courseId/:msgId", protectAdmin, deleteMessage);

// Edit single message
router.put("/admin/message/:courseId/:msgId", protectAdmin, editMessage);

/* ─────────────────────────────────────────────────────────
   STUDENT ROUTES
───────────────────────────────────────────────────────── */

// Student chat history
router.get("/:courseId", isAuthenticated, getStudentChatHistory);

// Student send message
router.post("/:courseId", isAuthenticated, sendStudentMessage);

export default router;
