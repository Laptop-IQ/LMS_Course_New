import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    targetRole: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    type: {
      type: String,
      enum: [
        "course",
        "reply",
        "rating",
        "like",
        "upcoming",
        "achievement",
        "comment",
        "booking",
        "contact",
        "message",
        "register",
      ],
      default: "course",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    read: {
      type: Boolean,
      default: false,
    },

    metadata: {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
      commentId: mongoose.Schema.Types.ObjectId,
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      // ✅ Add these
      courseName: { type: String },
      senderName: { type: String },
      rating: { type: Number },
      review: { type: String },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Notification", notificationSchema);
