import CourseResource from "../models/courseResourceModel.js";
import path from "path";
import fs from "fs";

/* =========================================================
   ADD RESOURCE (ADMIN)
========================================================= */
export const addResource = async (req, res) => {
  try {
    const { courseId, lectureId, title, type, url } = req.body;

    if (!courseId || !title || !type) {
      return res.status(400).json({
        success: false,
        error: "courseId, title, type are required",
      });
    }

    let finalUrl = url;

    // file upload support
    if (req.file) {
      finalUrl = `/uploads/resources/${req.file.filename}`;
    }

    const resource = await CourseResource.create({
      courseId,
      lectureId: lectureId || null,
      title,
      type,
      url: finalUrl,
      fileName: req.file ? req.file.originalname : null,
    });

    return res.status(201).json({
      success: true,
      resource,
    });
  } catch (err) {
    console.error("addResource error:", err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

/* =========================================================
   GET RESOURCES BY COURSE
========================================================= */
export const getResourcesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        error: "courseId is required",
      });
    }

    const resources = await CourseResource.find({ courseId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      resources,
    });
  } catch (err) {
    console.error("getResourcesByCourse error:", err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

/* =========================================================
   DELETE RESOURCE
========================================================= */
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await CourseResource.findById(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: "Resource not found",
      });
    }

    // delete local file if exists
    if (resource.url && resource.url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), resource.url);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await resource.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (err) {
    console.error("deleteResource error:", err);
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
