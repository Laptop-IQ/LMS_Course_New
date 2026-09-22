import Notification from "../models/Notification.js";

/* =========================================================
   HELPER — req.user (students) ya req.admin (admin panel)
   dono se caller info extract karo
========================================================= */
const getCaller = (req) => {
  if (req.user) {
    // isAuthenticated middleware — user routes
    return { userId: req.user._id, role: "user" };
  }
  if (req.admin) {
    // protectAdmin middleware — admin routes
    return { userId: req.admin._id, role: "admin" };
  }
  return null;
};

/* =========================================================
   HELPER — MongoDB query build karo
   Schema fields:
     user       → ObjectId (specific user ke liye)
     targetRole → "user" | "admin" (role broadcast ke liye)
========================================================= */
const buildUserQuery = (userId, role, extra = {}) => {
  const roleOrUser = {
    $or: [
      { user: userId }, // specific user ko target kiya tha
      { targetRole: role }, // pure role ko broadcast kiya tha
    ],
  };
  return { ...roleOrUser, ...extra };
};

/* =========================================================
   GET NOTIFICATIONS
========================================================= */
export const getNotifications = async (req, res) => {
  try {
    const caller = getCaller(req);
    if (!caller) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { userId, role } = caller;

    const notifications = await Notification.find(buildUserQuery(userId, role))
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error("getNotifications error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications" });
  }
};

/* =========================================================
   MARK SINGLE AS READ
========================================================= */
export const markNotificationRead = async (req, res) => {
  try {
    const caller = getCaller(req);
    if (!caller) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { userId, role } = caller;

    const notification = await Notification.findOneAndUpdate(
      buildUserQuery(userId, role, { _id: req.params.id }),
      { read: true },
      { new: true },
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error("markNotificationRead error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update notification" });
  }
};

/* =========================================================
   MARK ALL AS READ
========================================================= */
export const markAllNotificationsRead = async (req, res) => {
  try {
    const caller = getCaller(req);
    if (!caller) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { userId, role } = caller;

    await Notification.updateMany(
      buildUserQuery(userId, role, { read: false }),
      { read: true },
    );

    res
      .status(200)
      .json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("markAllNotificationsRead error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update notifications" });
  }
};

/* =========================================================
   DELETE SINGLE
========================================================= */
export const deleteNotification = async (req, res) => {
  try {
    const caller = getCaller(req);
    if (!caller) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { userId, role } = caller;

    const deleted = await Notification.findOneAndDelete(
      buildUserQuery(userId, role, { _id: req.params.id }),
    );

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("deleteNotification error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete notification" });
  }
};

/* =========================================================
   CLEAR ALL
========================================================= */
export const clearAllNotifications = async (req, res) => {
  try {
    const caller = getCaller(req);
    if (!caller) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { userId, role } = caller;

    await Notification.deleteMany(buildUserQuery(userId, role));

    res
      .status(200)
      .json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    console.error("clearAllNotifications error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to clear notifications" });
  }
};
