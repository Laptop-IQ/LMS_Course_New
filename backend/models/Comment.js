import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    // =====================================
    // COURSE
    // =====================================
    courseId: {
      type: String,
      required: true,
      index: true,
    },

    // =====================================
    // USER
    // =====================================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    userRole: {
      type: String,
      enum: ["student", "instructor"],
      default: "student",
    },

    // =====================================
    // COMMENT MESSAGE
    // =====================================
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // =====================================
    // QUESTION STATUS
    // =====================================
    status: {
      type: String,
      enum: ["open", "answered"],
      default: "open",
    },

    replyCount: {
      type: Number,
      default: 0,
    },

    isInstructorReply: {
      type: Boolean,
      default: false,
    },

    // =====================================
    // REPLY SYSTEM
    // =====================================
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    // =====================================
    // LIKE / DISLIKE SYSTEM
    // =====================================
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // =====================================
    // OPTIONAL FEATURES
    // =====================================
    edited: {
      type: Boolean,
      default: false,
    },

    pinned: {
      type: Boolean,
      default: false,
    },
    // Existing fields ke baad add karo
    isTeacherReply: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// =====================================
// INDEXES
// =====================================

commentSchema.index({
  courseId: 1,
  createdAt: -1,
});

commentSchema.index({
  parentComment: 1,
});

commentSchema.index({
  courseId: 1,
  parentComment: 1,
});

// =====================================
// VIRTUALS
// =====================================

commentSchema.virtual("likeCount").get(function () {
  return this.likes?.length || 0;
});

commentSchema.virtual("dislikeCount").get(function () {
  return this.dislikes?.length || 0;
});

// =====================================
// JSON SETTINGS
// =====================================

commentSchema.set("toJSON", {
  virtuals: true,
});

commentSchema.set("toObject", {
  virtuals: true,
});

const Comment =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export default Comment;
