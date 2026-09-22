import express from "express";

import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  toggleLike,
} from "../controllers/commentController.js";

import { isAuthenticated } from "../middleware/userAuthenticated.js";
import { optionalAuth } from "../middleware/optionalAuth.js";

const router = express.Router();

// Public + User/Admin token support
router.get("/:courseId", optionalAuth, getComments);

router.post("/", isAuthenticated, addComment);
router.put("/:id", isAuthenticated, updateComment);
router.delete("/:id", isAuthenticated, deleteComment);
router.put("/like/:id", isAuthenticated, toggleLike);

export default router;
