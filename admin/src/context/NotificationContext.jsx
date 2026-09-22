import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import API from "../api/adminApi";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const adminRef = useRef(
    (() => {
      try {
        return JSON.parse(localStorage.getItem("adminUser")) || {};
      } catch {
        return {};
      }
    })(),
  );
  const admin = adminRef.current;

  const loadNotifications = async () => {
    try {
      const res = await API.get("/api/adminnotifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Socket
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_BASE, {
      transports: ["websocket"],
    });

    const joinRooms = () => {
      socket.emit("joinRole", "admin");
    };

    if (socket.connected) joinRooms();
    socket.on("connect", joinRooms);

    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, []); // no dependency — always connect on mount

  const markRead = async (id) => {
    setNotifications((p) =>
      p.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await API.put(`/api/adminnotifications/${id}/read`);
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    setNotifications((p) => p.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await API.put("/api/adminnotifications/read-all");
    } catch (e) {
      console.error(e);
    }
  };

  const deleteOne = async (id) => {
    setNotifications((p) => p.filter((n) => n._id !== id));
    try {
      await API.delete(`/api/adminnotifications/${id}`);
    } catch (e) {
      console.error(e);
      loadNotifications();
    }
  };

  const clearAll = async () => {
    const backup = notifications;
    setNotifications([]);
    setUnreadCount(0);
    try {
      await API.delete("/api/adminnotifications/clear");
    } catch (e) {
      setNotifications(backup);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount,
        loading,
        loadNotifications,
        markRead,
        markAllRead,
        deleteOne,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  return ctx;
};
