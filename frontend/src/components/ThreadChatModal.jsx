import React, { useEffect, useRef, useState, useMemo } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import {
  X,
  RefreshCw,
  MessageSquareText,
  Send,
  Wifi,
  WifiOff,
  Mail,
  CalendarDays,
  MessageCircle,
  ThumbsUp,
  BookOpen,
} from "lucide-react";

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */
const API_BASE = import.meta.env.VITE_API_BASE;

const socket = io(API_BASE, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const fmtTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const fmtDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const fmtAgo = (date) => {
  if (!date) return "";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return fmtDate(date);
};

const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/* ─────────────────────────────────────────────
   ROLE BADGE
───────────────────────────────────────────── */
const RoleBadge = ({ role }) => {
  const map = {
    instructor: { label: "ADMIN", cls: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
    admin:      { label: "ADMIN", cls: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
    student:    { label: "STUDENT", cls: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  };
  const r = map[role?.toLowerCase()] || map.student;
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-widest ${r.cls}`}>
      {r.label}
    </span>
  );
};

/* ─────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────── */
const Avatar = ({ user, size = "md", online = false }) => {
  const sz = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-16 h-16 text-xl" }[size];
  const dot = { sm: "w-2 h-2", md: "w-2.5 h-2.5", lg: "w-3.5 h-3.5" }[size];

  return (
    <div className="relative shrink-0">
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          onError={(e) => { e.target.style.display = "none"; }}
          className={`${sz} rounded-full object-cover border-2 border-slate-700`}
        />
      ) : (
        <div className={`${sz} rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center font-bold text-white border-2 border-slate-700`}>
          {initials(user?.name || user?.userName || "?")}
        </div>
      )}
      {online && (
        <span className={`absolute bottom-0 right-0 ${dot} rounded-full bg-emerald-400 border-2 border-[#0b1220]`} />
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   Props:
     rootComment  – the original comment object (has courseId, message, userId, createdAt, likes, replies count)
     otherUser    – the user object of the person we're chatting with
     courseName   – string
     onClose      – fn
───────────────────────────────────────────── */
const ThreadChatModal = ({ rootComment, otherUser, courseName, onClose }) => {
  const token = localStorage.getItem("token");
  const currentUser = useMemo(() => {
    try { return token ? jwtDecode(token) : null; }
    catch { return null; }
  }, [token]);

  const [liveUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(socket.connected);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const roomId = rootComment?._id; // thread room = original comment id

  /* ── socket connect status ── */
  useEffect(() => {
    const onConnect    = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => { socket.off("connect", onConnect); socket.off("disconnect", onDisconnect); };
  }, []);

  /* ── join room & fetch replies ── */
  useEffect(() => {
    if (!roomId) return;

    const fetchReplies = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/comments/thread/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const replies = Array.isArray(data) ? data : data?.replies || [];
        setMessages(replies);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReplies();
    socket.emit("joinThread", roomId);

    socket.on("threadMessage", (msg) => {
      if (msg.parentComment !== roomId && msg.threadId !== roomId) return;
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.emit("leaveThread", roomId);
      socket.off("threadMessage");
    };
  }, [roomId, token]);

  /* ── scroll to bottom on new messages ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── send reply ── */
  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const optimistic = {
      _id: `opt-${Date.now()}`,
      message: text,
      parentComment: roomId,
      userId: {
        _id: currentUser?.id,
        name: liveUser?.name || currentUser?.name,
        avatar: liveUser?.avatar,
        role: currentUser?.role,
      },
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: rootComment?.courseId,
          message: text,
          parentComment: roomId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // replace optimistic with real
      setMessages((prev) =>
        prev.map((m) => (m._id === optimistic._id ? data.comment || data : m))
      );
    } catch {
      // remove optimistic on fail
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") onClose?.();
  };

  /* ── helpers ── */
  const isMe = (msg) => {
    const msgId = msg.userId?._id?.toString() || msg.userId?.toString();
    const myId  = currentUser?.id?.toString() || currentUser?._id?.toString();
    return msgId === myId;
  };

  const msgUserName = (msg) =>
    msg.userId?.name || msg.userId?.userName || msg.userName || "User";

  const msgRole = (msg) => msg.userId?.role || "student";

  const totalReplies = messages.length;
  const totalLikes   = rootComment?.likes?.length || 0;

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-full max-w-[860px] h-[90vh] max-h-[720px] flex rounded-[20px] overflow-hidden border border-white/[0.08] bg-[#0b1220] shadow-2xl shadow-black/60">

        {/* ══════════ LEFT PANEL — User Info ══════════ */}
        <div className="hidden sm:flex w-[260px] shrink-0 flex-col border-r border-white/[0.07] bg-[#080f1c] p-6 gap-5">

          {/* Avatar + name */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <Avatar user={otherUser} size="lg" online />
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {otherUser?.name || otherUser?.userName || "User"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                @{(otherUser?.name || otherUser?.userName || "user").replace(/\s+/g, "")}
              </p>
            </div>
            <RoleBadge role={otherUser?.role} />
          </div>

          <div className="border-t border-white/[0.06]" />

          {/* Course */}
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 mb-1.5 flex items-center gap-1.5">
              <BookOpen size={10} /> COURSE
            </p>
            <p className="text-sm font-semibold text-cyan-200 leading-snug">
              {courseName || "—"}
            </p>
          </div>

          {/* Email */}
          {otherUser?.email && (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Mail size={10} /> EMAIL
              </p>
              <p className="text-sm text-slate-300 break-all">{otherUser.email}</p>
            </div>
          )}

          {/* Posted */}
          {rootComment?.createdAt && (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-1.5">
                <CalendarDays size={10} /> POSTED
              </p>
              <p className="text-sm text-slate-300">{fmtDate(rootComment.createdAt)}</p>
              <p className="text-xs text-slate-600 mt-0.5">{fmtTime(rootComment.createdAt)}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3 text-center">
              <p className="text-2xl font-black text-indigo-300">{totalReplies}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
                <MessageCircle size={9} /> REPLIES
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3 text-center">
              <p className="text-2xl font-black text-pink-300">{totalLikes}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5 flex items-center justify-center gap-1">
                <ThumbsUp size={9} /> LIKES
              </p>
            </div>
          </div>

          {/* Connection status */}
          <div className={`rounded-xl border px-3 py-2 flex items-center gap-2 text-xs font-semibold ${connected ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" : "border-red-500/20 bg-red-500/5 text-red-400"}`}>
            {connected
              ? <><Wifi size={12} /> Live · Connected</>
              : <><WifiOff size={12} /> Disconnected</>
            }
          </div>
        </div>

        {/* ══════════ RIGHT PANEL — Thread Chat ══════════ */}
        <div className="flex flex-1 flex-col min-w-0">

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4 shrink-0">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
                <MessageSquareText size={15} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">Thread</span>
                  <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                    {totalReplies} msgs
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {rootComment?.message || courseName || "Thread"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => window.location.reload()}
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-2 text-slate-500 transition hover:text-white hover:bg-white/[0.06]"
              >
                <RefreshCw size={13} />
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-2 text-slate-500 transition hover:text-red-400 hover:bg-red-500/10"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1 overscroll-contain">

            {/* Original comment — always at top, left side */}
            {rootComment && (
              <>
                <MessageBubble
                  msg={{
                    ...rootComment,
                    userId: otherUser || rootComment.userId,
                  }}
                  isMe={false}
                  showName
                />
                {/* Divider */}
                <div className="flex items-center gap-3 py-3">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[10px] text-slate-600 font-medium">
                    ↳ {totalReplies} {totalReplies === 1 ? "reply" : "replies"}
                  </span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
              </>
            )}

            {/* Replies */}
            {loading ? (
              <div className="flex items-center justify-center py-10 text-slate-600 text-sm gap-2">
                <span className="w-4 h-4 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin" />
                Loading messages…
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquareText size={28} className="text-slate-700 mb-3" />
                <p className="text-slate-500 text-sm">No replies yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  msg={msg}
                  isMe={isMe(msg)}
                  showName
                />
              ))
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-white/[0.07] p-4 shrink-0">
            <div className="flex items-end gap-3">
              {/* My avatar */}
              <Avatar
                user={{ name: liveUser?.name || currentUser?.name, avatar: liveUser?.avatar }}
                size="sm"
                online
              />

              {/* Textarea */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Reply to ${otherUser?.name || otherUser?.userName || "User"}… (Ctrl+Enter to send)`}
                  rows={2}
                  className="w-full resize-none rounded-2xl border border-white/[0.08] bg-[#111c2e] px-4 py-3 pr-14 text-sm text-white placeholder-slate-600 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 leading-relaxed"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  {sending
                    ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Send size={13} />
                  }
                </button>
              </div>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-700">
              Ctrl+Enter to send · Esc to close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MESSAGE BUBBLE SUB-COMPONENT
───────────────────────────────────────────── */
const MessageBubble = ({ msg, isMe, showName }) => {
  const name = msg.userId?.name || msg.userId?.userName || msg.userName || "User";
  const role = msg.userId?.role || "student";
  const isAdmin = role === "instructor" || role === "admin";

  return (
    <div className={`flex items-end gap-2.5 mb-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className="shrink-0 mb-1">
        {msg.userId?.avatar ? (
          <img
            src={msg.userId.avatar}
            alt={name}
            onError={(e) => { e.target.style.display = "none"; }}
            className="w-9 h-9 rounded-full object-cover border-2 border-slate-700"
          />
        ) : (
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-slate-700 ${isAdmin ? "bg-gradient-to-br from-indigo-600 to-purple-700" : "bg-gradient-to-br from-slate-600 to-slate-700"}`}>
            {initials(name)}
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col max-w-[65%] ${isMe ? "items-end" : "items-start"}`}>
        {/* Name row */}
        {showName && (
          <div className={`flex items-center gap-2 mb-1.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
            {isAdmin && (
              <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[9px] font-bold text-indigo-300 tracking-widest">
                ADMIN
              </span>
            )}
            <span className="text-xs font-semibold text-slate-300">{name}</span>
            {isMe && (
              <span className="text-[10px] font-semibold text-slate-500">You</span>
            )}
            <span className="text-[10px] text-slate-600">{fmtAgo(msg.createdAt)}</span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
            isMe
              ? "bg-indigo-600 text-white rounded-tr-sm shadow-lg shadow-indigo-900/30"
              : "bg-[#1a2540] text-slate-200 rounded-tl-sm border border-white/[0.06]"
          } ${msg._optimistic ? "opacity-70" : ""}`}
        >
          {msg.message}
        </div>

        {/* Time */}
        <p className="mt-1 text-[10px] text-slate-600 px-1">
          {fmtTime(msg.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default ThreadChatModal;
