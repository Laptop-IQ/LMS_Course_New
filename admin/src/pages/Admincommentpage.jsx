import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import API from "../api/adminApi";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import {
  MessageSquare,
  Send,
  X,
  Search,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  Mail,
  Calendar,
  RefreshCw,
  MessageCircle,
  ThumbsUp,
  Trash2,
  Pencil,
  Filter,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
  Zap,
  Users,
  Hash,
  CornerDownRight,
  MoreHorizontal,
  ShieldCheck,
  Inbox,
  ChevronLeft,
  Check,
  CheckCheck,
  AlertTriangle,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (date) => {
  if (!date) return { rel: "—", full: "—", time: "" };
  const d = new Date(date),
    diff = Math.floor((Date.now() - d) / 1000);
  const rel =
    diff < 60
      ? "Just now"
      : diff < 3600
        ? `${Math.floor(diff / 60)}m ago`
        : diff < 86400
          ? `${Math.floor(diff / 3600)}h ago`
          : diff < 172800
            ? "Yesterday"
            : diff < 604800
              ? `${Math.floor(diff / 86400)}d ago`
              : d.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                });
  const full = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { rel, full, time };
};

const initials = (n) => {
  if (!n) return "?";
  const p = n.trim().split(" ");
  return p.length >= 2
    ? (p[0][0] + p[p.length - 1][0]).toUpperCase()
    : n.slice(0, 2).toUpperCase();
};

const AVATAR_PALETTE = [
  {
    bg: "from-violet-500/40 to-violet-900/60",
    border: "border-violet-500/50",
    text: "text-violet-200",
  },
  {
    bg: "from-blue-500/40 to-blue-900/60",
    border: "border-blue-500/50",
    text: "text-blue-200",
  },
  {
    bg: "from-emerald-500/40 to-emerald-900/60",
    border: "border-emerald-500/50",
    text: "text-emerald-200",
  },
  {
    bg: "from-amber-500/40 to-amber-900/60",
    border: "border-amber-500/50",
    text: "text-amber-200",
  },
  {
    bg: "from-rose-500/40 to-rose-900/60",
    border: "border-rose-500/50",
    text: "text-rose-200",
  },
  {
    bg: "from-cyan-500/40 to-cyan-900/60",
    border: "border-cyan-500/50",
    text: "text-cyan-200",
  },
  {
    bg: "from-pink-500/40 to-pink-900/60",
    border: "border-pink-500/50",
    text: "text-pink-200",
  },
  {
    bg: "from-indigo-500/40 to-indigo-900/60",
    border: "border-indigo-500/50",
    text: "text-indigo-200",
  },
  {
    bg: "from-teal-500/40 to-teal-900/60",
    border: "border-teal-500/50",
    text: "text-teal-200",
  },
  {
    bg: "from-orange-500/40 to-orange-900/60",
    border: "border-orange-500/50",
    text: "text-orange-200",
  },
];

const getAvatar = (name) => {
  if (!name) return AVATAR_PALETTE[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
};

// ─── Resolve admin avatar from localStorage ─────────────────────────────────
const getAdminAvatar = () => {
  try {
    const u = JSON.parse(localStorage.getItem("adminUser"));
    return u?.avatar || u?.profilePic || null;
  } catch {
    return null;
  }
};

const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.courses)) return data.courses;
  if (Array.isArray(data?.comments)) return data.comments;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.messages)) return data.messages;
  if (data && typeof data === "object") {
    for (const v of Object.values(data)) if (Array.isArray(v)) return v;
  }
  return [];
};

const getParentId = (parentComment) => {
  if (!parentComment) return null;
  if (typeof parentComment === "string") return parentComment;
  if (typeof parentComment === "object")
    return parentComment._id?.toString() ?? String(parentComment);
  return null;
};

// ─── Toast Styles ──────────────────────────────────────────────────────────────
const TS = {
  base: {
    background: "#0d1020",
    color: "#e2e8f0",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    fontSize: "13px",
    fontWeight: "600",
    padding: "12px 16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
  },
  success: {
    background: "#0d1020",
    color: "#e2e8f0",
    border: "1px solid rgba(52,211,153,0.25)",
    borderRadius: "16px",
    fontSize: "13px",
    fontWeight: "600",
    padding: "12px 16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 16px rgba(52,211,153,0.08)",
  },
  error: {
    background: "#0d1020",
    color: "#e2e8f0",
    border: "1px solid rgba(248,113,113,0.25)",
    borderRadius: "16px",
    fontSize: "13px",
    fontWeight: "600",
    padding: "12px 16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 16px rgba(239,68,68,0.08)",
  },
  info: {
    background: "#0d1020",
    color: "#e2e8f0",
    border: "1px solid rgba(99,102,241,0.25)",
    borderRadius: "16px",
    fontSize: "13px",
    fontWeight: "600",
    padding: "12px 16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 16px rgba(99,102,241,0.08)",
  },
};

// ─── Confirm Dialog ────────────────────────────────────────────────────────────
const confirmToast = ({
  title,
  desc,
  confirmLabel = "Confirm",
  danger = true,
  onConfirm,
}) => {
  toast(
    (t) => (
      <div className="flex flex-col gap-2.5">
        <p className="text-[13px] font-bold text-white">{title}</p>
        {desc && <p className="text-[11px] text-white/40">{desc}</p>}
        <div className="flex gap-2 mt-0.5">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await onConfirm();
            }}
            className={`px-4 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${danger ? "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30" : "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30"}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-1.5 rounded-xl text-[11px] font-bold bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    { style: { ...TS.error, padding: "14px 16px" }, duration: 10000 },
  );
};

// ─── Avatar ────────────────────────────────────────────────────────────────────
// FIX: Added `src` prop — shows real photo when available, falls back to initials
const Avatar = ({ name, src, size = 36, isAdmin = false, online = false }) => {
  const [imgError, setImgError] = useState(false);
  const pal = isAdmin
    ? {
        bg: "from-indigo-400/50 to-indigo-800/70",
        border: "border-indigo-400/60",
        text: "text-indigo-100",
      }
    : getAvatar(name || "");

  const showImg = src && !imgError;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {showImg ? (
        <img
          src={src}
          alt={name || "avatar"}
          onError={() => setImgError(true)}
          className="w-full h-full rounded-full object-cover"
          style={{
            border: `2px solid`,
            borderColor: isAdmin
              ? "rgba(129,140,248,0.5)"
              : "rgba(255,255,255,0.12)",
          }}
        />
      ) : (
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br ${pal.bg} border-2 ${pal.border} flex items-center justify-center font-black`}
          style={{ fontSize: Math.max(10, Math.round(size * 0.33)) }}
        >
          <span className={pal.text}>
            {isAdmin ? "AD" : initials(name || "")}
          </span>
        </div>
      )}
      {online && (
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
      )}
    </div>
  );
};

// ─── Message Context Menu ──────────────────────────────────────────────────────
const MessageContextMenu = ({ x, y, isAdmin, onEdit, onDelete, onClose }) => {
  const menuRef = useRef(null);
  useEffect(() => {
    const h1 = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    const h2 = (e) => {
      if (e.key === "Escape") onClose();
    };
    setTimeout(() => {
      document.addEventListener("mousedown", h1);
      document.addEventListener("keydown", h2);
    }, 0);
    return () => {
      document.removeEventListener("mousedown", h1);
      document.removeEventListener("keydown", h2);
    };
  }, [onClose]);

  const menuW = 156,
    menuH = isAdmin ? 96 : 48;
 const clampedX = Math.max(8, x - menuW);
 const clampedY = Math.min(y, window.innerHeight - menuH - 8);

  return (
    <div
      ref={menuRef}
      className="fixed z-[99999] animate-popIn"
      style={{ left: clampedX, top: clampedY }}
    >
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "rgba(10,13,26,0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          minWidth: menuW,
        }}
      >
        {isAdmin && (
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold text-amber-300 hover:bg-amber-500/12 transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <Pencil size={11} className="text-amber-400" />
            </div>
            Edit message
          </button>
        )}
        {isAdmin && <div className="h-px bg-white/5 mx-3" />}
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold text-red-400 hover:bg-red-500/12 transition-colors"
        >
          <div className="w-6 h-6 rounded-lg bg-red-500/15 flex items-center justify-center">
            <Trash2 size={11} className="text-red-400" />
          </div>
          Delete message
        </button>
      </div>
    </div>
  );
};

