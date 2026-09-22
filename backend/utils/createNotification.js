import Notification from "../models/Notification.js";

export const createNotification = async ({
  io,
  userId, // for user-specific notifications (pass null for admin-only)
  targetRole, // "admin" | "user" | null
  type,
  title,
  message,
  metadata = {},
}) => {
  try {
    // VALIDATION — need at least one target
    if (!userId && !targetRole) {
      console.log("❌ Notification: userId or targetRole required");
      return null;
    }

    // SAVE TO DB
    const notification = await Notification.create({
      user: userId || null,
      targetRole: targetRole || "user",
      type,
      title,
      message,
      metadata,
      read: false,
    });

    const populatedNotification = await Notification.findById(
      notification._id,
    ).lean();

    // REALTIME SOCKET
    if (io) {
      if (userId) {
        // User-specific room
        io.to(userId.toString()).emit("newNotification", populatedNotification);
        console.log(`✅ Notification sent to user room: ${userId}`);
      }

      if (targetRole) {

        io.to(`role:${targetRole}`).emit(
          "newNotification",
          populatedNotification,
        );
        console.log(`✅ Notification sent to role room: role:${targetRole}`);
      }
    } else {
      console.log("❌ Socket io missing");
    }

    return populatedNotification;
  } catch (error) {
    console.log("❌ Notification Error:", error.message);
    return null;
  }
};
