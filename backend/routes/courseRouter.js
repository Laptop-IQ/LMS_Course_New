// routes/courseRoutes.js
import express from "express";
import multer from "multer";
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  getPublicCourses,
  updateCourse,
  publishCourse,
} from "../controllers/courseController.js";
import { addCourseView } from "../controllers/courseView.controller.js";
import { getMyRatings } from "../controllers/rating.controller.js";
import { isAuthenticated } from "../middleware/userAuthenticated.js";

// ── memoryStorage — file goes to buffer, not disk ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files allowed"), false);
    }
    cb(null, true);
  },
});

const courseRouter = express.Router();

courseRouter.get("/public", getPublicCourses);
courseRouter.get("/", getCourses);
courseRouter.get("/my-ratings", isAuthenticated, getMyRatings);
courseRouter.post("/:id/view", isAuthenticated, addCourseView);
courseRouter.get("/:id", getCourseById);
courseRouter.patch("/:id/publish", publishCourse);
courseRouter.put("/:id", upload.single("image"), updateCourse);
courseRouter.post("/", upload.single("image"), createCourse);
courseRouter.delete("/:id", deleteCourse);

export default courseRouter;
