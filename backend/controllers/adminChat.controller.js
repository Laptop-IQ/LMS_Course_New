import AdminChat from "../models/AdminChat.model.js";
import { createNotification } from "../utils/createNotification.js";

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
const emitToRoom = (io, courseId, userId, event, payload) => {
  const room = `adminChat_${courseId}_${userId}`;
  io?.to(room).emit(event, payload);
};

/* ─────────────────────────────────────────────────────────
   STUDENT — GET /api/admin-chat/:courseId
───────────────────────────────────────────────────────── */
export const getStudentChatHistory = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const messages = await AdminChat.find({
      courseId,
      isDeleted: false,
      $or: [{ senderId: userId }, { targetUserId: userId }],
    })
      .sort({ createdAt: 1 })
      .lean();

    await AdminChat.updateMany(
      { courseId, targetUserId: userId, readByUser: false },
      { $set: { readByUser: true } },
    );

    const normalized = messages.map((m) => ({
      ...m,
      _id: m._id.toString(),
      senderId: m.senderId?.toString() || null,
      targetUserId: m.targetUserId?.toString() || null,
      courseId: m.courseId?.toString(),
      senderRole:
        m.senderRole || (m.senderModel === "Admin" ? "admin" : "student"),
    }));

    return res.status(200).json({ success: true, messages: normalized });
  } catch (err) {
    console.error("getStudentChatHistory error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────
   STUDENT — POST /api/admin-chat/:courseId
───────────────────────────────────────────────────────── */
export const sendStudentMessage = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message cannot be empty" });
    }

    const msg = await AdminChat.create({
      courseId,
      senderId: req.user.id,
      senderModel: "User",
      senderRole: req.user.role || "student",
      senderName: req.user.name,
      senderAvatar: req.user.avatar,
      message: message.trim(),
    });

    const plain = msg.toObject();
    const normalized = {
      ...plain,
      _id: plain._id.toString(),
      senderId: plain.senderId?.toString() || null,
      courseId: plain.courseId?.toString(),
    };

    const io = req.app.get("io");
    emitToRoom(io, courseId, req.user.id, "adminChatMessage", normalized);
    io?.to("adminDashboard").emit("newStudentMessage", {
      ...normalized,
      courseId,
    });

    // ✅ FIX: Admin ke liye persistent notification create karo
    // Sirf socket event se admin refresh karne par notification miss ho sakti thi
    await createNotification({
      io,
      userId: null,
      targetRole: "admin",
      type: "message",
      title: "New Student Message",
      message: `${req.user.name || "Student"}: "${message.trim().slice(0, 80)}${message.trim().length > 80 ? "…" : ""}"`,
      metadata: {
        courseId: msg.courseId,
        senderId: msg.senderId,
        senderName: req.user.name || "Student",
      },
    });

    return res.status(201).json({ success: true, message: normalized });
  } catch (err) {
    console.error("sendStudentMessage error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────
   ADMIN — GET /api/admin-chat/admin/conversations/:courseId
───────────────────────────────────────────────────────── */
export const getAdminConversations = async (req, res) => {
  try {
    const { courseId } = req.params;

    const threads = await AdminChat.aggregate([
      {
        $match: {
          courseId: new (await import("mongoose")).default.Types.ObjectId(
            courseId,
          ),
          senderModel: "User",
          isDeleted: false,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$senderId",
          lastMessage: { $first: "$message" },
          lastAt: { $first: "$createdAt" },
          senderName: { $first: "$senderName" },
          senderAvatar: { $first: "$senderAvatar" },
          unread: {
            $sum: { $cond: [{ $eq: ["$readByAdmin", false] }, 1, 0] },
          },
        },
      },
      { $sort: { lastAt: -1 } },
    ]);

    return res.status(200).json({ success: true, threads });
  } catch (err) {
    console.error("getAdminConversations error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────
   ADMIN — GET /api/admin-chat/admin/thread/:courseId/:userId
───────────────────────────────────────────────────────── */
export const getThreadWithUser = async (req, res) => {
  try {
    const { courseId, userId } = req.params;

    const messages = await AdminChat.find({
      courseId,
      isDeleted: false,
      $or: [{ senderId: userId }, { targetUserId: userId }],
    })
      .sort({ createdAt: 1 })
      .lean();

    await AdminChat.updateMany(
      { courseId, senderId: userId, readByAdmin: false },
      { $set: { readByAdmin: true } },
    );

    const normalized = messages.map((m) => ({
      ...m,
      _id: m._id.toString(),
      senderId: m.senderId?.toString() || null,
      targetUserId: m.targetUserId?.toString() || null,
      courseId: m.courseId?.toString(),
      senderRole:
        m.senderRole || (m.senderModel === "Admin" ? "admin" : "student"),
    }));

    return res.status(200).json({ success: true, messages: normalized });
  } catch (err) {
    console.error("getThreadWithUser error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────
   ADMIN — POST /api/admin-chat/admin/reply/:courseId/:userId
───────────────────────────────────────────────────────── */
export const sendAdminReply = async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message cannot be empty" });
    }

    const msg = await AdminChat.create({
      courseId,
      senderId: req.admin._id,
      senderModel: "Admin",
      senderRole: req.admin.role || "admin",
      senderName: req.admin.name || "Admin",
      senderAvatar: req.admin.avatar || null,
      targetUserId: userId,
      message: message.trim(),
      readByAdmin: true,
    });

    const plain = msg.toObject();
    const normalized = {
      ...plain,
      _id: plain._id.toString(),
      senderId: plain.senderId?.toString() || null,
      targetUserId: plain.targetUserId?.toString() || null,
      // ✅ FIX: courseId ko string mein convert karo
      // NotificationContext mein courseId comparison string se hoti hai
      courseId: plain.courseId?.toString(),
      senderRole: plain.senderRole || "admin",
    };

    const io = req.app.get("io");

    // Existing: CommentBox ka chat panel socket receive karta hai
    emitToRoom(io, courseId, userId, "adminChatMessage", normalized);

    // ✅ FIX: Student ke personal userId room mein bhi emit karo
    // NotificationContext ka socket sirf userId room mein join hota hai,
    // adminChat_courseId_userId room mein nahi — isliye badge nahi aata tha
    io?.to(userId.toString()).emit("adminChatMessage", normalized);

    // ✅ FIX: Student ke liye persistent notification bhi banao
    // Sirf socket event hone se page refresh par notification gayab ho jati thi
    await createNotification({
      io,
      userId,
      type: "message",
      title: "Admin replied to your message",
      message: `${req.admin.name || "Admin"}: "${message.trim().slice(0, 80)}${message.trim().length > 80 ? "…" : ""}"`,
      metadata: {
        courseId: msg.courseId,
        senderId: req.admin._id,
        senderName: req.admin.name || "Admin",
      },
    });

    return res.status(201).json({ success: true, message: normalized });
  } catch (err) {
    console.error("sendAdminReply error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────
   EDIT MESSAGE
───────────────────────────────────────────────────────── */
export const editMessage = async (req, res) => {
  try {
    const { msgId } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    const updated = await AdminChat.findOneAndUpdate(
      { _id: msgId, isDeleted: false },
      { message: message.trim(), isEdited: true, editedAt: new Date() },
      { new: true },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    const io = req.app.get("io");
    io?.emit("adminChatMessageEdited", {
      _id: updated._id.toString(),
      message: updated.message,
      isEdited: true,
      editedAt: updated.editedAt,
    });

    return res.status(200).json({ success: true, message: updated });
  } catch (err) {
    console.error("editMessage error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────
   DELETE MESSAGE
───────────────────────────────────────────────────────── */
export const deleteMessage = async (req, res) => {
  try {
    const { msgId } = req.params;

    const msg = await AdminChat.findByIdAndUpdate(
      msgId,
      { isDeleted: true },
      { new: true },
    );

    if (!msg) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    const studentId =
      msg.senderModel === "User"
        ? msg.senderId.toString()
        : msg.targetUserId?.toString();

    const io = req.app.get("io");
    emitToRoom(
      io,
      msg.courseId.toString(),
      studentId,
      "adminChatMessageDeleted",
      {
        messageId: msgId,
      },
    );

    return res
      .status(200)
      .json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("deleteMessage error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────
   CLEAR THREAD (soft delete)
───────────────────────────────────────────────────────── */
export const clearThread = async (req, res) => {
  try {
    const { courseId, threadId } = req.params;

    const result = await AdminChat.updateMany(
      {
        courseId,
        isDeleted: false,
        $or: [{ senderId: threadId }, { targetUserId: threadId }],
      },
      { $set: { isDeleted: true } },
    );

    const io = req.app.get("io");
    emitToRoom(io, courseId, threadId, "adminChatThreadCleared", { threadId });

    return res
      .status(200)
      .json({ success: true, affectedMessages: result.modifiedCount });
  } catch (err) {
    console.error("clearThread error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────
   DELETE CONVERSATION (hard delete)
───────────────────────────────────────────────────────── */
export const deleteConversation = async (req, res) => {
  try {
    const { courseId, threadId } = req.params;

    const result = await AdminChat.deleteMany({
      courseId,
      $or: [{ senderId: threadId }, { targetUserId: threadId }],
    });

    const io = req.app.get("io");
    emitToRoom(io, courseId, threadId, "adminConversationDeleted", {
      threadId,
    });

    return res
      .status(200)
      .json({ success: true, deletedMessages: result.deletedCount });
  } catch (err) {
    console.error("deleteConversation error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
