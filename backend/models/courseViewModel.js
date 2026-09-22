// models/courseViewModel.js
import mongoose from "mongoose";

const courseViewSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    // date string "YYYY-MM-DD" — easy aggregation ke liye
    date: {
      type: String,
      required: true,
      index: true,
    },
    // Optional: unique user tracking (guest views bhi count honge agar userId null hai)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    // createdAt timestamp automatically store hoga
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for fast date-range queries
courseViewSchema.index({ date: 1, courseId: 1 });

export const CourseView = mongoose.model("CourseView", courseViewSchema);
