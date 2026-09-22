import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { Toaster, toast } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import {
  MessageCircle,
  Trash2,
  Edit3,
  ThumbsUp,
  Pin,
  BadgeCheck,
  Star,
  Lock,
  ChevronDown,
  Clock,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
  BookOpen,
  CheckCheck,
  Loader2,
  X,
  RefreshCw,
} from "lucide-react";

import { useNotifications } from "../context/NotificationContext";

/* ─────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────── */
const API = `${import.meta.env.VITE_API_BASE}/api/comments`;
const ADMIN_CHAT_API = `${import.meta.env.VITE_API_BASE}/api/admin-chat`;
const socket = io(import.meta.env.VITE_API_BASE, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
const showToast = (msg, type = "success") => {
  const base = {
    duration: 2500,
    style: {
      background: "#111827",
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.1)",
    },
  };
  if (type === "success") toast.success(msg, base);
  else if (type === "error") toast.error(msg, base);
  else toast(msg, base);
};

const fmtAgo = (d) => {
  if (!d) return "";
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

/* ─────────────────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────────────────── */
const Avatar = ({ src, name, size = 10, online = false }) => {
  const sz = `w-${size} h-${size}`;
  return (
    <div className="relative shrink-0">
      {src ? (
        <img
          src={src}
          alt={name}
          onError={(e) => {
            e.target.style.display = "none";
          }}
          className={`${sz} rounded-full object-cover border-2 border-slate-700/60`}
        />
      ) : (
        <div
          className={`${sz} rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center font-bold text-white text-sm border-2 border-slate-700/60`}
        >
          {initials(name)}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border-2 border-[#0b1220]" />
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   TAB SWITCHER
───────────────────────────────────────────────────────── */
const TabSwitcher = ({ activeTab, onChange, adminUnread = 0 }) => {
  const tabs = [
    {
      id: "feedback",
      label: "Course Feedback",
      icon: BookOpen,
      desc: "Public reviews & discussion",
    },
    {
      id: "admin",
      label: "Chat with Admin",
      icon: ShieldCheck,
      desc: "Private support chat",
      badge: adminUnread,
    },
  ];

  return (
    <div className="flex gap-2 p-1.5 rounded-2xl bg-[#060e1a] border border-slate-800/60">
      {tabs.map(({ id, label, icon: Icon, desc, badge }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
              active
                ? "bg-[#0F1F3A] border border-indigo-500/30 shadow-lg shadow-indigo-900/20"
                : "hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            <div
              className={`relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                active
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "bg-white/[0.04] text-slate-500"
              }`}
            >
              <Icon size={16} />
              {badge > 0 && !active && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p
                  className={`text-sm font-semibold leading-none mb-0.5 ${
                    active ? "text-white" : "text-slate-400"
                  }`}
                >
                  {label}
                </p>
                {badge > 0 && !active && (
                  <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-1.5 py-0.5 text-[9px] font-bold text-violet-400 leading-none">
                    {badge} new
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] leading-none truncate ${
                  active ? "text-indigo-400/70" : "text-slate-600"
                }`}
              >
                {desc}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   TYPING INDICATOR — compact
───────────────────────────────────────────────────────── */
const TypingIndicator = ({ name }) => (
  <div className="flex items-center gap-2 px-3 py-1">
    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shrink-0">
      <ShieldCheck size={9} className="text-white" />
    </div>
    <div className="bg-[#111d32] border border-white/[0.06] px-2.5 py-1.5 rounded-xl rounded-bl-sm flex items-center gap-1">
      <span className="text-[10px] text-slate-500">{name} typing</span>
      {[0, 0.2, 0.4].map((delay) => (
        <span
          key={delay}
          className="w-1 h-1 rounded-full bg-slate-500 animate-bounce"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────
   ADMIN CHAT PANEL — compact redesign
───────────────────────────────────────────────────────── */
const AdminChatPanel = ({
  currentUser,
  liveUser,
  token,
  courseId,
  onClose,
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { setActiveChatCourse, clearActiveChatCourse } = useNotifications();

  const myId = currentUser?.id?.toString() || currentUser?._id?.toString();

  useEffect(() => {
    setActiveChatCourse(courseId);
    return () => clearActiveChatCourse();
  }, [courseId, setActiveChatCourse, clearActiveChatCourse]);

  const fetchMessages = useCallback(async () => {
    if (!courseId || !token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${ADMIN_CHAT_API}/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.messages || [];
      setMessages(data);
    } catch (err) {
      console.error("Admin chat fetch error:", err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, token]);

  /* Manual refresh handler — shows spinning animation & toast */
  const handleRefresh = useCallback(async () => {
    if (refreshing || loading) return;
    setRefreshing(true);
    try {
      const res = await axios.get(`${ADMIN_CHAT_API}/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.messages || [];
      setMessages(data);
      showToast("Messages refreshed");
    } catch (err) {
      console.error("Refresh error:", err.message);
      showToast("Refresh failed", "error");
    } finally {
      setRefreshing(false);
    }
  }, [courseId, token, refreshing, loading]);

  useEffect(() => {
    if (!courseId || !token || !myId) return;

    fetchMessages();
    socket.emit("joinAdminChat", { courseId, userId: myId });

    const handleReconnect = () => {
      socket.emit("joinAdminChat", { courseId, userId: myId });
      fetchMessages();
    };

    const handleAdminChatMessage = (msg) => {
      setMessages((prev) => {
        const optimisticIndex = prev.findIndex(
          (m) =>
            m.isOptimistic &&
            m.message === msg.message &&
            m.senderId?.toString() === msg.senderId?.toString(),
        );
        if (optimisticIndex !== -1) {
          const updated = [...prev];
          updated[optimisticIndex] = msg;
          return updated;
        }
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      const sId = msg.senderId?._id?.toString() || msg.senderId?.toString();
      if (sId !== myId) {
        setTypingUsers((prev) => prev.filter((u) => u.id !== sId));
      }
    };

    const handleTypingStart = ({ userId, userName }) => {
      if (userId === myId) return;
      setTypingUsers((prev) => {
        if (prev.find((u) => u.id === userId)) return prev;
        return [...prev, { id: userId, name: userName }];
      });
    };
    const handleTypingStop = ({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u.id !== userId));
    };

    socket.on("connect", handleReconnect);
    socket.on("adminChatMessage", handleAdminChatMessage);
    socket.on("adminChatTypingStart", handleTypingStart);
    socket.on("adminChatTypingStop", handleTypingStop);

    return () => {
      socket.emit("leaveAdminChat", { courseId, userId: myId });
      socket.off("connect", handleReconnect);
      socket.off("adminChatMessage", handleAdminChatMessage);
      socket.off("adminChatTypingStart", handleTypingStart);
      socket.off("adminChatTypingStop", handleTypingStop);
    };
  }, [courseId, myId, token, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, typingUsers]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.overflowY = "hidden";
    e.target.style.height = "auto";
    const newHeight = Math.min(e.target.scrollHeight, 88);
    e.target.style.height = `${newHeight}px`;
    e.target.style.overflowY = newHeight >= 88 ? "auto" : "hidden";

    if (!myId) return;
    socket.emit("adminChatTypingStart", {
      courseId,
      userId: myId,
      userName: liveUser?.name || currentUser?.name || "User",
    });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("adminChatTypingStop", { courseId, userId: myId });
    }, 1500);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    if (!currentUser) return showToast("Please login first", "error");

    socket.emit("adminChatTypingStop", { courseId, userId: myId });
    clearTimeout(typingTimeoutRef.current);

    const optimistic = {
      _id: `opt_${Date.now()}`,
      message: text,
      senderId: myId,
      senderRole: currentUser?.role || "student",
      senderName: liveUser?.name || currentUser?.name || "You",
      senderAvatar: liveUser?.avatar,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.overflowY = "hidden";
    }
    textareaRef.current?.focus();
    setSending(true);

    try {
      const res = await axios.post(
        `${ADMIN_CHAT_API}/${courseId}`,
        { message: text },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const saved = res.data?.message || res.data;
      setMessages((prev) =>
        prev.map((m) => (m._id === optimistic._id ? { ...saved } : m)),
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      showToast("Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Lock size={18} className="text-indigo-400" />
        </div>
        <p className="text-white font-semibold text-sm">Login required</p>
        <p className="text-slate-400 text-xs max-w-xs">
          Please log in to chat with the admin team.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden h-full">
      {/* ── COMPACT INFO BAR ── */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-slate-800/80 bg-[#060f1e] shrink-0">
        {/* Admin avatar */}
        <div className="relative shrink-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
            <ShieldCheck size={13} className="text-white" />
          </div>
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border-[1.5px] border-[#060f1e]" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white leading-none">
            Admin Support
          </p>
          <p className="text-[10px] text-emerald-400/80 leading-none mt-0.5">
            Online · replies in minutes
          </p>
        </div>

        {/* Badges + Refresh + Close */}
        <div className="flex items-center gap-1.5 shrink-0">
          {messages.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-400">
              <MessageCircle size={8} /> {messages.length}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400">
            <Lock size={8} /> Private
          </span>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="w-7 h-7 rounded-lg border border-slate-700/80 bg-slate-800/60 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Refresh messages"
            title="Refresh messages"
          >
            <RefreshCw
              size={13}
              className={refreshing ? "animate-spin text-indigo-400" : ""}
            />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg border border-slate-700/80 bg-slate-800/60 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-700/60 flex items-center justify-center transition-all"
              aria-label="Close chat"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── MESSAGE AREA ── */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-3 space-y-1.5"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(71,85,105,0.4) transparent",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs h-full">
            <Loader2 size={14} className="animate-spin text-indigo-400" />
            Loading…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2.5 text-center py-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <MessageCircle size={18} className="text-indigo-400" />
            </div>
            <p className="text-white font-semibold text-sm">No messages yet</p>
            <p className="text-slate-500 text-xs max-w-[220px]">
              Ask anything about your course or account.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isMine =
                msg.senderId?.toString() === myId ||
                msg.senderId?._id?.toString() === myId;
              const isAdmin =
                msg.senderRole === "admin" || msg.senderRole === "instructor";
              const name =
                msg.senderName ||
                msg.senderId?.name ||
                (isMine ? "You" : "Admin");
              const avatarSrc = isMine
                ? liveUser?.avatar || msg.senderAvatar
                : msg.senderAvatar || msg.senderId?.avatar;

              return (
                <div
                  key={msg._id}
                  className={`flex items-end gap-2.5 ${
                    isMine ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar — only for others */}
                  {!isMine && (
                    <div className="shrink-0 mb-0.5">
                      <Avatar src={avatarSrc} name={name} size={8} />
                    </div>
                  )}

                  <div
                    className={`max-w-[70%] flex flex-col gap-1 ${
                      isMine ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Sender name */}
                    {!isMine && (
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[11px] font-semibold text-slate-300">
                          {name}
                        </span>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-0.5 rounded-full border border-violet-500/40 bg-violet-500/15 px-1.5 py-0.5 text-[8px] font-bold text-violet-400 tracking-wide">
                            <BadgeCheck size={7} /> ADMIN
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`relative px-3.5 py-2.5 text-[13px] leading-relaxed break-words transition-opacity ${
                        isMine
                          ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl rounded-br-sm shadow-lg shadow-indigo-500/20"
                          : "bg-[#131f35] border border-white/[0.08] text-slate-100 rounded-2xl rounded-bl-sm shadow-sm"
                      } ${msg.isOptimistic ? "opacity-50" : ""}`}
                    >
                      {/* subtle inner highlight for received bubbles */}
                      {!isMine && (
                        <span className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      )}
                      {msg.message}
                    </div>

                    {/* Timestamp row */}
                    <div
                      className={`flex items-center gap-1 text-[10px] text-slate-600 px-1 ${
                        isMine ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <span className="text-slate-500">
                        {fmtAgo(msg.createdAt)}
                      </span>
                      {msg.isOptimistic && (
                        <span className="text-slate-700 italic">sending…</span>
                      )}
                      {isMine && !msg.isOptimistic && (
                        <CheckCheck size={11} className="text-indigo-300/70" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicators */}
            {typingUsers.map((u) => (
              <TypingIndicator key={u.id} name={u.name} />
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT AREA ── */}
      <div className="border-t border-slate-800/60 px-3 py-3 bg-[#060f1e] shrink-0">
        <div className="flex items-center gap-2.5">
          {/* My avatar */}
          <Avatar
            src={liveUser?.avatar}
            name={liveUser?.name || currentUser?.name || ""}
            size={12}
            online
          />

          {/* Input pill — border lives here, not on textarea */}
          <div className="flex-1 flex items-center gap-2 rounded-2xl border border-slate-700/60 bg-[#0d1b30] px-3 py-2 transition-all duration-200 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/15 focus-within:bg-[#0f1f3a]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              rows={1}
              className="flex-1 min-w-0 bg-transparent text-[13px] text-white resize-none leading-relaxed placeholder:text-slate-500 focus:outline-none"
              style={{
                minHeight: "22px",
                maxHeight: "88px",
                overflowY: "hidden",
                outline: "none",
                border: "none",
                boxShadow: "none",
                WebkitBoxShadow: "none",
              }}
            />

            {/* Send button — inside the pill */}
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90
                disabled:bg-slate-700/60 disabled:text-slate-600 disabled:shadow-none disabled:cursor-not-allowed
                bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-400 hover:to-violet-500"
              aria-label="Send message"
            >
              {sending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} strokeWidth={2.2} />
              )}
            </button>
          </div>
        </div>

        {/* Hint */}
        <p className="text-[9px] text-slate-700 mt-1.5 pl-[38px] select-none">
          Shift+Enter for new line · Private to you &amp; admins
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   MAIN COMMENTBOX
───────────────────────────────────────────────────────── */
const CommentBox = ({ courseId, course, onOpenPrivateChat }) => {
  const [activeTab, setActiveTab] = useState("feedback");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [openReplies, setOpenReplies] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [highlightedComment, setHighlightedComment] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);

  const { adminChatUnread } = useNotifications();
  const adminUnread = adminChatUnread[courseId] || 0;

  const [userRating, setUserRating] = useState(() => {
    try {
      return (
        (JSON.parse(localStorage.getItem("userCourseRatings")) || {})[
          courseId
        ] || 0
      );
    } catch {
      return 0;
    }
  });

  const token = localStorage.getItem("token");
  const currentUser = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  }, [token]);
  const isInstructor = currentUser?.role === "instructor";

  const [liveUser, setLiveUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const sync = () => {
      try {
        setLiveUser(JSON.parse(localStorage.getItem("user")));
      } catch {
        setLiveUser(null);
      }
    };
    window.addEventListener("userUpdated", sync);
    return () => window.removeEventListener("userUpdated", sync);
  }, []);

  /* ── FETCH ── */
  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/${courseId}`);
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.comments || [];
      setComments(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── SOCKET ── */
  useEffect(() => {
    if (!courseId) return;
    fetchComments();
    socket.emit("joinCourse", courseId);
    socket.on("newComment", (c) => {
      if (c.courseId !== courseId) return;
      setComments((p) => (p.some((x) => x._id === c._id) ? p : [c, ...p]));
    });
    socket.on("updateComment", (u) =>
      setComments((p) => p.map((c) => (c._id === u._id ? u : c))),
    );
    socket.on("deleteComment", (id) =>
      setComments((p) =>
        p.filter((c) => c._id !== id && c.parentComment !== id),
      ),
    );
    socket.on("likeUpdated", (u) =>
      setComments((p) => p.map((c) => (c._id === u._id ? u : c))),
    );
    return () => {
      socket.emit("leaveCourse", courseId);
      ["newComment", "updateComment", "deleteComment", "likeUpdated"].forEach(
        (e) => socket.off(e),
      );
    };
  }, [courseId]);

  /* ── DEEP LINK ── */
  const location = useLocation();
  useEffect(() => {
    const cid = new URLSearchParams(location.search).get("comment");
    if (!cid || !comments.length) return;
    const target = comments.find((c) => c._id === cid);
    if (!target) return;
    if (target.parentComment)
      setOpenReplies((p) => ({ ...p, [target.parentComment]: true }));
    requestAnimationFrame(() =>
      setTimeout(() => {
        const el = document.getElementById(cid);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedComment(cid);
        setTimeout(() => setHighlightedComment(null), 3000);
      }, 300),
    );
  }, [location.search, comments]);

  /* ── RATING ── */
  const handleCourseRating = async (value) => {
    const prev = userRating;
    setUserRating(value);
    const existing =
      JSON.parse(localStorage.getItem("userCourseRatings")) || {};
    localStorage.setItem(
      "userCourseRatings",
      JSON.stringify({ ...existing, [courseId]: value }),
    );
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE}/api/ratings/rate`,
        { courseId, rating: value },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.data.success) throw new Error();
      showToast("Rating submitted");
    } catch {
      setUserRating(prev);
      showToast("Rating failed", "error");
    }
  };

  /* ── POST COMMENT ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return showToast("Comment cannot be empty", "error");
    if (!userRating && !isInstructor)
      return showToast("Please rate the course first", "error");
    try {
      await axios.post(
        API,
        { courseId, message },
        { timeout: 10000, headers: { Authorization: `Bearer ${token}` } },
      );
      setMessage("");
      showToast("Comment posted");
    } catch {
      showToast("Failed to post comment", "error");
    }
  };

  /* ── EDIT ── */
  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) return showToast("Comment cannot be empty", "error");
    const old = comments;
    setComments((p) =>
      p.map((c) => (c._id === commentId ? { ...c, message: editText } : c)),
    );
    try {
      await axios.put(
        `${API}/${commentId}`,
        { message: editText },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEditingId(null);
      setEditText("");
      showToast("Updated");
    } catch {
      setComments(old);
      showToast("Update failed", "error");
    }
  };

  /* ── DELETE ── */
  const handleDelete = async (commentId) => {
    const old = comments;
    setComments((p) =>
      p.filter((c) => c._id !== commentId && c.parentComment !== commentId),
    );
    try {
      await axios.delete(`${API}/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Deleted");
    } catch {
      setComments(old);
      showToast("Delete failed", "error");
    }
  };

  /* ── LIKE ── */
  const handleLike = async (id) => {
    const uid = currentUser?.id;
    const old = comments;
    setComments((p) =>
      p.map((c) => {
        if (c._id !== id) return c;
        const likes = c.likes || [];
        return {
          ...c,
          likes: likes.includes(uid)
            ? likes.filter((i) => i !== uid)
            : [...likes, uid],
        };
      }),
    );
    try {
      await axios.put(
        `${API}/like/${id}`,
        { type: "like" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch {
      setComments(old);
      showToast("Action failed", "error");
    }
  };

  /* ── PIN ── */
  const handlePin = async (commentId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE}/api/comments/pin/${commentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch {
      showToast("Pin failed", "error");
    }
  };

  /* ── HELPERS ── */
  const isOwner = (c) => {
    if (!currentUser) return false;
    const cId = c.userId?._id?.toString() || c.userId?.toString();
    const myId = currentUser?.id?.toString() || currentUser?._id?.toString();
    return cId === myId;
  };
  const hasLiked = (c) => c.likes?.includes(currentUser?.id);

  const isVisibleToCurrentUser = (comment) => {
    if (isInstructor) return true;
    if (comment.parentComment && comment.userId?.role === "instructor") {
      const myId = currentUser?.id?.toString() || currentUser?._id?.toString();
      let pid = comment.parentComment;
      for (let i = 0; i < 10; i++) {
        const par = comments.find((c) => c._id === pid);
        if (!par) break;
        if (!par.parentComment) {
          const rid = par.userId?._id?.toString() || par.userId?.toString();
          return rid === myId;
        }
        pid = par.parentComment;
      }
      return false;
    }
    return true;
  };

  const rootComments = useMemo(() => {
    const pinned = comments.filter((c) => !c.parentComment && c.isPinned);
    const unpinned = comments.filter((c) => !c.parentComment && !c.isPinned);
    return [...pinned, ...unpinned];
  }, [comments]);

  const getReplies = (id) =>
    comments.filter((c) => c.parentComment === id && isVisibleToCurrentUser(c));
  const toggleReplies = (id) => setOpenReplies((p) => ({ ...p, [id]: !p[id] }));

  const openThread = useCallback(
    (rootComment) => {
      if (!currentUser) return showToast("Please login first", "error");
      if (!onOpenPrivateChat) return;
      onOpenPrivateChat(rootComment.userId, rootComment);
    },
    [currentUser, onOpenPrivateChat],
  );

  /* ─────────────────────────────────────────
     COMMENT CARD
  ───────────────────────────────────────── */
  const CommentCard = ({ comment, isReply = false }) => {
    const commentIsInstructor = comment.userId?.role === "instructor";
    const avatarSrc = isOwner(comment)
      ? liveUser?.avatar || comment.userId?.avatar
      : comment.userId?.avatar;
    const name =
      comment.userId?.name ||
      comment.userId?.userName ||
      comment.userName ||
      "User";
    const email = comment.userId?.email;
    const replies = getReplies(comment._id);
    const repliesOpen = openReplies[comment._id];
    const isHighlighted = highlightedComment === comment._id;
    const myId = currentUser?.id?.toString() || currentUser?._id?.toString();
    const authorId =
      comment.userId?._id?.toString() || comment.userId?.toString();
    const isSelf = myId === authorId;

    return (
      <div
        id={comment._id}
        className={`rounded-2xl border transition-all duration-200 ${
          isReply
            ? "border-white/[0.05] bg-[#0a1628] ml-12"
            : "border-white/[0.07] bg-[#0b1525]"
        } ${isHighlighted ? "ring-2 ring-cyan-400/60" : ""}`}
      >
        <div className="p-4">
          {/* TOP ROW */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar src={avatarSrc} name={name} size={10} online />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{name}</span>
                  {commentIsInstructor && (
                    <span className="inline-flex items-center gap-0.5 rounded-full border border-indigo-500/40 bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                      <BadgeCheck size={9} /> Instructor
                    </span>
                  )}
                  {comment.isPinned && (
                    <span className="inline-flex items-center gap-0.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">
                      <Pin size={9} /> Pinned
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {email && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Mail size={9} /> {email}
                    </span>
                  )}
                  {course?.name && (
                    <span className="flex items-center gap-1 text-[11px] text-indigo-400/80">
                      <MessageCircle size={9} />
                      <span className="truncate max-w-[180px]">
                        {course.name}
                      </span>
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[11px] text-slate-600">
                    <Clock size={9} /> {fmtAgo(comment.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              <button
                onClick={() => handleLike(comment._id)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  hasLiked(comment)
                    ? "border-blue-500/40 bg-blue-500/15 text-blue-400"
                    : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-blue-500/30 hover:text-blue-400"
                }`}
              >
                <ThumbsUp size={13} />
                Like
                {(comment.likes?.length || 0) > 0 && (
                  <span className="ml-0.5 text-[10px]">
                    {comment.likes.length}
                  </span>
                )}
              </button>

              {isOwner(comment) && editingId !== comment._id && (
                <button
                  onClick={() => {
                    setEditingId(comment._id);
                    setEditText(comment.message);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-yellow-400 transition hover:border-yellow-500/30 hover:bg-yellow-500/10"
                >
                  <Edit3 size={13} /> Edit
                </button>
              )}

              {!isReply && onOpenPrivateChat && !isSelf && (
                <button
                  onClick={() => openThread(comment)}
                  className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-indigo-500/30 hover:text-indigo-300 hover:bg-indigo-500/10"
                >
                  <MessageSquare size={13} />
                  {replies.length > 0 ? `${replies.length} Replies` : "Reply"}
                </button>
              )}

              {isInstructor && (
                <button
                  onClick={() => handlePin(comment._id)}
                  className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
                    comment.isPinned
                      ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                      : "border-white/[0.08] bg-white/[0.03] text-slate-500 hover:text-yellow-400"
                  }`}
                  title={comment.isPinned ? "Unpin" : "Pin"}
                >
                  <Pin size={12} />
                </button>
              )}

              {(isOwner(comment) || isInstructor) && (
                <button
                  onClick={() => handleDelete(comment._id)}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 text-slate-600 transition hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* MESSAGE BODY */}
          <div className="mt-3 ml-[52px]">
            {editingId === comment._id ? (
              <div>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[60px] w-full rounded-xl border border-slate-700 bg-[#0F172A] p-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(comment._id)}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500 transition"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditText("");
                    }}
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-300 leading-relaxed break-words">
                {comment.message}
              </p>
            )}
          </div>

          {/* REPLIES TOGGLE */}
          {!isReply && replies.length > 0 && (
            <div className="mt-3 ml-[52px]">
              <button
                onClick={() => toggleReplies(comment._id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
              >
                <MessageCircle size={12} />
                {repliesOpen ? "Hide replies" : `${replies.length} replies`}
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${
                    repliesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* REPLY CARDS */}
        {!isReply && repliesOpen && replies.length > 0 && (
          <div className="border-t border-white/[0.05] px-4 py-3 space-y-3">
            {replies.map((r) => (
              <CommentCard key={r._id} comment={r} isReply />
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ─────────────────────────────────────────
     FEEDBACK TAB CONTENT
  ───────────────────────────────────────── */
  const FeedbackPanel = () => (
    <div
      className={`p-5 transition-all duration-300 ${
        isInstructor || userRating
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-50"
      }`}
    >
      {/* COMMENT FORM */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3 items-start">
          <Avatar
            src={liveUser?.avatar}
            name={liveUser?.name || currentUser?.name || ""}
            size={10}
            online
          />
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isInstructor
                  ? "Add an instructor comment or announcement…"
                  : "Add a comment…"
              }
              className="min-h-[60px] w-full rounded-xl border border-slate-700 bg-[#0F172A] p-4 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-600"
            />
            <div className="mt-3">
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-105 active:scale-95"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* COMMENTS LIST */}
      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm py-6">
          <Loader2 size={16} className="animate-spin text-indigo-400" />
          Loading comments…
        </div>
      ) : rootComments.length > 0 ? (
        <div className="space-y-3">
          {rootComments.map((c) =>
            isVisibleToCurrentUser(c) ? (
              <CommentCard key={c._id} comment={c} />
            ) : null,
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-700 py-12 text-center">
          <MessageCircle size={40} className="mx-auto mb-4 text-slate-600" />
          <h3 className="text-lg font-semibold text-white">No comments yet</h3>
          <p className="mt-2 text-sm text-slate-400">
            Be the first to share your feedback.
          </p>
        </div>
      )}
    </div>
  );

  /* ─────────────────────────────────────────
     MAIN RENDER
  ───────────────────────────────────────── */
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a1120] shadow-xl">
      {/* HEADER */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-[#0F172A] to-[#0a1120] px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Course Feedback
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Share your learning experience
            </p>
          </div>
          {!isInstructor && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const idx = i + 1;
                const active = idx <= (hoverRating || userRating);
                return (
                  <button
                    key={idx}
                    onClick={() => handleCourseRating(idx)}
                    onMouseEnter={() => setHoverRating(idx)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`transition-all duration-200 ${
                      active
                        ? "scale-110 text-yellow-400"
                        : "text-slate-600 hover:text-yellow-300"
                    }`}
                  >
                    <Star size={24} fill={active ? "currentColor" : "none"} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <TabSwitcher
          activeTab={activeTab}
          onChange={setActiveTab}
          adminUnread={adminUnread}
        />
      </div>

      {/* RATING GATE — always visible since feedback panel is always shown */}
      {!isInstructor && (
        <div className="border-b border-slate-800 bg-[#0B1120] px-6 py-4">
          {userRating ? (
            <div className="flex items-center gap-2 text-sm font-medium text-green-400">
              ⭐ Your rating: {userRating}/5
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <Lock size={16} /> Rate this course to unlock discussions
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT — Feedback always visible */}
      <FeedbackPanel />

      {/* ADMIN CHAT POPUP — renders as fixed overlay when tab is active */}
      {activeTab === "admin" && (
        <>
          {/* Backdrop blur overlay — click to close */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveTab("feedback")}
          />

          {/* Popup panel — centered on screen */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto w-full max-w-[531px] flex flex-col rounded-2xl border border-yellow-400/70 bg-[#0a1120] shadow-2xl shadow-black/70 overflow-hidden"
              style={{ height: "630px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <AdminChatPanel
                currentUser={currentUser}
                liveUser={liveUser}
                token={token}
                courseId={courseId}
                onClose={() => setActiveTab("feedback")}
              />
            </div>
          </div>
        </>
      )}

      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
          success: { style: { border: "1px solid #06b6d4" } },
          error: { style: { border: "1px solid #ef4444" } },
        }}
      />
    </div>
  );
};

export default CommentBox;
