// routes/studyLogRoutes.js
import express from "express";
import {
  logStudySession,
  getMyStudyTime,
} from "../controllers/studyLogController.js";
import { isAuthenticated } from "../middleware/userAuthenticated.js"; // ← user middleware, admin nahi

const router = express.Router();

// POST /api/study-log  — video player se call hota hai (user logged in hona chahiye)
router.post("/", isAuthenticated, logStudySession);

// GET /api/study-log/me?courseId=xxx
router.get("/me", isAuthenticated, getMyStudyTime);

export default router;
