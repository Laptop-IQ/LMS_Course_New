import express from "express";
import multer from "multer";
import path from "path";

import {
  addResource,
  getResourcesByCourse,
  deleteResource,
} from "../controllers/resourceController.js";

const router = express.Router();

/* =========================================================
   MULTER CONFIG
========================================================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads/resources"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `resource-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

/* =========================================================
   ROUTES (AUTH REMOVED FOR NOW)
========================================================= */

// ADD RESOURCE
router.post("/", upload.single("file"), addResource);

// GET RESOURCES BY COURSE
router.get("/:courseId", getResourcesByCourse);

// DELETE RESOURCE
router.delete("/:id", deleteResource);

export default router;
