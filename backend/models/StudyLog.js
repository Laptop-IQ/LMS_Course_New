import mongoose from "mongoose";

const { Schema, model } = mongoose;

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
const StudyLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },

    // ── Watch-time tracking ───────────────────────────────────────────────
    minutesStudied: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Seconds-level precision if needed later
    secondsStudied: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Date kept separate so we can aggregate by day easily
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

// ── Compound index for per-user-per-course queries ────────────────────────────
StudyLogSchema.index({ user: 1, course: 1, date: -1 });
StudyLogSchema.index({ date: -1 });

// Mongoose dobara compile karne ki koshish karta hai hot-reload pe — yeh line isse rokti hai
export default mongoose.models.StudyLog || model("StudyLog", StudyLogSchema);