// ─── Chat Bubble ──────────────────────────────────────────────────────────────
const ChatBubble = ({ msg, isAdmin, isNew = false, onEdit, onDelete }) => {
  const dt = fmt(msg.createdAt);
  const name = isAdmin
    ? msg.senderName || "Admin"
    : msg.senderName || msg.senderId?.name || "Student";
  const pal = getAvatar(name);
  const [menu, setMenu] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.message || "");
  const [saving, setSaving] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const editRef = useRef(null);

  // FIX: Resolve avatar src for non-admin (student) messages
  const studentAvatarSrc = !isAdmin
    ? msg.senderAvatar || msg.senderId?.avatar || msg.userAvatar || null
    : null;

  const handleContextMenu = (e) => {
    if (!onEdit && !onDelete) return;
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  const longPressTimer = useRef(null);
  const handleTouchStart = (e) => {
    if (!onEdit && !onDelete) return;
    longPressTimer.current = setTimeout(() => {
      const touch = e.touches[0];
      setMenu({ x: touch.clientX, y: touch.clientY });
    }, 500);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleDotClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenu({ x: rect.right - 156, y: rect.bottom + 4 });
  };

  const handleEditSave = async () => {
    if (!editText.trim() || editText.trim() === msg.message?.trim()) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onEdit?.(msg._id, editText.trim());
      setIsEditing(false);
    } catch {
      toast.error("Update failed.", { style: TS.error });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    confirmToast({
      title: "Delete this message?",
      desc: "This action cannot be undone.",
      confirmLabel: "Delete",
      onConfirm: async () => {
        const lid = toast.loading("Deleting…", { style: TS.base });
        try {
          await onDelete?.(msg._id);
          setDeleted(true);
          toast.dismiss(lid);
          toast.success("Deleted ✓", { style: TS.success });
        } catch {
          toast.dismiss(lid);
          toast.error("Delete failed.", { style: TS.error });
        }
      },
    });
  };

  if (deleted) return null;

  return (
    <>
      {menu && (
        <MessageContextMenu
          x={menu.x}
          y={menu.y}
          isAdmin={!!onEdit}
          onEdit={() => {
            setIsEditing(true);
            setEditText(msg.message || "");
          }}
          onDelete={handleDeleteClick}
          onClose={() => setMenu(null)}
        />
      )}
      <div
        className={`flex gap-2.5 items-end mb-3 group ${isAdmin ? "flex-row-reverse" : "flex-row"} ${isNew ? "animate-slideIn" : ""}`}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
      >
        {/* FIX: Pass src for student avatar; admin shows initials "AD" */}
        <Avatar
          name={name}
          src={isAdmin ? getAdminAvatar() : studentAvatarSrc}
          size={40}
          isAdmin={isAdmin}
          online={isAdmin}
        />
        <div className="max-w-[75%]">
          <div
            className={`flex items-center gap-2 mb-1 ${isAdmin ? "justify-end" : "justify-start"}`}
          >
            {isAdmin && (
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-black uppercase tracking-widest">
                ADMIN
              </span>
            )}
            <span
              className={`text-[11px] font-bold ${isAdmin ? "text-indigo-300" : pal.text}`}
            >
              {isAdmin ? "You" : name}
            </span>
            <span className="text-[10px] text-white/20">{dt.rel}</span>
          </div>

          <div className="relative group/bubble">
            {(onEdit || onDelete) && !isEditing && (
              <button
                onClick={handleDotClick}
                className={`absolute top-1.5 z-10 opacity-0 group-hover/bubble:opacity-100 transition-all duration-150 w-6 h-6 rounded-full bg-[#0a0d1a]/90 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/25 ${isAdmin ? "-left-7" : "-right-7"}`}
              >
                <MoreHorizontal size={12} />
              </button>
            )}

            {isEditing ? (
              <div
                className={`rounded-2xl overflow-hidden border ${isAdmin ? "border-amber-500/35 bg-amber-500/5" : "border-indigo-500/25 bg-indigo-500/5"}`}
                style={{ minWidth: 200 }}
              >
                <div className="px-1 pt-1">
                  <textarea
                    ref={editRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                        handleEditSave();
                      if (e.key === "Escape") setIsEditing(false);
                    }}
                    autoFocus
                    rows={2}
                    className="w-full bg-transparent px-3 py-2 text-[13px] text-white resize-none outline-none leading-relaxed placeholder-white/20"
                    style={{ minHeight: 48, maxHeight: 120 }}
                    onInput={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-2 border-t border-white/6">
                  <span className="text-[9px] text-white/20">
                    Ctrl+Enter to save · Esc to cancel
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white/35 hover:text-white/60 hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditSave}
                      disabled={
                        saving ||
                        !editText.trim() ||
                        editText.trim() === msg.message?.trim()
                      }
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 disabled:opacity-30 hover:bg-amber-500/30 transition-all"
                    >
                      {saving ? (
                        <div className="w-2.5 h-2.5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                      ) : (
                        <Check size={10} />
                      )}
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`relative px-3.5 py-2.5 ${isAdmin ? "rounded-[14px_4px_14px_14px] bg-gradient-to-br from-indigo-500/20 via-indigo-600/10 to-indigo-900/20 border border-indigo-500/30" : "rounded-[4px_14px_14px_14px] bg-gradient-to-br from-white/6 to-white/3 border border-white/10"} shadow-md select-text`}
              >
                {isNew && (
                  <div className="absolute -top-1 -right-1">
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                  </div>
                )}
                <p
                  className={`text-[13px] leading-relaxed break-words ${isAdmin ? "text-indigo-100" : "text-white/80"}`}
                >
                  {msg.message}
                </p>
              </div>
            )}
          </div>

          <div
            className={`flex items-center gap-1.5 mt-1 ${isAdmin ? "justify-end" : "justify-start"}`}
          >
            {msg.edited && (
              <span className="text-[9px] text-white/20 italic">edited</span>
            )}
            <p className="text-[9px] text-white/15">{dt.time}</p>
            {isAdmin && <CheckCheck size={10} className="text-indigo-400/40" />}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Thread Modal ──────────────────────────────────────────────────────────────
