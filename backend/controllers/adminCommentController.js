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
      .populate("userId", "username avatar role email name")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ========================================
// ADD COMMENT / REPLY  (Admin)
// ========================================
export const addComment = async (req, res) => {
  try {
    const io = req.app.get("io");
    const { courseId, message, parentComment } = req.body;

    if (!courseId || !message) {
      return res
        .status(400)
        .json({ success: false, message: "courseId and message required" });
    }

    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const course = await Course.findById(courseId)
      .select("title courseName")
      .lean();
    const courseName = course?.title || course?.courseName || "Unknown Course";

    const senderName =
      req.admin.username || req.admin.name || req.admin.fullName || "Admin";

    const comment = await Comment.create({
      courseId,
      message,
      parentComment: parentComment || null,
      userId: req.admin._id,
      userName: senderName,
    });

    const populated = await Comment.findById(comment._id)
      .populate("userId", "username avatar role email name")
      .lean();

    // Reply notification — parent comment author ko notify karo
    if (parentComment) {
      const parent = await Comment.findById(parentComment);

      if (parent && parent.userId.toString() !== req.admin._id.toString()) {
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
            senderId: req.admin._id,
            senderName,
          },
        });
      }
    }

    if (io) io.to(courseId).emit("newComment", populated);

    res.status(201).json({ success: true, comment: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================================
// ADMIN REPLY TO COMMENT
// ========================================
export const adminReplyToComment = async (req, res) => {
  try {
    const io = req.app.get("io");
    const { courseId } = req.params;
    const { commentId, message, studentId } = req.body;

    if (!commentId || !message) {
      return res
        .status(400)
        .json({ success: false, message: "commentId and message required" });
    }

    if (!req.admin) {
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
    const adminName = req.admin.username || req.admin.name || "Admin";

    const reply = await Comment.create({
      courseId,
      message,
      parentComment: commentId,
      userId: req.admin._id,
      userName: adminName,
      isAdminReply: true,
    });

    const populated = await Comment.findById(reply._id)
      .populate("userId", "username avatar role email name")
      .lean();

    const targetUserId = studentId || parentComment.userId;

    if (targetUserId && targetUserId.toString() !== req.admin._id.toString()) {
      await createNotification({
        io,
        userId: targetUserId,
        type: "reply",
        title: "Admin replied to your comment",
        message: `${adminName}: "${message.slice(0, 80)}${message.length > 80 ? "…" : ""}"`,
        metadata: {
          courseId,
          courseName,
          commentId: reply._id,
          senderId: req.admin._id,
          senderName: adminName,
        },
      });
    }

    if (io) io.to(courseId).emit("newComment", populated);

    res.status(201).json({
      success: true,
      comment: populated,
      reply: populated,
      message: "Reply sent successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================================
// UPDATE COMMENT
// Admin: kisi bhi comment ko edit kar sakta hai
// Student: sirf apna comment edit kar sakta hai
// ========================================
export const updateComment = async (req, res) => {
  try {
    const io = req.app.get("io");
    const { id } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message required" });
    }

    // Admin route
    if (req.admin) {
      const comment = await Comment.findById(id);
      if (!comment)
        return res
          .status(404)
          .json({ success: false, message: "Comment not found" });

      comment.message = message.trim();
      comment.edited = true;
      await comment.save();

      if (io) io.to(comment.courseId.toString()).emit("updateComment", comment);
      return res.status(200).json({ success: true, comment });
    }

    // Student route
    if (req.user) {
      const comment = await Comment.findById(id);
      if (!comment)
        return res
          .status(404)
          .json({ success: false, message: "Comment not found" });

      if (comment.userId.toString() !== req.user._id.toString())
        return res.status(403).json({ success: false, message: "Not allowed" });

      comment.message = message.trim();
      comment.edited = true;
      await comment.save();

      if (io) io.to(comment.courseId.toString()).emit("updateComment", comment);
      return res.status(200).json({ success: true, comment });
    }

    return res.status(401).json({ success: false, message: "Unauthorized" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========================================
// DELETE COMMENT
// Admin: kisi bhi comment ko delete kar sakta hai
// Student: sirf apna comment delete kar sakta hai
// ========================================
export const deleteComment = async (req, res) => {
  try {
    const io = req.app.get("io");
    const { id } = req.params;

    // Admin route
    if (req.admin) {
      const comment = await Comment.findById(id);
      if (!comment)
        return res
          .status(404)
          .json({ success: false, message: "Comment not found" });

      await Comment.deleteMany({ parentComment: id });
      await comment.deleteOne();

      if (io) io.to(comment.courseId.toString()).emit("deleteComment", id);
      return res
        .status(200)
        .json({ success: true, message: "Comment deleted" });
    }

    // Student route
    if (req.user) {
      const comment = await Comment.findById(id);
      if (!comment)
        return res
          .status(404)
          .json({ success: false, message: "Comment not found" });

      if (comment.userId.toString() !== req.user._id.toString())
        return res.status(403).json({ success: false, message: "Not allowed" });

      await Comment.deleteMany({ parentComment: id });
      await comment.deleteOne();

      if (io) io.to(comment.courseId.toString()).emit("deleteComment", id);
      return res
        .status(200)
        .json({ success: true, message: "Comment deleted" });
    }

    return res.status(401).json({ success: false, message: "Unauthorized" });
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

    if (!type || !["like", "dislike"].includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "type must be 'like' or 'dislike'" });
    }

    const actor = req.admin || req.user;
    if (!actor)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const comment = await Comment.findById(id);
    if (!comment)
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });

    const actorId = actor._id.toString();
    const senderName = actor.username || actor.name || "Someone";

    if (type === "like") {
      comment.dislikes = comment.dislikes.filter(
        (d) => d.toString() !== actorId,
      );

      const alreadyLiked = comment.likes.some((l) => l.toString() === actorId);

      if (alreadyLiked) {
        comment.likes = comment.likes.filter((l) => l.toString() !== actorId);
      } else {
        comment.likes.push(actorId);

        // Notification: sirf admin like kare aur comment owner alag ho
        if (req.admin && comment.userId.toString() !== actorId) {
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
              senderId: actor._id,
              senderName,
            },
          });
        }
      }
    }

    if (type === "dislike") {
      comment.likes = comment.likes.filter((l) => l.toString() !== actorId);

      const alreadyDisliked = comment.dislikes.some(
        (d) => d.toString() === actorId,
      );

      if (alreadyDisliked) {
        comment.dislikes = comment.dislikes.filter(
          (d) => d.toString() !== actorId,
        );
      } else {
        comment.dislikes.push(actorId);
      }
    }

    await comment.save();

    if (io) io.to(comment.courseId.toString()).emit("likeUpdated", comment);

    res.status(200).json({ success: true, comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
