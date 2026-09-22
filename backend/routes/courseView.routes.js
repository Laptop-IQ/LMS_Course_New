import express from "express";
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  getPublicCourses,
} from "../controllers/courseController.js";

import { addCourseView } from "../controllers/courseView.controller.js";

const courseRouter = express.Router();

/* PUBLIC */
courseRouter.get("/public", getPublicCourses);
courseRouter.get("/", getCourses);
courseRouter.get("/:id", getCourseById);

/* ✅ FIX: VIEW ROUTE */
courseRouter.post("/:id/view", addCourseView);

/* ADMIN */
courseRouter.post("/", createCourse);
courseRouter.delete("/:id", deleteCourse);

export default courseRouter;
