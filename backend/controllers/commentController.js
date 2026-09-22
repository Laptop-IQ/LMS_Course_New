import Comment from "../models/Comment.js";
import Course from "../models/courseModel.js";
import { createNotification } from "../utils/createNotification.js";

// ========================================
// GET COMMENTS
// ========================================
export const getComments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const comments = await Comment.find({ courseId })
      .populate("userId", "username avatar email phone") // ✅ email add kiya
      .sort({ createdAt: -1 })
      .lean();

    // ✅ replyCount calculate karo
    const parentIds = comments
      .filter((c) => !c.parentComment)
      .map((c) => c._id);

    const replyCounts = await Comment.aggregate([
      { $match: { parentComment: { $in: parentIds } } },
      { $group: { _id: "$parentComment", count: { $sum: 1 } } },
    ]);

    const replyCountMap = {};
    replyCounts.forEach((r) => {
      replyCountMap[String(r._id)] = r.count;
    });

    const enriched = comments.map((c) => ({
      ...c,
      replyCount: replyCountMap[String(c._id)] || c.replyCount || 0,
    }));

    res.status(200).json({ success: true, comments: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========================================
// ADD COMMENT / REPLY
// ========================================
export const addComment = async (req, res) => {
  try {
    const io = req.app.get("io");
    const { courseId, message, parentComment } = req.body;

    if (!courseId || !message) {
      return res.status(400).json({
        success: false,
        message: "courseId and message required",
      });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // ── Course name fetch karo notification ke liye ──
    const course = await Course.findById(courseId)
      .select("title courseName")
      .lean();
    const courseName = course?.title || course?.courseName || "Unknown Course";

    const senderName =
      req.user.username || req.user.name || req.user.fullName || "User";

    const comment = await Comment.create({
      courseId,
      message,
      parentComment: parentComment || null,
      userId: req.user._id,
      userName: senderName,
    });

    const populated = await Comment.findById(comment._id)
      .populate("userId", "username avatar")
      .lean();

    // ── Reply notification (original commenter ko) ──
    if (parentComment) {
      const parent = await Comment.findById(parentComment);

      if (parent && parent.userId.toString() !== req.user._id.toString()) {
        await createNotification({
          io,
          userId: parent.userId,
          type: "reply",
          title: "New Reply on Your Comment",
          message: `${senderName} replied to your comment`,
          metadata: {
            courseId,
            courseName,
            commentId: comment._id,
            senderId: req.user._id,
            senderName,
          },
        });
      }
    }

    // ── Admin notification (sirf top-level comments pe) ──
    if (!parentComment) {
      await createNotification({
        io,
        userId: null,
        targetRole: "admin",
        type: "comment",
        title: "New Comment",
        message: `${senderName} commented on "${courseName}"`,
        metadata: {
          courseId,
          courseName, // ← ab course name jayega
          commentId: comment._id,
          senderId: req.user._id,
          senderName, // ← ab student ka naam bhi jayega
          commentText: message, // ✅ ADD — actual comment text
          email: req.user?.email || null, // ✅ ADD
        },
      });
    }

    if (io) {
      io.to(courseId).emit("newComment", populated);
    }

    res.status(201).json({ success: true, comment: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================================
// ADMIN REPLY TO COMMENT (Notification page se)
// ========================================
export const adminReplyToComment = async (req, res) => {
  try {
    const io = req.app.get("io");
    const { courseId } = req.params;
    const { commentId, message, notificationId, studentId } = req.body;

    if (!commentId || !message) {
      return res.status(400).json({
        success: false,
        message: "commentId and message required",
      });
    }

    // Admin check
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    const course = await Course.findById(courseId)
      .select("title courseName")
      .lean();
    const courseName = course?.title || course?.courseName || "Unknown Course";

    // Admin ka reply comment create karo
    const reply = await Comment.create({
      courseId,
      message,
      parentComment: commentId,
      userId: req.user._id,
      userName: req.user.username || "Admin",
      isAdminReply: true,
    });

    const populated = await Comment.findById(reply._id)
      .populate("userId", "username avatar")
      .lean();

    // Student ko notification bhejo
    const targetUserId = studentId || parentComment.userId;

    if (targetUserId && targetUserId.toString() !== req.user._id.toString()) {
      await createNotification({
        io,
        userId: targetUserId,
        type: "reply",
        title: "Admin replied to your comment",
        message: `Admin replied: "${message.slice(0, 80)}${message.length > 80 ? "…" : ""}"`,
        metadata: {
          courseId,
          courseName,
          commentId: reply._id,
          senderId: req.user._id,
          senderName: req.user.username || "Admin",
        },
      });
    }

    if (io) {
      io.to(courseId).emit("newComment", populated);
    }

    res.status(201).json({
      success: true,
      comment: populated,
      message: "Reply sent successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================================
// UPDATE COMMENT
// ========================================
export const updateComment = async (req, res) => {
  try {
    const io = req.app.get("io");
    const { id } = req.params;
    const { message } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    comment.message = message || comment.message;
    comment.edited = true;
    await comment.save();

    if (io) {
      io.to(comment.courseId.toString()).emit("updateComment", comment);
    }

    res.status(200).json({ success: true, comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================================
// DELETE COMMENT
// ========================================
export const deleteComment = async (req, res) => {
  try {
    const io = req.app.get("io");
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    if (
      comment.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    await Comment.deleteMany({ parentComment: id });
    await comment.deleteOne();

    if (io) {
      io.to(comment.courseId.toString()).emit("deleteComment", id);
    }

    res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================================
// LIKE / DISLIKE
// ========================================
export const toggleLike = async (req, res) => {
  try {
    const io = req.app.get("io");
    const { id } = req.params;
    const { type } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    const userId = req.user._id.toString();
    const senderName = req.user.username || req.user.name || "Someone";

    if (type === "like") {
      comment.dislikes = comment.dislikes.filter(
        (d) => d.toString() !== userId,
      );
      const alreadyLiked = comment.likes.some((l) => l.toString() === userId);

      if (alreadyLiked) {
        comment.likes = comment.likes.filter((l) => l.toString() !== userId);
      } else {
        comment.likes.push(userId);

        if (comment.userId.toString() !== userId) {
          const course = await Course.findById(comment.courseId)
            .select("title courseName")
            .lean();

          await createNotification({
            io,
            userId: comment.userId,
            type: "like",
            title: "Comment Liked",
            message: `${senderName} liked your comment`,
            metadata: {
              commentId: comment._id,
              courseId: comment.courseId,
              courseName:
                course?.title || course?.courseName || "Unknown Course",
              senderId: req.user._id,
              senderName,
            },
          });
        }
      }
    }

    if (type === "dislike") {
      comment.likes = comment.likes.filter((l) => l.toString() !== userId);
      const alreadyDisliked = comment.dislikes.some(
        (d) => d.toString() === userId,
      );

      if (alreadyDisliked) {
        comment.dislikes = comment.dislikes.filter(
          (d) => d.toString() !== userId,
        );
      } else {
        comment.dislikes.push(userId);
      }
    }

    await comment.save();

    if (io) {
      io.to(comment.courseId.toString()).emit("likeUpdated", comment);
    }

    res.status(200).json({ success: true, comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
