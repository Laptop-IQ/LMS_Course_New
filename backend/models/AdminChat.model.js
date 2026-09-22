import mongoose from "mongoose";

const adminChatMessageSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    /* Who sent it */
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel",
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["User", "Admin"],
    },
    senderRole: {
      type: String,
      enum: ["student", "instructor", "admin", "superadmin"],
      required: true,
    },
    senderName: { type: String },
    senderAvatar: { type: String },

    /* ── FIX: targetUserId — student ka ID jisko admin reply kar raha hai
       Admin replies mein yeh field set hoti hai taaki student ki
       getStudentChatHistory query mein filter ho sake               */
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    /* The message */
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    
    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },

    /* Read receipts */
    readByAdmin: { type: Boolean, default: false },
    readByUser: { type: Boolean, default: false },

    /* Soft delete */
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

/* Indexes */
adminChatMessageSchema.index({ courseId: 1, senderId: 1, createdAt: 1 });
adminChatMessageSchema.index({ courseId: 1, createdAt: 1 });
// ── FIX: targetUserId ke liye index — getStudentChatHistory query fast hogi
adminChatMessageSchema.index({ courseId: 1, targetUserId: 1, createdAt: 1 });

const AdminChat = mongoose.model("AdminChat", adminChatMessageSchema);
export default AdminChat;
