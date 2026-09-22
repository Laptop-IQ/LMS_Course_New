import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import axios from "axios";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const NotificationContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE;

export const NotificationProvider = ({ children }) => {
  /* ======================================================
      STATE
  ====================================================== */

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user")),
  );

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  /* Track unread admin chat messages per courseId */
  const [adminChatUnread, setAdminChatUnread] = useState({});

  /* Track which admin-chat rooms are currently "open/visible" */
  const activeChatCourseRef = useRef(null);

  const socketRef = useRef(null);

  /* ======================================================
      SYNC TOKEN ON STORAGE CHANGE (multi-tab support)
  ====================================================== */

  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem("token"));
      setUser(JSON.parse(localStorage.getItem("user")));
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  /* ======================================================
      SOCKET INIT — only once, persists across renders
  ====================================================== */

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(API_BASE, {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });
    }

    const socket = socketRef.current;

    const onConnect = () => console.log("✅ Socket connected:", socket.id);
    const onDisconnect = () => console.log("❌ Socket disconnected");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  /* ======================================================
      JOIN USER ROOM — reconnect par bhi rejoin hoga
  ====================================================== */

  useEffect(() => {
    if (!user?._id) return;

    const socket = socketRef.current;
    if (!socket) return;

    const joinRoom = () => {
      socket.emit("join", user._id.toString());
      console.log("📡 Joined room:", user._id);
    };

    /* Join immediately if already connected */
    if (socket.connected) joinRoom();

    /* Rejoin on every reconnect so no events are missed */
    socket.on("connect", joinRoom);

    return () => {
      socket.off("connect", joinRoom);
    };
  }, [user]);

  /* ======================================================
      SOCKET LISTENER — General Notifications
  ====================================================== */

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNotification = (notification) => {
      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === notification._id);
        if (exists) return prev;
        return [notification, ...prev];
      });

      toast.success(notification.title || "New Notification", {
        icon: "🔔",
        style: {
          background: "#0f172a",
          color: "#fff",
          border: "1px solid rgba(99,102,241,0.4)",
        },
      });
    };

    socket.on("newNotification", handleNotification);
    return () => socket.off("newNotification", handleNotification);
  }, []);

  /* ======================================================
      SOCKET LISTENER — Admin Chat Messages
  ====================================================== */

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const myId = user?._id?.toString();

    const handleAdminChatMessage = (msg) => {
      if (!myId) return;

      const senderId =
        msg.senderId?._id?.toString() || msg.senderId?.toString();

      /* Only notify when message is FROM someone else */
      if (senderId === myId) return;

      const courseId = msg.courseId;

      /* If user is currently viewing this chat, skip unread count */
      if (activeChatCourseRef.current === courseId) return;

      /* Increment unread counter for that course */
      setAdminChatUnread((prev) => ({
        ...prev,
        [courseId]: (prev[courseId] || 0) + 1,
      }));

      /* Show toast */
      const senderName = msg.senderName || "Admin";
      const isAdmin =
        msg.senderRole === "admin" || msg.senderRole === "instructor";

      toast(
        (t) => (
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}
          >
            <span style={{ fontSize: "20px" }}>{isAdmin ? "🛡️" : "💬"}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: "13px", color: "#fff" }}>
                {isAdmin ? `Admin: ${senderName}` : senderName}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.7)",
                  marginTop: "2px",
                  maxWidth: "220px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {msg.message}
              </div>
            </div>
          </div>
        ),
        {
          duration: 4000,
          style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid rgba(139,92,246,0.5)",
            padding: "10px 14px",
          },
        },
      );
    };

    socket.on("adminChatMessage", handleAdminChatMessage);
    return () => socket.off("adminChatMessage", handleAdminChatMessage);
  }, [user]);

  /* ======================================================
      FETCH NOTIFICATIONS
  ====================================================== */

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(res.data?.notifications || []);
    } catch (error) {
      console.error("fetchNotifications error:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [token]);

  /* ======================================================
      AUTO FETCH ON TOKEN CHANGE
  ====================================================== */

  useEffect(() => {
    if (token) fetchNotifications();
  }, [token, fetchNotifications]);

  /* ======================================================
      MARK SINGLE AS READ
  ====================================================== */

  const markAsRead = useCallback(
    async (id) => {
      try {
        await axios.put(
          `${API_BASE}/api/notifications/${id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
        );
      } catch (error) {
        console.error(
          "markAsRead error:",
          error.response?.data || error.message,
        );
        toast.error("Failed to mark as read");
      }
    },
    [token],
  );

  /* ======================================================
      DELETE SINGLE
  ====================================================== */

  const deleteNotification = useCallback(
    async (id) => {
      try {
        await axios.delete(`${API_BASE}/api/notifications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      } catch (error) {
        console.error(
          "deleteNotification error:",
          error.response?.data || error.message,
        );
        toast.error("Failed to delete notification");
      }
    },
    [token],
  );

  /* ======================================================
      MARK ALL AS READ
  ====================================================== */

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.put(
        `${API_BASE}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("markAllAsRead error:", error);
      toast.error("Failed to mark all as read");
    }
  }, [token]);

  /* ======================================================
      CLEAR ALL
  ====================================================== */

  const clearAll = useCallback(async () => {
    try {
      await axios.delete(`${API_BASE}/api/notifications/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
    } catch (error) {
      console.error("clearAll error:", error);
      toast.error("Failed to clear notifications");
    }
  }, [token]);

  /* ======================================================
      ADMIN CHAT HELPERS
  ====================================================== */

  /** Call when user opens a specific admin-chat panel */
  const setActiveChatCourse = useCallback((courseId) => {
    activeChatCourseRef.current = courseId;
    if (courseId) {
      setAdminChatUnread((prev) => {
        if (!prev[courseId]) return prev;
        const next = { ...prev };
        delete next[courseId];
        return next;
      });
    }
  }, []);

  /** Call when user closes / navigates away from admin chat */
  const clearActiveChatCourse = useCallback(() => {
    activeChatCourseRef.current = null;
  }, []);

  /* ======================================================
      DERIVED STATE
  ====================================================== */

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const adminChatUnreadTotal = useMemo(
    () => Object.values(adminChatUnread).reduce((a, b) => a + b, 0),
    [adminChatUnread],
  );

  /* ======================================================
      PROVIDER
  ====================================================== */

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        unreadCount,
        fetchNotifications,
        markAsRead,
        deleteNotification,
        markAllAsRead,
        clearAll,
        adminChatUnread,
        adminChatUnreadTotal,
        setActiveChatCourse,
        clearActiveChatCourse,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
