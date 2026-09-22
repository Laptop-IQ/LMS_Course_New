import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    lectureId: {
      type: String, // optional (if per lecture resources)
      default: null,
    },

    title: String,

    type: {
      type: String,
      enum: ["pdf", "doc", "link", "image", "other"],
      default: "link",
    },

    url: {
      type: String,
      required: true,
    },

    fileName: String,
  },
  { timestamps: true },
);

export default mongoose.model("CourseResource", resourceSchema);
