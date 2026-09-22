// models/progressModel.js
import mongoose from "mongoose";

// ── StudyLog Schema ──────────────────────────────────────────
const studyLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  durationMins: { type: Number, default: 0 },
  sessionsCount: { type: Number, default: 1 },
});
studyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

// ── Progress Schema ──────────────────────────────────────────
const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedChapters: [{ type: String }],
    lastStudied: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// ── Exports ─────────────────────────────────────────────────
const Progress =
  mongoose.models.Progress || mongoose.model("Progress", progressSchema);

export const StudyLog =
  mongoose.models.StudyLog || mongoose.model("StudyLog", studyLogSchema);

export default Progress;
