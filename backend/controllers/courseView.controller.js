// controllers/courseView.controller.js
import Course from "../models/courseModel.js";
import { StudyLog } from "../models/progressModel.js";
import { CourseView } from "../models/courseViewModel.js";
import asyncHandler from "../utils/asyncHandler.js";

export const addCourseView = asyncHandler(async (req, res) => {
  const courseId = req.params.id;

  // 1. Course ka total views counter increment karo
  const updated = await Course.findByIdAndUpdate(
    courseId,
    { $inc: { views: 1 } },
    { new: true },
  );

  if (!updated) {
    return res
      .status(404)
      .json({ success: false, message: "Course not found" });
  }

  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  // 2. CourseView model mein daily record save karo (chart ke liye)
  await CourseView.create({
    courseId,
    date: today,
    userId: req.user?.id || null,
  });

  // 3. StudyLog mein session count karo (agar logged in hai)
  if (req.user?.id) {
    await StudyLog.findOneAndUpdate(
      { userId: req.user.id, date: today },
      { $inc: { sessionsCount: 1 } },
      { upsert: true, new: true },
    );
  }

  return res.json({ success: true, views: updated.views });
});