const ThreadModal = ({ comment, courseId, onClose, onReplySent }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [newMsgIds, setNewMsgIds] = useState(new Set());
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const textareaRef = useRef(null);

  const fetchReplies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/api/comments/${courseId}`);
      const all = extractArray(res.data);
      const threadIds = new Set([comment._id.toString()]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const c of all) {
          const pid = getParentId(c.parentComment);
          if (pid && threadIds.has(pid) && !threadIds.has(c._id.toString())) {
            threadIds.add(c._id.toString());
            changed = true;
          }
        }
      }
      const allReplies = all.filter(
        (c) =>
          threadIds.has(c._id.toString()) &&
          c._id.toString() !== comment._id.toString(),
      );
      setReplies(
        allReplies.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        ),
      );
    } catch {
      toast.error("Failed to load replies.", { style: TS.error });
    } finally {
      setLoading(false);
    }
  }, [courseId, comment._id]);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_BASE || "", {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("newComment", (c) => {
      const parentId = getParentId(c.parentComment);
      if (!parentId) return;
      const isAdminMsg =
        c.isAdminReply === true ||
        c._isAdminReply === true ||
        c.userRole === "admin" ||
        c.role === "admin";
      const commentIdStr = comment._id.toString();
      setReplies((prev) => {
        const threadIds = new Set([
          commentIdStr,
          ...prev.map((r) => r._id.toString()),
        ]);
        if (!threadIds.has(parentId)) return prev;
        if (prev.some((r) => r._id === c._id)) return prev;
        const enriched = { ...c, message: c.message || c.text || "" };
        setNewMsgIds((ids) => new Set([...ids, c._id]));
        setTimeout(
          () =>
            setNewMsgIds((ids) => {
              const n = new Set(ids);
              n.delete(c._id);
              return n;
            }),
          4000,
        );
        if (!isAdminMsg)
          toast(`💬 ${c.userName || "Student"} replied`, {
            style: TS.info,
            duration: 3000,
          });
        return [...prev, enriched].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );
      });
    });
    socket.on("updateComment", (u) =>
      setReplies((p) => p.map((r) => (r._id === u._id ? { ...r, ...u } : r))),
    );
    socket.on("deleteComment", (id) => {
      if (!id) return;
      setReplies((p) => p.filter((r) => r._id !== id));
    });
    return () => socket.disconnect();
  }, [comment._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies, loading]);
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const handleEditReply = async (msgId, newText) => {
    const res = await API.put(`/api/comments/admin/${msgId}`, {
      message: newText,
    });
    setReplies((prev) =>
      prev.map((r) =>
        r._id === msgId
          ? {
              ...r,
              message: res.data.comment?.message ?? newText,
              edited: true,
            }
          : r,
      ),
    );
    toast.success("Updated ✓", { style: TS.success });
  };

  const handleDeleteReply = async (msgId) => {
    await API.delete(`/api/comments/admin/${msgId}`);
    setReplies((prev) => prev.filter((r) => r._id !== msgId));
  };

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const optimisticId = `opt_${Date.now()}`;
    const optimistic = {
      _id: optimisticId,
      message: text.trim(),
      userName: "Admin",
      userRole: "admin",
      isAdminReply: true,
      _isAdminReply: true,
      createdAt: new Date().toISOString(),
      parentComment: comment._id,
    };
    setReplies((prev) => [...prev, optimistic]);
    const sentText = text.trim();
    setText("");
    const lid = toast.loading("Sending…", { style: TS.base });
    try {
      const res = await API.post(`/api/comments/admin/${courseId}/reply`, {
        commentId: comment._id,
        message: sentText,
        studentId: comment.userId?._id || comment.userId,
      });
      const realMsg = res?.data?.comment || res?.data?.reply || res?.data;
      if (realMsg?._id) {
        setReplies((prev) =>
          prev.map((r) =>
            r._id === optimisticId
              ? { ...realMsg, isAdminReply: true, _isAdminReply: true }
              : r,
          ),
        );
      } else {
        await fetchReplies();
      }
      toast.dismiss(lid);
      toast.success("Reply sent ✓", { style: TS.success, duration: 3000 });
      onReplySent?.();
      textareaRef.current?.focus();
    } catch {
      setReplies((prev) => prev.filter((r) => r._id !== optimisticId));
      setText(sentText);
      toast.dismiss(lid);
      toast.error("Send failed.", { style: TS.error });
    } finally {
      setSending(false);
    }
  };

  const studentName = comment.userName || comment.userId?.username || "Student";
  // FIX: Resolve student avatar for ThreadModal left panel
  const studentAvatar =
    comment.userId?.avatar ||
    comment.userAvatar ||
    comment.senderAvatar ||
    null;
  const dt = fmt(comment.createdAt);
  const allMsgs = [{ ...comment, isRoot: true }, ...replies];
  const pal = getAvatar(studentName);

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{
        background: "rgba(2,4,12,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full bg-[#0a0d1a] border border-white/8 rounded-3xl flex overflow-hidden shadow-2xl animate-modalIn"
        style={{
          maxWidth: 860,
          height: "88vh",
          maxHeight: 760,
          boxShadow:
            "0 0 0 1px rgba(99,102,241,0.15), 0 40px 80px rgba(0,0,0,0.8)",
        }}
      >
        {/* Left panel */}
        <div className="w-64 shrink-0 border-r border-white/6 flex flex-col bg-gradient-to-b from-white/2 to-transparent">
          <div
            className={`h-1 bg-gradient-to-r ${pal.bg.replace("/40", "").replace("/60", "")} opacity-80`}
          />
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="flex flex-col items-center text-center mb-6 pt-2">
              <div className="relative mb-3">
                {/* FIX: Pass real student avatar src */}
                <Avatar
                  name={studentName}
                  src={studentAvatar}
                  size={90}
                  online
                />
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${pal.bg} opacity-20 blur-lg scale-125`}
                />
              </div>
              <h3 className="text-[15px] font-black text-white mb-0.5">
                {studentName}
              </h3>
              {comment.userId?.username && (
                <p className="text-[11px] text-indigo-400 mb-1">
                  @{comment.userId.username}
                </p>
              )}
              <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/12 text-emerald-300 border border-emerald-500/20 uppercase tracking-widest">
                Student
              </span>
            </div>
            <div className="space-y-2.5">
              {comment.courseName && (
                <div className="p-3 rounded-2xl bg-cyan-500/6 border border-cyan-500/15">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen size={10} className="text-cyan-400" />
                    <p className="text-[9px] text-white/25 uppercase tracking-wider">
                      Course
                    </p>
                  </div>
                  <p className="text-[12px] font-semibold text-cyan-300 leading-tight">
                    {comment.courseName}
                  </p>
                </div>
              )}
              {comment.userId?.email && (
                <div className="p-3 rounded-2xl bg-blue-500/6 border border-blue-500/15">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail size={10} className="text-blue-400" />
                    <p className="text-[9px] text-white/25 uppercase tracking-wider">
                      Email
                    </p>
                  </div>
                  <p className="text-[11px] text-blue-300 break-all">
                    {comment.userId.email}
                  </p>
                </div>
              )}
              <div className="p-3 rounded-2xl bg-white/3 border border-white/6">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={10} className="text-white/30" />
                  <p className="text-[9px] text-white/25 uppercase tracking-wider">
                    Posted
                  </p>
                </div>
                <p className="text-[11px] text-white/50">{dt.full}</p>
                <p className="text-[11px] text-white/30">{dt.time}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-indigo-500/8 border border-indigo-500/15 text-center">
                  <p className="text-[18px] font-black text-indigo-400">
                    {replies.length}
                  </p>
                  <p className="text-[9px] text-white/25 uppercase tracking-wider">
                    Replies
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/8 border border-blue-500/15 text-center">
                  <p className="text-[18px] font-black text-blue-400">
                    {comment.likes?.length || 0}
                  </p>
                  <p className="text-[9px] text-white/25 uppercase tracking-wider">
                    Likes
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-2 p-2.5 rounded-xl border ${connected ? "bg-emerald-500/6 border-emerald-500/15" : "bg-red-500/6 border-red-500/15"}`}
              >
                {connected ? (
                  <>
                    <Wifi size={10} className="text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      Live · Connected
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff size={10} className="text-red-400" />
                    <span className="text-[10px] text-red-400 font-semibold">
                      Disconnected
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-4 border-b border-white/6 flex items-center gap-3 shrink-0 bg-white/1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                <MessageSquare size={14} className="text-indigo-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-black text-white">Thread</p>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                    {allMsgs.length} msg{allMsgs.length !== 1 ? "s" : ""}
                  </span>
                  {connected && (
                    <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{" "}
                      Live
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-white/30 truncate">
                  {comment.courseName || "Course"} · {dt.rel}
                </p>
              </div>
            </div>
            <button
              onClick={fetchReplies}
              disabled={loading}
              className="w-8 h-8 rounded-xl border border-white/8 bg-white/4 text-white/30 flex items-center justify-center hover:bg-indigo-500/10 hover:text-indigo-400 transition-all disabled:opacity-40 shrink-0"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-white/8 bg-white/4 text-white/30 flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-all shrink-0"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
            {loading ? (
              <div className="space-y-4 pt-2">
                {[40, 60, 45].map((w, i) => (
                  <div
                    key={i}
                    className={`flex gap-2.5 items-end ${i % 2 === 1 ? "flex-row-reverse" : ""}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-white/5 animate-pulse shrink-0" />
                    <div
                      className="rounded-2xl bg-white/4 animate-pulse"
                      style={{ width: `${w}%`, height: 52 }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 py-3 mb-2">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[10px] text-white/20 font-semibold px-3 py-1 rounded-full border border-white/6 bg-white/2">
                    Thread started · {dt.full}
                  </span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
                {allMsgs.map((msg, i) => {
                  const isAdminMsg =
                    msg.isAdminReply === true ||
                    msg._isAdminReply === true ||
                    msg.userRole === "admin" ||
                    msg.role === "admin" ||
                    msg.userId?.role === "admin" ||
                    msg.isAdmin === true ||
                    (msg.userName &&
                      ["admin", "administrator", "you", "ad"].includes(
                        msg.userName.toLowerCase().trim(),
                      ));
                  return (
                    <div key={msg._id || i}>
                      {msg.isRoot && i === 0 && (
                        <div className="mb-2">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Hash size={9} className="text-white/20" />
                            <span className="text-[9px] text-white/25 uppercase tracking-widest font-bold">
                              Original Comment
                            </span>
                          </div>
                        </div>
                      )}
                      {i === 1 && replies.length > 0 && (
                        <div className="flex items-center gap-3 py-3">
                          <div className="flex-1 h-px bg-white/5" />
                          <span className="text-[10px] text-white/20 px-2">
                            <CornerDownRight
                              size={10}
                              className="inline mr-1 opacity-50"
                            />
                            {replies.length}{" "}
                            {replies.length === 1 ? "reply" : "replies"}
                          </span>
                          <div className="flex-1 h-px bg-white/5" />
                        </div>
                      )}
                      <ChatBubble
                        msg={msg}
                        isAdmin={isAdminMsg}
                        isNew={newMsgIds.has(msg._id)}
                        onEdit={
                          isAdminMsg && !msg.isRoot
                            ? handleEditReply
                            : undefined
                        }
                        onDelete={
                          isAdminMsg && !msg.isRoot
                            ? handleDeleteReply
                            : undefined
                        }
                      />
                    </div>
                  );
                })}
                <div ref={bottomRef} className="h-2" />
              </>
            )}
          </div>

          <div className="px-4 py-3.5 border-t border-white/6 bg-black/30 shrink-0">
            <div className="flex gap-3 items-end">
              <Avatar name="Admin" src={getAdminAvatar()} size={34} isAdmin online />
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send();
                  }}
                  placeholder={`Reply to ${studentName}… (Ctrl+Enter to send)`}
                  rows={2}
                  className="w-full bg-white/4 border border-white/8 rounded-2xl px-4 py-3 text-[13px] text-white resize-none outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all placeholder-white/18 leading-relaxed pr-24"
                  style={{ minHeight: 56 }}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
                  {text && (
                    <button
                      onClick={() => setText("")}
                      className="p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/6 transition-all"
                    >
                      <X size={11} />
                    </button>
                  )}
                  <button
                    onClick={send}
                    disabled={!text.trim() || sending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/35 disabled:opacity-30 hover:bg-indigo-500/30 transition-all"
                  >
                    {sending ? (
                      <div className="w-3 h-3 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    ) : (
                      <Send size={11} />
                    )}
                    {sending ? "…" : "Send"}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-white/15 mt-2 ml-[46px]">
              Ctrl+Enter to send · Esc to close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Modal ────────────────────────────────────────────────────────────────
const EditModal = ({ comment, onClose, onSave }) => {
  const [text, setText] = useState(comment.message || "");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSave = async () => {
    if (!text.trim() || text.trim() === comment.message?.trim()) return;
    setSaving(true);
    const lid = toast.loading("Saving…", { style: TS.base });
    try {
      await onSave(comment._id, text.trim());
      toast.dismiss(lid);
      toast.success("Updated ✓", { style: TS.success });
      onClose();
    } catch {
      toast.dismiss(lid);
      toast.error("Update failed.", { style: TS.error });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: "rgba(2,4,12,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#0a0d1a] border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl animate-modalIn">
        <div className="h-0.5 bg-gradient-to-r from-amber-400 via-amber-500/50 to-transparent" />
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <Pencil size={14} className="text-amber-400" />
              </div>
              <h3 className="text-[16px] font-black text-white">
                Edit Comment
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-white/8 bg-white/4 text-white/30 flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <X size={13} />
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            autoFocus
            className="w-full bg-white/4 border border-white/8 rounded-2xl px-4 py-3 text-[13px] text-white resize-none outline-none focus:border-amber-500/40 transition-all placeholder-white/20 leading-relaxed mb-4"
          />
          <div className="flex justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[12px] font-semibold text-white/40 bg-transparent border border-white/8 hover:text-white/65 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={
                !text.trim() ||
                saving ||
                text.trim() === comment.message?.trim()
              }
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[12px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 disabled:opacity-35 hover:bg-amber-500/25 transition-all"
            >
              <Pencil size={11} /> {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Comment Card ──────────────────────────────────────────────────────────────
const CommentCard = ({
  comment,
  index,
  onOpen,
  onDelete,
  onEdit,
  onLike,
  isHighlighted,
}) => {
  const name = comment.userName || comment.userId?.username || "Student";
  const pal = getAvatar(name);
  const dt = fmt(comment.createdAt);
  const hasReplies = (comment.replyCount || 0) > 0;
  const [showFull, setShowFull] = useState(false);
  const isLong = (comment.message || "").length > 200;

  // FIX: Resolve student avatar for comment cards
  const avatarSrc =
    comment.userId?.avatar ||
    comment.userAvatar ||
    comment.senderAvatar ||
    null;

  return (
    <div
      id={`comment-${comment._id}`}
      className={`group rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 ${isHighlighted ? "bg-indigo-500/10 border border-indigo-500/35 shadow-lg" : "bg-[#0d1020] border border-white/6 hover:border-white/10"}`}
      style={{
        animationDelay: `${index * 0.04}s`,
        boxShadow: isHighlighted
          ? "0 0 0 1px rgba(99,102,241,0.2), 0 8px 32px rgba(99,102,241,0.12)"
          : "0 2px 8px rgba(0,0,0,0.4)",
      }}
    >
      <div
        className={`h-0.5 bg-gradient-to-r ${pal.bg.replace("/40", "").replace("/60", "")} opacity-50`}
      />
      <div className="p-4">
        <div className="flex gap-3">
          {/* FIX: Pass real avatar src */}
          <Avatar name={name} src={avatarSrc} size={42} online />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-[14px] font-black text-white">
                    {name}
                  </span>
                  {comment.userId?.email && (
                    <span className="text-[10px] text-white/25 font-mono">
                      {comment.userId.email}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {comment.courseName && (
                    <div className="flex items-center gap-1">
                      <BookOpen size={9} className="text-cyan-400" />
                      <span className="text-[10px] text-cyan-400 font-semibold truncate max-w-[200px]">
                        {comment.courseName}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock size={9} className="text-white/20" />
                    <span className="text-[10px] text-white/25">{dt.rel}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                <button
                  onClick={() => onLike(comment._id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-blue-500/8 border border-blue-500/20 text-blue-400 hover:bg-blue-500/18 transition-all"
                >
                  <ThumbsUp size={10} />{" "}
                  {comment.likes?.length > 0 ? comment.likes.length : "Like"}
                </button>
                <button
                  onClick={() => onEdit(comment)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/8 border border-amber-500/20 text-amber-400 hover:bg-amber-500/18 transition-all"
                >
                  <Pencil size={10} /> Edit
                </button>
                <button
                  onClick={() => onOpen(comment)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-500/12 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/22 transition-all"
                >
                  <MessageSquare size={10} />{" "}
                  {hasReplies ? `${comment.replyCount} Replies` : "Reply"}
                </button>
                <button
                  onClick={() => onDelete(comment._id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-red-500/8 border border-red-500/20 text-red-400 hover:bg-red-500/18 transition-all"
                >
                  <Trash2 size={10} /> Delete
                </button>
              </div>
            </div>
            <div
              className="px-4 py-3 rounded-2xl bg-white/3 border border-white/6 mb-2.5"
              style={{ borderLeft: "3px solid rgba(99,102,241,0.3)" }}
            >
              <p
                className={`text-[13px] text-white/65 leading-relaxed ${!showFull && isLong ? "line-clamp-3" : ""}`}
              >
                {comment.message}
              </p>
              {isLong && (
                <button
                  onClick={() => setShowFull((p) => !p)}
                  className="flex items-center gap-1 mt-2 text-[10px] text-white/30 hover:text-white/60 transition-colors font-semibold"
                >
                  {showFull ? (
                    <>
                      <ChevronUp size={10} /> Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown size={10} /> Read more
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {comment.likes?.length > 0 && (
                <div className="flex items-center gap-1">
                  <ThumbsUp
                    size={10}
                    className="text-blue-400 fill-blue-400/30"
                  />
                  <span className="text-[10px] text-white/30 font-semibold">
                    {comment.likes.length}
                  </span>
                </div>
              )}
              {hasReplies && (
                <div className="flex items-center gap-1">
                  <MessageCircle size={10} className="text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {comment.replyCount}{" "}
                    {comment.replyCount === 1 ? "reply" : "replies"}
                  </span>
                </div>
              )}
              {comment.edited && (
                <span className="text-[9px] text-white/20 italic bg-white/3 px-2 py-0.5 rounded-full border border-white/5">
                  edited
                </span>
              )}
              {isHighlighted && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  ← from notification
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="space-y-2.5">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="h-36 rounded-2xl bg-white/2 animate-pulse"
        style={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>
);

// ─── Stats Strip ───────────────────────────────────────────────────────────────
const StatsStrip = ({ comments }) => {
  const total = comments.length;
  const answered = comments.filter((c) => (c.replyCount || 0) > 0).length;
  const pending = total - answered;
  const likes = comments.reduce((s, c) => s + (c.likes?.length || 0), 0);
  const uniqueStudents = new Set(
    comments.map((c) => c.userId?._id || c.userId || c.userName),
  ).size;

  const stats = [
    {
      label: "Total",
      value: total,
      color: "text-blue-400",
      glow: "from-blue-500/20",
      icon: MessageSquare,
      badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    },
    {
      label: "Students",
      value: uniqueStudents,
      color: "text-violet-400",
      glow: "from-violet-500/20",
      icon: Users,
      badge: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    },
    {
      label: "Answered",
      value: answered,
      color: "text-emerald-400",
      glow: "from-emerald-500/20",
      icon: CheckCircle2,
      badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    },
    {
      label: "Pending",
      value: pending,
      color: pending > 0 ? "text-amber-400" : "text-white/30",
      glow: "from-amber-500/20",
      icon: AlertCircle,
      badge:
        pending > 0
          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
          : "bg-white/5 border-white/10 text-white/25",
    },
    {
      label: "Likes",
      value: likes,
      color: "text-pink-400",
      glow: "from-pink-500/20",
      icon: ThumbsUp,
      badge: "bg-pink-500/10 border-pink-500/20 text-pink-400",
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-2 mb-5">
      {stats.map(({ label, value, color, glow, icon: Ic, badge }) => (
        <div
          key={label}
          className="relative p-3.5 rounded-2xl bg-[#0d1020] border border-white/6 overflow-hidden group hover:-translate-y-0.5 transition-all"
        >
          <div
            className={`absolute -top-6 -right-6 w-16 h-16 rounded-full bg-gradient-to-br ${glow} to-transparent blur-xl opacity-50 group-hover:opacity-80 transition-opacity`}
          />
          <div className="flex items-center justify-between mb-3">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${color} bg-white/4 border border-white/6`}
            >
              <Ic size={12} />
            </div>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${badge}`}
            >
              {label}
            </span>
          </div>
          <span
            className={`text-[22px] font-black ${color} leading-none tracking-tight`}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN CHAT SECTION
// ═══════════════════════════════════════════════════════════════════════════════

const ChatThreadItem = ({
  thread,
  isActive,
  onClick,
  onDelete,
  isHighlighted,
}) => {
  const name = thread.senderName || "Student";
  const dt = fmt(thread.lastAt);

  // FIX: Resolve avatar for thread list items
  const avatarSrc =
    thread.senderAvatar || thread.avatar || thread.userAvatar || null;

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-150 ${isActive ? "bg-indigo-500/12 border-indigo-500/30" : isHighlighted ? "bg-amber-500/8 border-amber-500/30 shadow-lg shadow-amber-500/10" : "bg-white/2 border-white/5 hover:bg-white/4 hover:border-white/10"}`}
    >
      {isHighlighted && !isActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-[#060812] animate-pulse" />
      )}
      <button
        onClick={onClick}
        className="w-full text-left p-3.5 flex items-center gap-3"
      >
        <div className="relative shrink-0">
          {/* FIX: Pass real avatar src to thread list */}
          <Avatar name={name} src={avatarSrc} size={40} />
          {thread.unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-indigo-500 border-2 border-[#060812] flex items-center justify-center text-[9px] font-black text-white px-1">
              {thread.unread}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span
              className={`text-[13px] font-bold truncate ${isActive ? "text-white" : isHighlighted ? "text-amber-200" : "text-white/80"}`}
            >
              {name}
            </span>
            <span className="text-[10px] text-white/25 shrink-0">{dt.rel}</span>
          </div>
          <p className="text-[11px] text-white/35 truncate">
            {thread.lastMessage || "No messages yet"}
          </p>
          {isHighlighted && !isActive && (
            <p className="text-[9px] text-amber-400/70 font-bold mt-0.5">
              ← From notification
            </p>
          )}
        </div>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(thread);
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/25 transition-all"
        title="Delete conversation"
      >
        <Trash2 size={10} />
      </button>
    </div>
  );
};

// ─── AdminChatSection ─────────────────────────────────────────────────────────
const AdminChatSection = ({
  courses,
  socketConnected,
  autoSelectStudentId,
  autoSelectStudentName,
  autoSelectCourseId,
  onClose,
}) => {
  const initCourse = autoSelectCourseId || courses[0]?.id || "";
  const [selectedCourse, setSelectedCourse] = useState(initCourse);
  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeThread, setActiveThread] = useState(null);
  const [activeCourse, setActiveCourse] = useState(initCourse);
  const [messages, setMessages] = useState([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [newMsgIds, setNewMsgIds] = useState(new Set());
  const [searchThreads, setSearchThreads] = useState("");
  const [highlightedThreadId, setHighlightedThreadId] = useState(null);
  const autoSelectDoneRef = useRef(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const fetchThreads = useCallback(async () => {
    if (!selectedCourse) return;
    setThreadsLoading(true);
    try {
      const res = await API.get(
        `/api/admin-chat/admin/conversations/${selectedCourse}`,
      );
      const data = extractArray(res.data?.threads || res.data);
      setThreads(data);
    } catch {
      toast.error("Failed to load conversations.", { style: TS.error });
      setThreads([]);
    } finally {
      setThreadsLoading(false);
    }
  }, [selectedCourse]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const searchAllCoursesForStudent = useCallback(async () => {
    if (!courses.length) return;
    if (autoSelectDoneRef.current) return;
    setSearching(true);
    for (const course of courses) {
      try {
        const res = await API.get(
          `/api/admin-chat/admin/conversations/${course.id}`,
        );
        const data = extractArray(res.data?.threads || res.data);
        if (!data.length) continue;
        let found = null;
        if (autoSelectStudentId) {
          found = data.find(
            (t) => t._id?.toString() === autoSelectStudentId.toString(),
          );
        }
        if (!found && autoSelectStudentName) {
          found = data.find(
            (t) =>
              (t.senderName || "").toLowerCase().trim() ===
              (autoSelectStudentName || "").toLowerCase().trim(),
          );
        }
        if (found) {
          autoSelectDoneRef.current = true;
          setSelectedCourse(course.id);
          setActiveCourse(course.id);
          setThreads(data);
          setHighlightedThreadId(found._id?.toString());
          openThreadWithCourse(found, course.id);
          toast.success(
            `💬 Chat opened with ${found.senderName || autoSelectStudentName || "Student"}`,
            { style: TS.info, duration: 3000 },
          );
          setTimeout(() => {
            const el = document.getElementById(`thread-${found._id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 300);
          setSearching(false);
          return;
        }
      } catch {}
    }
    setSearching(false);
    toast(
      `ℹ️ No chat thread found for "${autoSelectStudentName || "Student"}"`,
      { style: TS.base, duration: 4000 },
    );
  }, [courses, autoSelectStudentId, autoSelectStudentName]);

  useEffect(() => {
    const needsAutoSelect = autoSelectStudentId || autoSelectStudentName;
    if (!needsAutoSelect || !courses.length || autoSelectDoneRef.current)
      return;
    searchAllCoursesForStudent();
  }, [
    courses,
    autoSelectStudentId,
    autoSelectStudentName,
    searchAllCoursesForStudent,
  ]);

  const openThreadWithCourse = useCallback((thread, courseId) => {
    setActiveThread(thread);
    setActiveCourse(courseId);
    setThreads((prev) =>
      prev.map((t) =>
        t._id?.toString() === thread._id?.toString() ? { ...t, unread: 0 } : t,
      ),
    );
  }, []);

  const openThread = useCallback(
    (thread) => {
      openThreadWithCourse(thread, selectedCourse);
    },
    [selectedCourse, openThreadWithCourse],
  );

  const fetchMessages = useCallback(async () => {
    if (!activeThread || !activeCourse) return;
    setMsgsLoading(true);
    try {
      const res = await API.get(
        `/api/admin-chat/admin/thread/${activeCourse}/${activeThread._id}`,
      );
      const data = extractArray(res.data?.messages || res.data);
      setMessages(data);
    } catch {
      toast.error("Failed to load messages.", { style: TS.error });
      setMessages([]);
    } finally {
      setMsgsLoading(false);
    }
  }, [activeThread, activeCourse]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_BASE || "", {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socket.emit("joinAdminDashboard");
    socket.on("newStudentMessage", (msg) => {
      setThreads((prev) => {
        const exists = prev.find(
          (t) => t._id?.toString() === msg.senderId?.toString(),
        );
        if (exists)
          return prev.map((t) =>
            t._id?.toString() === msg.senderId?.toString()
              ? {
                  ...t,
                  lastMessage: msg.message,
                  lastAt: msg.createdAt,
                  unread: (t.unread || 0) + 1,
                }
              : t,
          );
        return [
          {
            _id: msg.senderId,
            senderName: msg.senderName,
            senderAvatar: msg.senderAvatar,
            lastMessage: msg.message,
            lastAt: msg.createdAt,
            unread: 1,
          },
          ...prev,
        ];
      });
      if (
        activeThread &&
        msg.senderId?.toString() === activeThread._id?.toString()
      ) {
        setMessages((prev) =>
          prev.some((m) => m._id === msg._id) ? prev : [...prev, msg],
        );
        setNewMsgIds((ids) => new Set([...ids, msg._id]));
        setTimeout(
          () =>
            setNewMsgIds((ids) => {
              const n = new Set(ids);
              n.delete(msg._id);
              return n;
            }),
          4000,
        );
      } else {
        toast(`💬 ${msg.senderName || "Student"}`, {
          style: TS.info,
          duration: 4000,
        });
      }
    });
    return () => {
      socket.emit("leaveAdminDashboard");
      socket.disconnect();
    };
  }, [activeThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEditMessage = async (msgId, newText) => {
    const res = await API.put(
      `/api/admin-chat/admin/message/${activeCourse}/${msgId}`,
      { message: newText },
    );
    setMessages((prev) =>
      prev.map((m) =>
        m._id === msgId
          ? {
              ...m,
              message: res.data?.message?.message ?? newText,
              edited: true,
            }
          : m,
      ),
    );
    setThreads((prev) =>
      prev.map((t) =>
        t._id?.toString() === activeThread?._id?.toString() && t.lastMessage
          ? { ...t, lastMessage: newText }
          : t,
      ),
    );
    toast.success("Updated ✓", { style: TS.success });
  };

  const handleDeleteMessage = async (msgId) => {
    await API.delete(`/api/admin-chat/admin/message/${activeCourse}/${msgId}`);
    setMessages((prev) => prev.filter((m) => m._id !== msgId));
  };

  const handleDeleteConversation = (thread) => {
    confirmToast({
      title: `Delete conversation with ${thread.senderName || "student"}?`,
      desc: "All messages in this conversation will be permanently deleted.",
      confirmLabel: "Delete All",
      onConfirm: async () => {
        const lid = toast.loading("Deleting conversation…", { style: TS.base });
        try {
          await API.delete(
            `/api/admin-chat/admin/conversation/${activeCourse}/${thread._id}`,
          );
          setThreads((prev) =>
            prev.filter((t) => t._id?.toString() !== thread._id?.toString()),
          );
          if (activeThread?._id?.toString() === thread._id?.toString()) {
            setActiveThread(null);
            setMessages([]);
          }
          toast.dismiss(lid);
          toast.success("Conversation deleted ✓", { style: TS.success });
        } catch {
          toast.dismiss(lid);
          toast.error("Delete failed.", { style: TS.error });
        }
      },
    });
  };

  const handleClearMessages = () => {
    if (!activeThread) return;
    confirmToast({
      title: "Clear all messages?",
      desc: "This only removes messages from your view.",
      confirmLabel: "Clear",
      onConfirm: async () => {
        const lid = toast.loading("Clearing messages…", { style: TS.base });
        try {
          await API.delete(
            `/api/admin-chat/admin/thread/clear/${activeCourse}/${activeThread._id}`,
          );
          setMessages([]);
          toast.dismiss(lid);
          toast.success("Messages cleared ✓", { style: TS.success });
        } catch {
          toast.dismiss(lid);
          toast.error("Clear failed.", { style: TS.error });
        }
      },
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !activeThread) return;
    const optimisticId = `opt_${Date.now()}`;
    const optimistic = {
      _id: optimisticId,
      message: text,
      senderName: "Admin",
      senderModel: "Admin",
      senderRole: "admin",
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSending(true);
    try {
      const res = await API.post(
        `/api/admin-chat/admin/reply/${activeCourse}/${activeThread._id}`,
        { message: text },
      );
      const saved = res.data?.message || res.data;
      setMessages((prev) =>
        prev.map((m) => (m._id === optimisticId ? { ...saved } : m)),
      );
      setThreads((prev) =>
        prev.map((t) =>
          t._id?.toString() === activeThread._id?.toString()
            ? { ...t, lastMessage: text, lastAt: new Date().toISOString() }
            : t,
        ),
      );
      toast.success("Sent ✓", { style: TS.success, duration: 2000 });
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
      setInput(text);
      toast.error("Send failed.", { style: TS.error });
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const totalUnread = threads.reduce((s, t) => s + (t.unread || 0), 0);
  const filteredThreads = threads.filter(
    (t) =>
      !searchThreads ||
      (t.senderName || "").toLowerCase().includes(searchThreads.toLowerCase()),
  );

  // FIX: Resolve active thread student avatar for chat header
  const activeStudentAvatar =
    activeThread?.senderAvatar ||
    activeThread?.avatar ||
    activeThread?.userAvatar ||
    null;

  return (
    <div className="flex h-full w-full">
      {/* Thread list */}
      <div className="w-64 shrink-0 flex flex-col gap-0 border-r border-white/6 bg-white/[0.012]">
        <div className="p-3 border-b border-white/6 space-y-2">
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setActiveThread(null);
              setMessages([]);
              autoSelectDoneRef.current = false;
            }}
            className="w-full py-2 px-3 rounded-xl text-[11px] bg-[#0d1020] border border-white/7 text-white outline-none focus:border-indigo-500/35 cursor-pointer"
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="relative">
            <Search
              size={11}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
            />
            <input
              value={searchThreads}
              onChange={(e) => setSearchThreads(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-7 pr-3 py-2 rounded-xl text-[11px] bg-white/4 border border-white/7 text-white outline-none focus:border-indigo-500/30 placeholder-white/20"
            />
          </div>
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <Inbox size={12} className="text-indigo-400" />
              <span className="text-[11px] font-bold text-white/60">
                Conversations
              </span>
              {totalUnread > 0 && (
                <span className="min-w-[16px] h-[16px] rounded-full bg-indigo-500 flex items-center justify-center text-[8px] font-black text-white px-1">
                  {totalUnread}
                </span>
              )}
            </div>
            <button
              onClick={fetchThreads}
              className="text-white/20 hover:text-indigo-400 transition-colors"
            >
              <RefreshCw
                size={11}
                className={threadsLoading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 p-2 custom-scrollbar">
          {threadsLoading || searching ? (
            <div className="space-y-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-2xl bg-white/2 animate-pulse"
                />
              ))}
              {searching && (
                <p className="text-[10px] text-indigo-400/60 text-center pt-1 font-semibold animate-pulse">
                  Searching across all courses…
                </p>
              )}
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <div className="w-10 h-10 rounded-2xl bg-white/3 border border-white/6 flex items-center justify-center">
                <MessageCircle size={18} className="text-white/15" />
              </div>
              <p className="text-[11px] text-white/25">
                {searchThreads ? "No results" : "No conversations yet"}
              </p>
            </div>
          ) : (
            filteredThreads.map((t) => (
              <div key={t._id} id={`thread-${t._id}`}>
                <ChatThreadItem
                  thread={t}
                  isActive={activeThread?._id?.toString() === t._id?.toString()}
                  isHighlighted={
                    highlightedThreadId === t._id?.toString() &&
                    activeThread?._id?.toString() !== t._id?.toString()
                  }
                  onClick={() => {
                    openThread(t);
                    setHighlightedThreadId(null);
                  }}
                  onDelete={handleDeleteConversation}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeThread ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
            {searching ? (
              <>
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/8 border border-indigo-500/15 flex items-center justify-center">
                  <div className="w-7 h-7 border-[3px] border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin" />
                </div>
                <div>
                  <p className="text-[15px] font-black text-white/50 mb-1">
                    Finding conversation…
                  </p>
                  <p className="text-[12px] text-white/25">
                    {autoSelectStudentName
                      ? `Loading thread for "${autoSelectStudentName}"`
                      : "Searching student conversation"}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/8 border border-indigo-500/15 flex items-center justify-center">
                  <ShieldCheck size={28} className="text-indigo-400/60" />
                </div>
                <div>
                  <p className="text-[15px] font-black text-white/30 mb-1">
                    Select a conversation
                  </p>
                  <p className="text-[12px] text-white/18">
                    Choose a thread from the left to start replying
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-white/6 flex items-center gap-2.5 shrink-0 bg-white/1">
              <button
                onClick={() => setActiveThread(null)}
                className="w-7 h-7 rounded-lg bg-white/4 border border-white/8 text-white/30 flex items-center justify-center hover:text-white/60 transition-all"
              >
                <ChevronLeft size={13} />
              </button>
              {/* FIX: Pass real avatar to chat header */}
              <Avatar
                name={activeThread.senderName || "Student"}
                src={activeStudentAvatar}
                size={32}
                online
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-black text-white leading-none mb-0.5">
                  {activeThread.senderName || "Student"}
                </p>
                <p className="text-[10px] text-white/30">
                  Private support · right-click to edit/delete
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleClearMessages}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold bg-white/4 border border-white/10 text-white/35 hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-400 transition-all"
                >
                  <X size={9} /> Clear
                </button>
                <button
                  onClick={() => handleDeleteConversation(activeThread)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold bg-red-500/8 border border-red-500/18 text-red-400 hover:bg-red-500/18 transition-all"
                >
                  <Trash2 size={9} /> Delete
                </button>
                <button
                  onClick={fetchMessages}
                  className="w-7 h-7 rounded-lg bg-white/4 border border-white/8 text-white/30 flex items-center justify-center hover:text-indigo-400 transition-all"
                >
                  <RefreshCw
                    size={11}
                    className={msgsLoading ? "animate-spin" : ""}
                  />
                </button>
                <span
                  className={`flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full border ${socketConnected ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-400" : "bg-red-500/8 border-red-500/20 text-red-400"}`}
                >
                  {socketConnected ? <Wifi size={8} /> : <WifiOff size={8} />}
                  {socketConnected ? "Live" : "Offline"}
                </span>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-lg bg-white/4 border border-white/8 text-white/30 flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-all ml-1"
                    title="Close chat"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
              {msgsLoading ? (
                <div className="space-y-4">
                  {[40, 65, 50].map((w, i) => (
                    <div
                      key={i}
                      className={`flex gap-2.5 items-end ${i % 2 === 1 ? "flex-row-reverse" : ""}`}
                    >
                      <div className="w-7 h-7 rounded-full bg-white/5 animate-pulse shrink-0" />
                      <div
                        className="rounded-2xl bg-white/4 animate-pulse"
                        style={{ width: `${w}%`, height: 48 }}
                      />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/8 border border-indigo-500/15 flex items-center justify-center">
                    <MessageCircle size={22} className="text-indigo-400/50" />
                  </div>
                  <p className="text-[13px] font-bold text-white/25">
                    No messages yet
                  </p>
                  <p className="text-[11px] text-white/15">
                    Start the conversation
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 py-2 mb-3">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[9px] text-white/20 px-2.5 py-1 rounded-full border border-white/6 bg-white/2 font-semibold">
                      {fmt(messages[0]?.createdAt).full}
                    </span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                  {messages.map((msg) => {
                    const isAdminMsg =
                      msg.senderModel === "Admin" ||
                      msg.senderRole === "admin" ||
                      msg.senderRole === "superadmin";
                    return (
                      <ChatBubble
                        key={msg._id}
                        msg={msg}
                        isAdmin={isAdminMsg}
                        isNew={newMsgIds.has(msg._id)}
                        onEdit={isAdminMsg ? handleEditMessage : undefined}
                        onDelete={isAdminMsg ? handleDeleteMessage : undefined}
                      />
                    );
                  })}
                </>
              )}
              <div ref={bottomRef} className="h-2" />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/6 bg-black/20 shrink-0">
              <div className="flex items-center gap-2.5">
                <Avatar name="Admin" src={getAdminAvatar()} size={46} isAdmin online />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={`Reply to ${activeThread.senderName || "student"}…`}
                    className="w-full h-[54px] bg-white/4 border border-white/8 rounded-xl px-4 pr-20 text-[12px] text-white outline-none focus:border-indigo-500/40 focus:bg-indigo-500/4 transition-all placeholder-white/18"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {input && (
                      <button
                        onClick={() => setInput("")}
                        className="p-1.5 rounded-lg text-white/20 hover:text-white/50 transition-all"
                      >
                        <X size={10} />
                      </button>
                    )}
                    <button
                      onClick={handleSend}
                      disabled={sending || !input.trim()}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 disabled:opacity-30 hover:bg-indigo-500/30 transition-all"
                    >
                      {sending ? (
                        <div className="w-3 h-3 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                      ) : (
                        <Send size={20} />
                      )}
                      {sending ? "…" : "Send"}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-white/15 mt-1.5 ml-[42px]">
                Shift+Enter for new line · Right-click any message to edit or
                delete
              </p>
            </div>
          </>
        )}
        {!activeThread && onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/4 border border-white/8 text-white/30 flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-all z-10"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN CHAT MODAL WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════
const AdminChatModal = ({
  courses,
  socketConnected,
  autoSelectStudentId,
  autoSelectStudentName,
  autoSelectCourseId,
  onClose,
}) => {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center p-4"
      style={{
        background: "rgba(3,5,15,0.78)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-violet-600/6 rounded-full blur-3xl" />
      </div>

      <div
        className="relative w-full flex flex-col overflow-hidden animate-modalIn"
        style={{
          maxWidth: 900,
          height: "min(88vh, 720px)",
          background: "rgba(8,10,20,0.97)",
          border: "1px solid rgba(99,102,241,0.22)",
          borderRadius: "24px",
          boxShadow:
            "0 0 0 1px rgba(99,102,241,0.08), 0 32px 80px rgba(0,0,0,0.85), 0 0 80px rgba(99,102,241,0.07)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            zIndex: 10,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.7) 25%, rgba(139,92,246,0.6) 60%, rgba(99,102,241,0.3) 80%, transparent 100%)",
          }}
        />

        <div
          className="flex items-center justify-between px-5 py-3 border-b border-white/6 shrink-0 bg-white/[0.01]"
          style={{ paddingTop: "13px" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
              <ShieldCheck size={15} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-[14px] font-black text-white leading-none">
                Admin Chat
              </p>
              <p className="text-[10px] text-white/30 mt-0.5">
                Private student support
              </p>
            </div>
            <span
              className={`flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-1 rounded-full border ml-2 ${socketConnected ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}
            >
              {socketConnected ? <Wifi size={8} /> : <WifiOff size={8} />}
              {socketConnected ? "Live" : "Offline"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-white/8 bg-white/4 text-white/35 flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
            title="Close (Esc)"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden relative">
          <AdminChatSection
            courses={courses}
            socketConnected={socketConnected}
            autoSelectStudentId={autoSelectStudentId}
            autoSelectStudentName={autoSelectStudentName}
            autoSelectCourseId={autoSelectCourseId}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — AdminCommentPage
// ═══════════════════════════════════════════════════════════════════════════════
const AdminCommentPage = () => {
  const location = useLocation();

  const highlightCommentId = location.state?.highlightCommentId ?? null;
  const initCourseId = location.state?.courseId ?? null;
  const openChatTab = location.state?.openChatTab ?? false;
  const highlightStudentId = location.state?.highlightStudentId ?? null;
  const highlightStudentName = location.state?.highlightStudentName ?? null;

  const [chatOpen, setChatOpen] = useState(openChatTab ? true : false);
  const [comments, setComments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState(initCourseId || "all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeThread, setActiveThread] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [liveCount, setLiveCount] = useState(0);
  const [chatUnread, setChatUnread] = useState(0);

  const coursesRef = useRef([]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_BASE || "", {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("newComment", (c) => {
      const parentId = getParentId(c.parentComment);
      if (parentId) {
        setComments((prev) =>
          prev.map((existing) =>
            existing._id === parentId
              ? { ...existing, replyCount: (existing.replyCount || 0) + 1 }
              : existing,
          ),
        );
      } else {
        setComments((prev) => {
          if (prev.some((x) => x._id === c._id)) return prev;
          const cId = String(c.courseId || c.course || "");
          const found = coursesRef.current.find((cr) => cr.id === cId);
          const enriched = {
            ...c,
            courseId: cId,
            courseName: found?.name || c.courseName || "Unknown",
            message: c.message || c.text || "",
          };
          setLiveCount((n) => n + 1);
          toast(`✨ ${c.userName || "Student"}`, {
            style: TS.info,
            duration: 4000,
          });
          return [enriched, ...prev];
        });
      }
    });
    socket.on("updateComment", (u) =>
      setComments((p) => p.map((c) => (c._id === u._id ? { ...c, ...u } : c))),
    );
    socket.on("deleteComment", (id) => {
      if (!id) return;
      setComments((p) =>
        p.filter((c) => c._id !== id && getParentId(c.parentComment) !== id),
      );
    });
    socket.on("likeUpdated", (u) =>
      setComments((p) => p.map((c) => (c._id === u._id ? { ...c, ...u } : c))),
    );
    socket.on("newStudentMessage", () => {
      if (!chatOpen) setChatUnread((n) => n + 1);
    });
    return () => socket.disconnect();
  }, [chatOpen]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const lid = toast.loading("Loading data…", { style: TS.base });
    try {
      let courseRes;
      try {
        courseRes = await API.get("/api/course/public");
      } catch (e) {
        const msg = `Course fetch failed: ${e?.response?.status || e.message}`;
        setError(msg);
        toast.dismiss(lid);
        toast.error(msg, { style: TS.error });
        setLoading(false);
        return;
      }
      const courseArr = extractArray(courseRes.data);
      const courseList = courseArr
        .map((c) => ({
          id: String(c._id || c.id || ""),
          name: c.name || c.title || "Unnamed",
          category: c.category || null,
        }))
        .filter((c) => c.id);
      setCourses(courseList);
      coursesRef.current = courseList;
      if (!courseList.length) {
        setComments([]);
        toast.dismiss(lid);
        toast("No courses found.", { style: TS.base });
        setLoading(false);
        return;
      }
      const results = await Promise.all(
        courseList.map(async (course) => {
          try {
            const r = await API.get(`/api/comments/${course.id}`);
            let arr = r.data;
            if (!Array.isArray(arr))
              arr = arr?.data || arr?.comments || arr?.results || [];
            if (!Array.isArray(arr) && arr && typeof arr === "object") {
              for (const v of Object.values(arr)) {
                if (Array.isArray(v)) {
                  arr = v;
                  break;
                }
              }
            }
            if (!Array.isArray(arr)) return [];
            return arr
              .filter((cm) => !getParentId(cm.parentComment))
              .map((cm) => ({
                ...cm,
                courseName: course.name,
                courseId: course.id,
                message: cm.message || cm.text || "",
              }));
          } catch {
            return [];
          }
        }),
      );
      setComments(
        results
          .flat()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      );
      setLiveCount(0);
      toast.dismiss(lid);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to load.";
      setError(msg);
      toast.dismiss(lid);
      toast.error(msg, { style: TS.error });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (highlightCommentId && !loading) {
      setTimeout(() => {
        const el = document.getElementById(`comment-${highlightCommentId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          toast("📌 Highlighted", { style: TS.info, duration: 3000 });
        }
      }, 400);
    }
  }, [highlightCommentId, loading]);

  const handleDelete = (commentId) => {
    confirmToast({
      title: "Delete this comment?",
      desc: "This will also remove all replies.",
      confirmLabel: "Delete",
      onConfirm: async () => {
        const lid = toast.loading("Deleting…", { style: TS.base });
        try {
          await API.delete(`/api/comments/admin/${commentId}`);
          setComments((prev) => prev.filter((c) => c._id !== commentId));
          toast.dismiss(lid);
          toast.success("Deleted ✓", { style: TS.success });
        } catch (err) {
          toast.dismiss(lid);
          toast.error(err?.response?.data?.message || "Failed.", {
            style: TS.error,
          });
        }
      },
    });
  };

  const handleEditSave = async (commentId, newMsg) => {
    const res = await API.put(`/api/comments/admin/${commentId}`, {
      message: newMsg,
    });
    setComments((prev) =>
      prev.map((c) =>
        c._id === commentId
          ? { ...c, message: res.data.comment?.message ?? newMsg, edited: true }
          : c,
      ),
    );
  };

  const handleLike = async (commentId) => {
    try {
      const res = await API.post(`/api/comments/admin/${commentId}/like`, {
        type: "like",
      });
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, likes: res.data.comment?.likes ?? c.likes }
            : c,
        ),
      );
      toast("👍 Liked", { style: TS.success, duration: 1500 });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed.", {
        style: TS.error,
      });
    }
  };

  let filtered = [...comments];
  if (filterCourse !== "all")
    filtered = filtered.filter((c) => c.courseId === filterCourse);
  if (filterStatus === "answered")
    filtered = filtered.filter((c) => (c.replyCount || 0) > 0);
  if (filterStatus === "unanswered")
    filtered = filtered.filter((c) => (c.replyCount || 0) === 0);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        (c.message || "").toLowerCase().includes(q) ||
        (c.userName || "").toLowerCase().includes(q) ||
        (c.courseName || "").toLowerCase().includes(q) ||
        (c.userId?.email || "").toLowerCase().includes(q),
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "#060812" }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: TS.base,
          success: {
            style: TS.success,
            iconTheme: { primary: "#34d399", secondary: "#0d1020" },
          },
          error: {
            style: TS.error,
            iconTheme: { primary: "#f87171", secondary: "#0d1020" },
          },
          loading: { style: TS.base },
        }}
      />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.012)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {activeThread && (
        <ThreadModal
          comment={activeThread}
          courseId={activeThread.courseId}
          onClose={() => setActiveThread(null)}
          onReplySent={() => {
            setActiveThread((p) =>
              p ? { ...p, replyCount: (p.replyCount || 0) + 1 } : null,
            );
            setComments((prev) =>
              prev.map((c) =>
                c._id === activeThread._id
                  ? { ...c, replyCount: (c.replyCount || 0) + 1 }
                  : c,
              ),
            );
          }}
        />
      )}

      {editingComment && (
        <EditModal
          comment={editingComment}
          onClose={() => setEditingComment(null)}
          onSave={handleEditSave}
        />
      )}

      {chatOpen && (
        <AdminChatModal
          courses={courses}
          socketConnected={socketConnected}
          autoSelectStudentId={openChatTab ? highlightStudentId : null}
          autoSelectStudentName={openChatTab ? highlightStudentName : null}
          autoSelectCourseId={openChatTab && initCourseId ? initCourseId : null}
          onClose={() => {
            setChatOpen(false);
            setChatUnread(0);
          }}
        />
      )}

      <div className="relative max-w-5xl mx-auto px-4 py-8">
        {/* PAGE HEADER */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500/25 to-indigo-600/20 border border-blue-500/30"
                style={{ boxShadow: "0 0 24px rgba(59,130,246,0.15)" }}
              >
                <MessageSquare size={20} className="text-blue-400" />
              </div>
              {socketConnected && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#060812] animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-0.5">
                <h1 className="text-[26px] font-black tracking-tight text-white leading-none">
                  Student Interactions
                </h1>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${socketConnected ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300" : "bg-red-500/10 border-red-500/25 text-red-300"}`}
                >
                  {socketConnected ? <Wifi size={9} /> : <WifiOff size={9} />}
                  {socketConnected ? "Live" : "Offline"}
                </div>
                {liveCount > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/15 border border-blue-500/25 text-[10px] font-bold text-blue-300 animate-pulse">
                    <Zap size={9} /> {liveCount} new
                  </div>
                )}
              </div>
              <p className="text-[12px] text-white/30">
                Real-time discussions · {comments.length} comment
                {comments.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setChatOpen(true);
                setChatUnread(0);
              }}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-indigo-300 bg-indigo-500/12 border border-indigo-500/28 hover:bg-indigo-500/22 hover:border-indigo-500/45 transition-all"
              style={{
                boxShadow:
                  chatUnread > 0 ? "0 0 16px rgba(99,102,241,0.25)" : undefined,
              }}
            >
              <ShieldCheck size={13} />
              Admin Chat
              {chatUnread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-indigo-500 border-2 border-[#060812] flex items-center justify-center text-[9px] font-black text-white px-1 animate-bounce">
                  {chatUnread}
                </span>
              )}
            </button>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-white/45 bg-white/3 border border-white/8 hover:border-white/15 hover:text-white/65 hover:bg-white/5 transition-all"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>

        {!loading && comments.length > 0 && <StatsStrip comments={comments} />}

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={13}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search comments, students, courses…"
              className="w-full py-2.5 pl-10 pr-10 bg-white/4 border border-white/7 rounded-2xl text-[13px] text-white outline-none focus:border-blue-500/40 transition-all placeholder-white/18"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="py-2.5 px-4 rounded-2xl text-[12px] bg-[#0d1020] border border-white/7 text-white outline-none focus:border-indigo-500/35 max-w-[220px] cursor-pointer"
          >
            <option value="all">All Courses ({comments.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({comments.filter((cm) => cm.courseId === c.id).length}
                )
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <Filter size={11} className="text-white/20" />
            {[
              { key: "all", label: "All" },
              { key: "answered", label: "✓ Answered" },
              { key: "unanswered", label: "⚠ Pending" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${filterStatus === key ? "text-indigo-300 bg-indigo-500/15 border-indigo-500/30" : "text-white/35 bg-transparent border-white/7 hover:border-white/14 hover:text-white/55"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 mb-4 p-3.5 rounded-2xl bg-red-500/8 border border-red-500/18">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <p className="text-[13px] text-red-300 flex-1">{error}</p>
            <button
              onClick={fetchData}
              className="text-[11px] font-bold text-red-400 hover:text-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <Skeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-white/3 border border-white/7">
              <MessageSquare size={32} className="text-white/12" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-black text-white/35 mb-1">
                No comments found
              </p>
              <p className="text-[12px] text-white/20">
                {search
                  ? `No results for "${search}"`
                  : "No student comments yet"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((c, i) => (
              <CommentCard
                key={c._id || i}
                comment={c}
                index={i}
                isHighlighted={c._id === highlightCommentId}
                onOpen={setActiveThread}
                onDelete={handleDelete}
                onEdit={(comment) => setEditingComment(comment)}
                onLike={handleLike}
              />
            ))}
            <p className="text-center text-[11px] text-white/15 pt-4 pb-2">
              {filtered.length} comment{filtered.length !== 1 ? "s" : ""}
              {filterStatus !== "all" ? ` · ${filterStatus}` : ""}
              {search ? ` matching "${search}"` : ""}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.92) translateY(-4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.94) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-slideIn { animation: slideIn 0.25s ease-out forwards; }
        .animate-popIn { animation: popIn 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-modalIn { animation: modalIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.4); }
      `}</style>
    </div>
  );
};

export default AdminCommentPage;
