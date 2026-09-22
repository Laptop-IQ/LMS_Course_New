import Rating from "../models/rating.model.js";
import Course from "../models/courseModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createNotification } from "../utils/createNotification.js";

/* =========================================================
   ADD / UPDATE RATING
========================================================= */

export const addOrUpdateRating = asyncHandler(async (req, res) => {
  const io = req.app.get("io");

  const { courseId, rating, comment } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!courseId || !rating) {
    return res.status(400).json({
      success: false,
      message: "courseId and rating are required",
    });
  }

  const numericRating = Number(rating);

  if (numericRating < 1 || numericRating > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be between 1 and 5",
    });
  }

  // =========================================
  // GET COURSE
  // =========================================

  const course = await Course.findById(courseId);

  if (!course) {
    return res
      .status(404)
      .json({ success: false, message: "Course not found" });
  }

  // =========================================
  // CHECK EXISTING
  // =========================================

  let existing = await Rating.findOne({ course: courseId, user: userId });
  let isNewRating = false;

  if (existing) {
    existing.rating = numericRating;
    existing.comment = comment || existing.comment;
    existing.isDeleted = false;
    await existing.save();
  } else {
    isNewRating = true;
    await Rating.create({
      course: courseId,
      user: userId,
      rating: numericRating,
      comment: comment || "",
      isDeleted: false,
    });
  }

  // =========================================
  // RECALCULATE AVG
  // =========================================

  const ratings = await Rating.find({ course: courseId, isDeleted: false });
  const totalRatings = ratings.length;
  const avgRating =
    totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

  await Course.findByIdAndUpdate(courseId, { avgRating, totalRatings });

  // =========================================
  // NOTIFICATION TO INSTRUCTOR
  // =========================================

  if (course.instructor && course.instructor.toString() !== userId.toString()) {
  await createNotification({
    io,
    userId: course.instructor,
    type: "rating",
    title: isNewRating ? "New Course Rating" : "Course Rating Updated",
    message: `${req.user?.name || "Someone"} rated "${course.title}" ${numericRating} stars`,
    metadata: {
      courseId: course._id,
      rating: numericRating,
      studentId: userId,
      senderName: req.user?.name || null, // ✅ ADD
      userId: userId, // ✅ ADD
    },
  });
  }

  // =========================================
  // NOTIFICATION TO ADMIN
  // =========================================

 await createNotification({
   io,
   userId: null,
   targetRole: "admin",
   type: "rating",
   title: isNewRating ? "New Course Rating" : "Rating Updated",
   message: `${req.user?.name || "Someone"} rated "${course.title}" ${numericRating}⭐`,
   metadata: {
     courseId: course._id,
     rating: numericRating,
     studentId: userId,
     senderName: req.user?.name || null, // ✅ ADD
     userId: userId, // ✅ ADD
     email: req.user?.email || null, // ✅ ADD
   },
 });

  // =========================================
  // RESPONSE
  // =========================================

  return res.status(200).json({
    success: true,
    message: "Rating saved successfully",
    avgRating,
    totalRatings,
  });
});

/* =========================================================
   GET MY RATINGS
========================================================= */

export const getMyRatings = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const ratings = await Rating.find({ user: userId, isDeleted: false });

  const map = {};
  ratings.forEach((r) => {
    map[r.course] = r.rating;
  });

  return res.status(200).json({
    success: true,
    ratings: map,
  });
});
