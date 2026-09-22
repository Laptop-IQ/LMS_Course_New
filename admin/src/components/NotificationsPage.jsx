import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/adminApi";
import {
  Bell,
  BellOff,
  BookOpen,
  Star,
  MessageSquare,
  ShoppingBag,
  UserPlus,
  Trash2,
  CheckCheck,
  RefreshCw,
  Send,
  CheckCircle2,
  GraduationCap,
  AlertCircle,
  Filter,
  Calendar,
  User,
  TrendingUp,
  Activity,
  Eye,
  EyeOff,
  Search,
  Mail,
  Phone,
  MapPin,
  Shield,
  X,
  AtSign,
  Package,
  Wallet,
  BarChart3,
  ExternalLink,
  Quote,
  Sparkles,
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

// ─── Type Config ─────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  booking: {
    icon: ShoppingBag,
    label: "Enrollment",
    card: "bg-emerald-500/10 border-emerald-500/20",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    icon_wrap: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400",
    accent: "bg-emerald-400",
    glow: "shadow-emerald-500/20",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    gradient: "from-emerald-400",
    ring: "ring-emerald-500/30",
  },
  rating: {
    icon: Star,
    label: "Rating",
    card: "bg-amber-500/10 border-amber-500/20",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    icon_wrap: "bg-amber-500/15 border-amber-500/25 text-amber-400",
    accent: "bg-amber-400",
    glow: "shadow-amber-500/20",
    dot: "bg-amber-400",
    text: "text-amber-300",
    gradient: "from-amber-400",
    ring: "ring-amber-500/30",
  },
  comment: {
    icon: MessageSquare,
    label: "Comment",
    card: "bg-blue-500/10 border-blue-500/20",
    badge: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    icon_wrap: "bg-blue-500/15 border-blue-500/25 text-blue-400",
    accent: "bg-blue-400",
    glow: "shadow-blue-500/20",
    dot: "bg-blue-400",
    text: "text-blue-300",
    gradient: "from-blue-400",
    ring: "ring-blue-500/30",
  },
  register: {
    icon: UserPlus,
    label: "Register",
    card: "bg-purple-500/10 border-purple-500/20",
    badge: "bg-purple-500/15 text-purple-300 border-purple-500/25",
    icon_wrap: "bg-purple-500/15 border-purple-500/25 text-purple-400",
    accent: "bg-purple-400",
    glow: "shadow-purple-500/20",
    dot: "bg-purple-400",
    text: "text-purple-300",
    gradient: "from-purple-400",
    ring: "ring-purple-500/30",
  },
  course: {
    icon: BookOpen,
    label: "Course",
    card: "bg-cyan-500/10 border-cyan-500/20",
    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
    icon_wrap: "bg-cyan-500/15 border-cyan-500/25 text-cyan-400",
    accent: "bg-cyan-400",
    glow: "shadow-cyan-500/20",
    dot: "bg-cyan-400",
    text: "text-cyan-300",
    gradient: "from-cyan-400",
    ring: "ring-cyan-500/30",
  },
};

const getConfig = (type) =>
  TYPE_CONFIG[type] || {
    icon: Bell,
    label: type || "Notification",
    card: "bg-slate-500/10 border-slate-500/20",
    badge: "bg-slate-500/15 text-slate-300 border-slate-500/25",
    icon_wrap: "bg-slate-500/15 border-slate-500/25 text-slate-400",
    accent: "bg-slate-400",
    glow: "shadow-slate-500/20",
    dot: "bg-slate-400",
    text: "text-slate-300",
    gradient: "from-slate-400",
    ring: "ring-slate-500/30",
  };

const FILTERS = ["All", "comment", "rating", "booking", "register", "course"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return { relative: "—", full: "—", time: "" };
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d) / 1000);
  let relative;
  if (diff < 60) relative = "Just now";
  else if (diff < 3600) relative = `${Math.floor(diff / 60)}m ago`;
  else if (diff < 86400) relative = `${Math.floor(diff / 3600)}h ago`;
  else if (diff < 172800) relative = "Yesterday";
  else if (diff < 604800) relative = `${Math.floor(diff / 86400)}d ago`;
  else
    relative = d.toLocaleDateString("en-IN", {
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
  return { relative, full, time };
};

const getInitials = (name) => {
  if (!name || name === "Student" || name === "undefined") return "??";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

const AVATAR_COLORS = [
  "from-indigo-500/30 to-indigo-500/10 border-indigo-500/40 text-indigo-300",
  "from-purple-500/30 to-purple-500/10 border-purple-500/40 text-purple-300",
  "from-pink-500/30 to-pink-500/10 border-pink-500/40 text-pink-300",
  "from-rose-500/30 to-rose-500/10 border-rose-500/40 text-rose-300",
  "from-orange-500/30 to-orange-500/10 border-orange-500/40 text-orange-300",
  "from-amber-500/30 to-amber-500/10 border-amber-500/40 text-amber-300",
  "from-emerald-500/30 to-emerald-500/10 border-emerald-500/40 text-emerald-300",
  "from-cyan-500/30 to-cyan-500/10 border-cyan-500/40 text-cyan-300",
  "from-blue-500/30 to-blue-500/10 border-blue-500/40 text-blue-300",
  "from-violet-500/30 to-violet-500/10 border-violet-500/40 text-violet-300",
];

const getAvatarClass = (name) => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const safeRating = (val) => {
  const n = Math.round(Number(val));
  return Number.isFinite(n) ? Math.min(5, Math.max(0, n)) : 0;
};

const toStr = (val) => {
  if (!val) return "";
  if (typeof val === "object" && val._id) return String(val._id);
  return String(val).trim();
};

const isMongoId = (s) => /^[a-f0-9]{24}$/i.test(String(s || "").trim());

const extractName = (val) => {
  if (!val) return null;
  if (typeof val === "string") {
    const s = val.trim();
    if (!s || s === "undefined" || s === "null" || s === "Student") return null;
    if (isMongoId(s)) return null;
    return s;
  }
  if (typeof val === "object") {
    if (val.firstName || val.lastName)
      return `${val.firstName || ""} ${val.lastName || ""}`.trim() || null;
    for (const field of [
      "name",
      "fullName",
      "displayName",
      "username",
      "userName",
      "studentName",
      "email",
    ]) {
      if (val[field] && typeof val[field] === "string") {
        const s = val[field].trim();
        if (s && s !== "undefined" && s !== "null" && !isMongoId(s))
          return field === "email" ? s.split("@")[0] : s;
      }
    }
    for (const nested of ["user", "student", "userData", "profile"]) {
      if (val[nested]) {
        const n = extractName(val[nested]);
        if (n) return n;
      }
    }
  }
  return null;
};

const extractUsername = (val) => {
  if (!val) return null;
  if (typeof val === "object") {
    for (const field of [
      "username",
      "userName",
      "handle",
      "userId",
      "user_name",
    ]) {
      if (val[field] && typeof val[field] === "string") {
        const s = val[field].trim();
        if (s && s !== "undefined" && s !== "null" && !isMongoId(s))
          return s.startsWith("@") ? s : `@${s}`;
      }
    }
  }
  return null;
};

const resolveRealSenderName = (meta, bookingStudentMap, userMap = {}) => {
  const candidates = [
    meta.senderName,
    meta.studentName,
    meta.userName,
    meta.name,
    meta.fullName,
    extractName(meta.studentId),
    extractName(meta.senderId),
    extractName(meta.userId),
    extractName(meta.sender),
    extractName(meta.user),
    extractName(meta.student),
    extractName(meta.ratingBy),
    extractName(meta.reviewer),
    extractName(meta.createdBy),
    extractName(meta.enrolledBy),
  ];
  for (const name of candidates) {
    if (
      name &&
      typeof name === "string" &&
      name.trim() &&
      name !== "undefined" &&
      name !== "null" &&
      name !== "Student" &&
      !isMongoId(name.trim())
    )
      return name.trim();
  }
  for (const idField of [meta.senderId, meta.userId, meta.studentId]) {
    const sid = toStr(idField);
    if (sid && bookingStudentMap?.[sid]?.studentName)
      return bookingStudentMap[sid].studentName;
  }
  for (const idField of [meta.senderId, meta.userId, meta.studentId]) {
    const sid = toStr(idField);
    if (sid && userMap?.[sid]?.name) return userMap[sid].name;
  }
  return null;
};

const resolveUsername = (meta, bookingStudentMap, userMap = {}) => {
  const direct =
    meta.username ||
    meta.userName ||
    extractUsername(meta.studentId) ||
    extractUsername(meta.senderId) ||
    extractUsername(meta.userId);
  if (direct)
    return direct.startsWith("@") ? direct : `@${direct.replace(/^@/, "")}`;
  for (const idField of [meta.senderId, meta.userId, meta.studentId]) {
    const sid = toStr(idField);
    if (sid && bookingStudentMap?.[sid]) {
      const sbm = bookingStudentMap[sid];
      if (sbm.username)
        return sbm.username.startsWith("@") ? sbm.username : `@${sbm.username}`;
      if (sbm.email) return `@${sbm.email.split("@")[0]}`;
    }
  }
  for (const idField of [meta.senderId, meta.userId, meta.studentId]) {
    const sid = toStr(idField);
    if (sid && userMap?.[sid]) {
      const u = userMap[sid];
      if (u.username)
        return u.username.startsWith("@") ? u.username : `@${u.username}`;
      if (u.email) return `@${u.email.split("@")[0]}`;
    }
  }
  const email = meta.email || meta.senderEmail;
  if (email) return `@${email.split("@")[0]}`;
  return null;
};

const resolveCourseNameFromMetadata = (meta) => {
  if (meta.courseId && typeof meta.courseId === "object") {
    const name =
      meta.courseId.name || meta.courseId.title || meta.courseId.courseName;
    if (name && name !== "Unknown Course") return name;
  }
  const direct = meta.courseName || meta.course?.name || meta.course?.title;
  if (direct && direct !== "Unknown Course") return direct;
  return null;
};

const extractCourseNameFromMessage = (msg) => {
  if (!msg) return null;
  const patterns = [
    /(?:on|for|in|course)[:\s]+["'"\u201c\u201d\u201e]([^"'"\u201c\u201d\u201e]+)["'"\u201c\u201d\u201e]/i,
    /(?:commented on|rated|enrolled in|purchased)\s+["'"\u201c\u201d\u201e]([^"'"\u201c\u201d\u201e]+)["'"\u201c\u201d\u201e]/i,
    /course[:\s]+([A-Z][^.!?\n]{3,60})/,
  ];
  for (const p of patterns) {
    const m = msg.match(p);
    if (m?.[1] && m[1] !== "Unknown Course") return m[1].trim();
  }
  return null;
};

const parseDuration = (value) => {
  if (value == null) return 0;
  if (typeof value === "number") return Math.max(0, Math.floor(value));
  if (typeof value === "string") {
    const h = value.match(/(\d+)\s*h/i),
      m = value.match(/(\d+)\s*m/i);
    let t = 0;
    if (h) t += parseInt(h[1]) * 60;
    if (m) t += parseInt(m[1]);
    return t || parseInt(value) || 0;
  }
  if (typeof value === "object") {
    if ("hours" in value || "minutes" in value)
      return (Number(value.hours) || 0) * 60 + (Number(value.minutes) || 0);
    if ("totalMinutes" in value) return Number(value.totalMinutes) || 0;
  }
  return 0;
};

const fmtDuration = (mins) => {
  const t = Math.max(0, Math.floor(mins));
  const h = Math.floor(t / 60),
    m = t % 60;
  if (t === 0) return null;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const extractCommentText = (meta) => {
  return (
    meta?.commentText ||
    meta?.comment ||
    meta?.commentBody ||
    meta?.text ||
    meta?.message ||
    meta?.content ||
    meta?.body ||
    ""
  );
};

// ─── StarRating ───────────────────────────────────────────────────────────────
const StarRating = ({ rating, size = 14 }) => {
  const r = safeRating(rating);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < r ? "text-amber-400 fill-amber-400" : "text-white/10"}
        />
      ))}
      <span className="ml-1.5 text-amber-400 font-black text-[13px]">
        {r}.0
      </span>
      <span className="text-white/30 text-[11px]">/ 5</span>
    </div>
  );
};

// ─── UserProfileModal ─────────────────────────────────────────────────────────
const UserProfileModal = ({ notif, onClose }) => {
  const m = notif.metadata || {};
  const name = m.senderName;
  const hasRealName =
    name &&
    name !== "Student" &&
    name !== "Unknown" &&
    name !== "undefined" &&
    !isMongoId(name);
  const avatarClass = getAvatarClass(hasRealName ? name : "");
  const dt = formatDate(notif.createdAt);
  const cfg = getConfig(notif.type);
  const Icon = cfg.icon;
  const email =
    m.email ||
    m.senderEmail ||
    m.userEmail ||
    (typeof m.senderId === "object" ? m.senderId?.email : null);
  const phone =
    m.phone ||
    m.senderPhone ||
    (typeof m.senderId === "object" ? m.senderId?.phone : null);
  const location = m.city || m.location;
  const username = m.username || m.userName;
  const userId = toStr(m.senderId || m.userId || m.studentId || "");

  const roleLabel =
    notif.type === "booking"
      ? "Enrolled Student"
      : notif.type === "register"
        ? "New Member"
        : notif.type === "rating"
          ? "Course Reviewer"
          : notif.type === "comment"
            ? "Active Learner"
            : "Student";

  const activityStats = [
    notif.type === "booking" && {
      label: "Enrolled",
      value: m.courseName || "1 Course",
      icon: GraduationCap,
      color: "text-emerald-400",
    },
    notif.type === "rating" && {
      label: "Rating Given",
      value: `${safeRating(m.rating)} ★`,
      icon: Star,
      color: "text-amber-400",
    },
    notif.type === "comment" && {
      label: "Commented",
      value: "On Course",
      icon: MessageSquare,
      color: "text-blue-400",
    },
    notif.type === "register" && {
      label: "Status",
      value: "Just Joined",
      icon: UserPlus,
      color: "text-purple-400",
    },
    m.amount && {
      label: "Amount Paid",
      value: m.amount,
      icon: Wallet,
      color: "text-emerald-400",
    },
    m.paymentStatus && {
      label: "Payment",
      value: m.paymentStatus,
      icon: Shield,
      color: m.paymentStatus === "Paid" ? "text-emerald-400" : "text-amber-400",
    },
    m.plan && {
      label: "Plan",
      value: m.plan,
      icon: Package,
      color: "text-cyan-400",
    },
    m.orderStatus && {
      label: "Order",
      value: m.orderStatus,
      icon: BarChart3,
      color: "text-indigo-400",
    },
  ].filter(Boolean);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-5 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 border border-indigo-500/25 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/60 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div
          className={`h-1 rounded-t-2xl bg-gradient-to-r ${cfg.gradient} via-indigo-400/50 to-transparent`}
        />
        <div className="p-6">
          <div className="flex justify-between items-start mb-5">
            <div className="flex gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${cfg.badge}`}
              >
                <Icon size={8} /> {cfg.label} Alert
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Live
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg border border-white/8 bg-white/4 text-white/40 flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <X size={13} />
            </button>
          </div>

          <div className="flex gap-4 items-start mb-6">
            <div className="relative shrink-0">
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatarClass} border-2 flex items-center justify-center text-2xl font-black`}
              >
                {getInitials(hasRealName ? name : "")}
              </div>
              <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl font-black text-white tracking-tight">
                  {hasRealName ? (
                    name
                  ) : (
                    <span className="text-white/30 italic font-normal text-sm">
                      Name not available
                    </span>
                  )}
                </h2>
                {hasRealName && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-300 border border-emerald-500/20 uppercase tracking-wider">
                    ✓ Verified
                  </span>
                )}
              </div>
              {username && (
                <div className="flex items-center gap-1.5 mb-1">
                  <AtSign size={11} className="text-indigo-400" />
                  <span className="text-[13px] font-semibold text-indigo-300">
                    {username.replace(/^@/, "")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-white/30">{roleLabel}</span>
                <span className="text-white/20">·</span>
                <span className="text-[11px] text-white/30">{dt.relative}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5 mb-5" />

          {(email || phone || location || username) && (
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">
                Contact Info
              </p>
              <div className="flex flex-col gap-2">
                {[
                  username && {
                    icon: AtSign,
                    label: "Username",
                    value: username,
                    cls: "bg-indigo-500/7 border-indigo-500/15",
                    iconCls: "bg-indigo-500/12 text-indigo-400",
                    textCls: "text-indigo-300",
                  },
                  email && {
                    icon: Mail,
                    label: "Email",
                    value: email,
                    cls: "bg-blue-500/7 border-blue-500/15",
                    iconCls: "bg-blue-500/12 text-blue-400",
                    textCls: "text-blue-300",
                  },
                  phone && {
                    icon: Phone,
                    label: "Phone",
                    value: phone,
                    cls: "bg-emerald-500/7 border-emerald-500/15",
                    iconCls: "bg-emerald-500/12 text-emerald-400",
                    textCls: "text-emerald-300",
                  },
                  location && {
                    icon: MapPin,
                    label: "Location",
                    value: location,
                    cls: "bg-purple-500/7 border-purple-500/15",
                    iconCls: "bg-purple-500/12 text-purple-400",
                    textCls: "text-purple-300",
                  },
                ]
                  .filter(Boolean)
                  .map(({ icon: Ic, label, value, cls, iconCls, textCls }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border ${cls}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconCls}`}
                      >
                        <Ic size={12} />
                      </div>
                      <div>
                        <p className="text-[9px] text-white/25 uppercase tracking-wider mb-0.5">
                          {label}
                        </p>
                        <p className={`text-[13px] font-semibold ${textCls}`}>
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activityStats.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">
                Activity Details
              </p>
              <div className="grid grid-cols-2 gap-2">
                {activityStats.map(({ label, value, icon: Ic, color }) => (
                  <div
                    key={label}
                    className="p-2.5 rounded-xl bg-white/2.5 border border-white/6"
                  >
                    <div
                      className={`flex items-center gap-1.5 mb-1.5 ${color}`}
                    >
                      <Ic size={10} />
                      <p className="text-[9px] text-white/25 uppercase tracking-wider">
                        {label}
                      </p>
                    </div>
                    <p className={`text-[13px] font-bold truncate ${color}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {m.courseName && m.courseName !== "Unknown Course" && (
            <div className="mb-5 p-3 rounded-xl bg-cyan-500/6 border border-cyan-500/15">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <BookOpen size={14} className="text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-white/25 uppercase tracking-wider mb-0.5">
                    Course
                  </p>
                  <p className="text-[13px] font-bold text-cyan-300 truncate">
                    {m.courseName}
                  </p>
                </div>
                {m.category && (
                  <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 uppercase shrink-0">
                    {m.category}
                  </span>
                )}
              </div>
            </div>
          )}

          {notif.type === "rating" && (
            <div className="mb-5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-[9px] text-white/25 uppercase tracking-wider mb-2">
                Rating Given
              </p>
              <StarRating rating={m.rating ?? 0} size={16} />
              {m.review && (
                <p className="text-[12px] text-white/55 mt-2 leading-relaxed italic">
                  "{m.review}"
                </p>
              )}
            </div>
          )}

          {notif.type === "comment" && extractCommentText(m) && (
            <div className="mb-5 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 border-l-4 border-l-blue-500/40">
              <p className="text-[9px] text-white/25 uppercase tracking-wider mb-2">
                Comment
              </p>
              <p className="text-[13px] text-white/65 leading-relaxed italic">
                "{extractCommentText(m)}"
              </p>
            </div>
          )}

          <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/12 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-indigo-400" />
              <div>
                <p className="text-[9px] text-white/25 uppercase tracking-wider mb-0.5">
                  Activity Time
                </p>
                <p className="text-[12px] font-semibold text-white/55">
                  {dt.full} · {dt.time}
                </p>
              </div>
            </div>
            {userId && (
              <div className="text-right">
                <p className="text-[9px] text-white/25 uppercase tracking-wider mb-0.5">
                  User ID
                </p>
                <p className="text-[10px] font-mono text-white/25">
                  {userId.slice(0, 12)}…
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ReplyBox ─────────────────────────────────────────────────────────────────
const ReplyBox = ({ notif, onReplySent, onOpenComments }) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentText, setSentText] = useState("");

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await API.post(`/api/comments/admin/${notif.metadata?.courseId}/reply`, {
        notificationId: notif._id,
        message: text.trim(),
        commentId: notif.metadata?.commentId,
        studentId: notif.metadata?.senderId,
      });
      setSentText(text.trim());
      setSent(true);
      setText("");
      onReplySent?.(notif._id);
    } catch (err) {
      console.error("Reply failed:", err);
    } finally {
      setSending(false);
    }
  };

  if (sent)
    return (
      <div className="flex items-start gap-2.5 mt-3.5 p-3 rounded-xl bg-emerald-500/7 border border-emerald-500/18">
        <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-[12px] font-bold text-emerald-400 mb-0.5">
            Reply sent successfully
          </p>
          <p className="text-[11px] text-white/30">"{sentText}"</p>
        </div>
      </div>
    );

  const senderName = notif.metadata?.senderName;
  const hasRealName =
    senderName && senderName !== "Student" && senderName !== "undefined";

  return (
    <div className="mt-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
        Reply to {hasRealName ? senderName : "student"}
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Write a reply to ${hasRealName ? senderName : "the student"}…`}
        rows={3}
        className="w-full rounded-xl text-[13px] text-white bg-white/2.5 border border-white/7 px-3 py-2.5 outline-none resize-none transition-all focus:border-indigo-500/40 focus:bg-indigo-500/4 placeholder-white/18"
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={onOpenComments}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold text-cyan-300 bg-cyan-500/7 border border-cyan-500/18 hover:bg-cyan-500/15 transition-all"
        >
          <ExternalLink size={11} /> Open Comments
        </button>
        <button
          onClick={() => setText("")}
          disabled={!text || sending}
          className="px-3.5 py-1.5 rounded-lg text-[12px] font-semibold text-white/45 bg-transparent border border-white/7 disabled:opacity-40 hover:text-white/65 transition-all"
        >
          Clear
        </button>
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/28 disabled:opacity-40 hover:bg-indigo-500/25 transition-all"
        >
          <Send size={11} /> {sending ? "Sending…" : "Send Reply"}
        </button>
      </div>
    </div>
  );
};

// ─── CommentBubble ────────────────────────────────────────────────────────────
const CommentBubble = ({ text, senderName, expanded, onToggle }) => {
  if (!text) return null;
  const isLong = text.length > 160;
  const displayText = !expanded && isLong ? text.slice(0, 160) + "…" : text;

  return (
    <div className="relative mt-2 mb-1 group/bubble">
      <div className="absolute -top-1.5 -left-1 opacity-20">
        <Quote size={18} className="text-blue-400 fill-blue-400/30" />
      </div>
      <div className="pl-5 pr-3 py-2.5 rounded-r-2xl rounded-bl-2xl bg-gradient-to-br from-blue-500/8 via-blue-500/5 to-transparent border border-blue-500/15 border-l-[3px] border-l-blue-400/50">
        <p className="text-[12.5px] text-white/70 leading-relaxed tracking-wide">
          {displayText}
        </p>
        {isLong && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="mt-1.5 text-[10px] font-bold text-blue-400/70 hover:text-blue-300 transition-colors"
          >
            {expanded ? "Show less ↑" : "Read more ↓"}
          </button>
        )}
      </div>
    </div>
  );
};

// ─── NotifCard ────────────────────────────────────────────────────────────────
const NotifCard = ({
  notif,
  onMarkRead,
  onDelete,
  onReplySent,
  onOpenProfile,
  onOpenChat,
  index,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [commentExpanded, setCommentExpanded] = useState(false);
  const cfg = getConfig(notif.type);
  const Icon = cfg.icon;
  const m = notif.metadata || {};

  const commentText = notif.type === "comment" ? extractCommentText(m) : "";

  const displayName = m.senderName;
  const hasRealName =
    displayName &&
    displayName !== "Student" &&
    displayName !== "undefined" &&
    displayName !== "null" &&
    !isMongoId(displayName);
  const displayCourse =
    m.courseName && m.courseName !== "Unknown Course" ? m.courseName : null;
  const username = m.username || m.userName;

  const buildPreview = () => {
    const name = hasRealName ? displayName : "A student";
    switch (notif.type) {
      case "rating": {
        const r = safeRating(m.rating);
        return displayCourse
          ? `${name} rated "${displayCourse}" — ${r} star${r !== 1 ? "s" : ""}`
          : `${name} gave a ${r}-star rating`;
      }
      case "booking": {
        const amt = m.amount && m.amount !== "₹0" ? m.amount : "Free";
        return displayCourse
          ? `${name} enrolled in "${displayCourse}" · ${amt}`
          : `${name} enrolled · ${amt}`;
      }
      case "register":
        return `${name} just registered on the platform`;
      default:
        return (
          (notif.message || "")
            .replace(
              /"undefined"/g,
              displayCourse ? `"${displayCourse}"` : "a course",
            )
            .replace(/undefined/g, displayCourse || "course")
            .trim() || `${name} triggered a notification`
        );
    }
  };

  // ── Main card click → open admin chat ────────────────────────────────────
  const handleCardClick = () => {
    if (!notif.read) onMarkRead(notif._id);
    onOpenChat(notif);
  };

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
        notif.read
          ? "bg-white/1 border-white/5 shadow-none"
          : "bg-slate-900 border-white/10 shadow-lg shadow-black/40"
      }`}
      style={{ animationDelay: `${index * 0.035}s` }}
    >
      {/* Unread accent bar */}
      {!notif.read && (
        <div
          className={`h-0.5 w-full bg-gradient-to-r ${cfg.gradient} via-transparent to-transparent`}
        />
      )}

      <div
        onClick={handleCardClick}
        className="flex items-start gap-3 px-4 py-3.5"
      >
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border ${cfg.icon_wrap}`}
        >
          <Icon size={16} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${cfg.badge}`}
            >
              <Icon size={8} /> {cfg.label}
            </span>
            {displayCourse && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-cyan-500/10 border border-cyan-500/22 text-cyan-300 max-w-[180px] truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                {displayCourse}
              </span>
            )}
            {notif.type === "rating" && (
              <StarRating rating={m.rating ?? 0} size={11} />
            )}
            {notif.type === "booking" && m.amount && (
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
                {m.amount}
              </span>
            )}
            <div className="ml-auto flex items-center gap-1.5">
              {!notif.read && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`}
                />
              )}
              <span className="text-[11px] text-white/30">
                {formatDate(notif.createdAt).relative}
              </span>
            </div>
          </div>

          {/* Title */}
          <p
            className={`text-[13px] leading-snug mb-1 ${notif.read ? "font-medium text-white/55" : "font-bold text-white"}`}
          >
            {notif.title}
          </p>

          {/* Comment text or preview */}
          {notif.type === "comment" && commentText ? (
            <CommentBubble
              text={commentText}
              senderName={displayName}
              expanded={commentExpanded}
              onToggle={() => setCommentExpanded((p) => !p)}
            />
          ) : notif.type !== "comment" ? (
            <p className="text-[12px] text-white/30 leading-relaxed line-clamp-2">
              {buildPreview()}
            </p>
          ) : (
            <div className="mt-1.5 px-3 py-2 rounded-xl bg-blue-500/5 border border-blue-500/10 border-dashed">
              <p className="text-[11px] text-white/20 italic">
                Comment text not available in metadata
              </p>
            </div>
          )}

          {/* Sender chip */}
          {hasRealName && (
            <div className="flex items-center gap-1.5 mt-2">
              <div
                className={`w-4 h-4 rounded-full bg-gradient-to-br ${getAvatarClass(displayName)} border flex items-center justify-center text-[7px] font-black shrink-0`}
              >
                {getInitials(displayName)}
              </div>
              <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/8 border border-indigo-500/18 px-2 py-0.5 rounded-md">
                {displayName}
              </span>
              {username && (
                <span className="text-[10px] font-semibold text-indigo-300/70 bg-indigo-500/5 border border-indigo-500/12 px-2 py-0.5 rounded-md">
                  @{username.replace(/^@/, "")}
                </span>
              )}
              {/* Chat open hint */}
              <span className="ml-auto text-[9px] text-white/20 italic flex items-center gap-1">
                <MessageSquare size={9} className="text-indigo-400/50" />
                Click to open chat
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenProfile(notif);
            }}
            title="View Profile"
            className="p-1.5 rounded-lg bg-indigo-500/7 text-indigo-400 hover:bg-indigo-500/15 transition-all"
          >
            <User size={14} />
          </button>
          {notif.type === "comment" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!notif.read) onMarkRead(notif._id);
                setExpanded((p) => !p);
              }}
              title="Quick Reply"
              className={`p-1.5 rounded-lg transition-all ${expanded ? "bg-blue-500/15 text-blue-300" : "bg-blue-500/7 text-blue-400 hover:bg-blue-500/15"}`}
            >
              <MessageSquare size={14} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notif._id);
            }}
            className="p-1.5 rounded-lg bg-white/3 text-white/20 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded quick-reply section (only for comment type) */}
      {expanded && notif.type === "comment" && (
        <div className="px-4 pb-4 pt-3 border-t border-white/5">
          {commentText && commentText.length > 120 && (
            <div className="mb-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/12 border-l-[3px] border-l-blue-500/35">
              <p className="text-[9px] text-white/25 uppercase tracking-wider mb-1.5">
                Full Comment
              </p>
              <p className="text-[13px] text-white/55 leading-relaxed italic">
                "{commentText}"
              </p>
            </div>
          )}
          <ReplyBox
            notif={notif}
            onReplySent={onReplySent}
            onOpenComments={() => onOpenChat(notif)}
          />
        </div>
      )}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="flex flex-col gap-2">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="h-20 rounded-2xl bg-gradient-to-r from-white/1 via-white/3 to-white/1 bg-[length:600px_100%] animate-shimmer"
        style={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>
);

// ─── StatsBar ─────────────────────────────────────────────────────────────────
const StatsBar = ({ notifications }) => {
  const enrollments = notifications.filter((n) => n.type === "booking").length;
  const comments = notifications.filter((n) => n.type === "comment").length;
  const ratings = notifications.filter((n) => n.type === "rating");
  const avgRating = ratings.length
    ? (
        ratings.reduce((s, n) => s + safeRating(n.metadata?.rating), 0) /
        ratings.length
      ).toFixed(1)
    : "—";
  const unread = notifications.filter((n) => !n.read).length;
  const revenue = notifications
    .filter((n) => n.type === "booking" && n.metadata?.amount)
    .reduce(
      (s, n) =>
        s + (parseFloat((n.metadata.amount || "").replace(/[₹,]/g, "")) || 0),
      0,
    );

  const stats = [
    {
      label: "Enrollments",
      value: enrollments,
      icon: GraduationCap,
      color: "text-emerald-400",
      glow: "from-emerald-500/25",
      badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      trend: "+12%",
    },
    {
      label: "Comments",
      value: comments,
      icon: MessageSquare,
      color: "text-blue-400",
      glow: "from-blue-500/25",
      badge: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      trend: "+5%",
    },
    {
      label: "Avg Rating",
      value: avgRating,
      icon: Star,
      color: "text-amber-400",
      glow: "from-amber-500/25",
      badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      trend: "★",
    },
    {
      label: "Unread",
      value: unread,
      icon: Bell,
      color: "text-red-400",
      glow: "from-red-500/25",
      badge: "text-red-400 bg-red-500/10 border-red-500/20",
      trend: "new",
    },
    ...(revenue > 0
      ? [
          {
            label: "Revenue",
            value: `₹${revenue.toLocaleString("en-IN")}`,
            icon: TrendingUp,
            color: "text-indigo-400",
            glow: "from-indigo-500/25",
            badge: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
            trend: "+8%",
          },
        ]
      : []),
  ];

  return (
    <div
      className="grid gap-2 mb-5"
      style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
    >
      {stats.map(({ label, value, icon: Ic, color, glow, badge, trend }) => (
        <div
          key={label}
          className="relative p-3.5 rounded-2xl bg-slate-900 border border-white/6 overflow-hidden group hover:-translate-y-0.5 transition-all"
        >
          <div
            className={`absolute -top-4 -right-4 w-14 h-14 rounded-full bg-gradient-to-br ${glow} to-transparent blur-xl opacity-60 group-hover:opacity-90 transition-opacity`}
          />
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center ${color} bg-white/4 border border-white/6`}
              >
                <Ic size={11} />
              </div>
              <span className="text-[9px] font-semibold text-white/30 uppercase tracking-wider">
                {label}
              </span>
            </div>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${badge}`}
            >
              {trend}
            </span>
          </div>
          <span
            className={`text-2xl font-black ${color} leading-none tracking-tight`}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── SearchBar ────────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange }) => (
  <div className="relative mb-4">
    <Search
      size={13}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
    />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search by student name, username, course, or content…"
      className="w-full py-2.5 pl-9 pr-3 bg-white/3 border border-white/6 rounded-xl text-[13px] text-white outline-none focus:border-indigo-500/40 focus:bg-indigo-500/4 transition-all placeholder-white/18"
    />
    {value && (
      <button
        onClick={() => onChange("")}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors text-sm"
      >
        ✕
      </button>
    )}
  </div>
);

// ─── Main NotificationsPage ───────────────────────────────────────────────────
const NotificationsPage = () => {
  const navigate = useNavigate();
  const {
    notifications: rawNotifications,
    loading,
    loadNotifications,
    markRead,
    markAllRead,
    deleteOne,
    clearAll,
  } = useNotifications();

  const [enrichedNotifications, setEnrichedNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [enriching, setEnriching] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [profileModal, setProfileModal] = useState(null);

  const bookingMapRef = useRef({});
  const courseMapRef = useRef({});
  const userMapRef = useRef({});
  const commentTextMapRef = useRef({});
  const mapsLoadedRef = useRef(false);

  const loadMaps = useCallback(async () => {
    if (mapsLoadedRef.current) return;
    try {
      const [bookingRes, courseRes, usersRes] = await Promise.allSettled([
        API.get("/api/booking?limit=200&page=1"),
        API.get("/api/course/public"),
        API.get("/api/users/all?limit=500&page=1").catch(() => ({ data: [] })),
      ]);

      if (usersRes.status === "fulfilled") {
        const uData = usersRes.value?.data;
        const users = uData?.users || uData?.data || uData || [];
        if (Array.isArray(users)) {
          users.forEach((u) => {
            const uid = toStr(u._id || u.id || "");
            if (!uid) return;
            userMapRef.current[uid] = {
              name: u.name || u.fullName || u.username || null,
              username: u.username || null,
              email: u.email || null,
              phone: u.phone || null,
            };
          });
        }
      }

      if (courseRes.status === "fulfilled") {
        let raw = courseRes.value.data;
        if (raw?.data) raw = raw.data;
        const arr = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.courses)
            ? raw.courses
            : Array.isArray(raw?.items)
              ? raw.items
              : [];
        arr.forEach((c) => {
          const key = toStr(c._id || c.id);
          if (!key) return;
          const lectures = c.courseLectures || c.lectures || c.contents || [];
          courseMapRef.current[key] = {
            name: c.name || c.title || null,
            instructor: c.teacher || c.instructor || null,
            rating: Math.min(5, Math.max(0, Number(c.rating) || 0)),
            lectureCount: lectures.length || 0,
            duration: fmtDuration(
              parseDuration(
                c.totalDuration || c.duration || c.totalDurationObj,
              ),
            ),
            category: c.category || null,
          };
        });
      }

      if (bookingRes.status === "fulfilled") {
        const bData = bookingRes.value.data;
        const bookings = bData?.bookings || bData || [];
        bookings.forEach((b) => {
          const userObj = b.userId || b.user || b.student;
          const sid =
            toStr(typeof userObj === "object" ? userObj?._id : userObj) ||
            toStr(b.studentId || "");
          if (!sid || bookingMapRef.current[sid]) return;
          const resolvedName =
            extractName(userObj) ||
            extractName(b.student) ||
            extractName(b.user) ||
            b.studentName ||
            null;
          const resolvedUsername =
            extractUsername(userObj) ||
            extractUsername(b.user) ||
            (userObj?.username ? `@${userObj.username}` : null) ||
            (userObj?.email ? `@${userObj.email.split("@")[0]}` : null);
          bookingMapRef.current[sid] = {
            studentName: resolvedName,
            username: resolvedUsername,
            email: userObj?.email || b.email || null,
            phone: userObj?.phone || b.phone || null,
            plan:
              b.validity === "lifetime"
                ? "Lifetime"
                : b.validity === "1year"
                  ? "1 Year"
                  : b.validity === "2year"
                    ? "2 Years"
                    : b.validity || null,
            amount: b.price != null ? `₹${b.price}` : null,
            paymentMethod: b.paymentMethod || null,
            orderStatus: b.orderStatus || null,
            paymentStatus: b.paymentStatus || null,
            purchaseDate: b.createdAt
              ? new Date(b.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : null,
            expiresAt: b.expiresAt
              ? new Date(b.expiresAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : null,
          };
        });
      }
      mapsLoadedRef.current = true;
    } catch (err) {
      console.error("Failed to load lookup maps:", err);
    }
  }, []);

  const loadCommentTexts = useCallback(async (commentNotifs) => {
    if (!commentNotifs.length) return;
    const byCourse = {};
    for (const n of commentNotifs) {
      const cid = toStr(n.metadata?.courseId);
      if (!cid) continue;
      if (!byCourse[cid]) byCourse[cid] = [];
      byCourse[cid].push(n);
    }

    await Promise.allSettled(
      Object.entries(byCourse).map(async ([courseId, notifs]) => {
        try {
          const res = await API.get(`/api/comments/${courseId}`);
          let arr = res.data;
          if (Array.isArray(arr?.data)) arr = arr.data;
          else if (Array.isArray(arr?.comments)) arr = arr.comments;
          else if (Array.isArray(arr?.results)) arr = arr.results;
          else if (!Array.isArray(arr)) {
            if (arr && typeof arr === "object") {
              for (const v of Object.values(arr)) {
                if (Array.isArray(v)) {
                  arr = v;
                  break;
                }
              }
            }
          }
          if (!Array.isArray(arr)) return;
          arr.forEach((c) => {
            const cid = String(c._id || "");
            if (cid && (c.message || c.text || c.content)) {
              commentTextMapRef.current[cid] =
                c.message || c.text || c.content || "";
            }
          });
        } catch (e) {
          console.warn(
            `Comment fetch failed for course ${courseId}:`,
            e?.message,
          );
        }
      }),
    );
  }, []);

  const enrichNotifications = useCallback(async () => {
    if (!rawNotifications.length) {
      setEnrichedNotifications([]);
      return;
    }
    setEnriching(true);
    await loadMaps();

    const commentNotifs = rawNotifications.filter((n) => n.type === "comment");
    await loadCommentTexts(commentNotifs);

    const bMap = bookingMapRef.current;
    const cMap = courseMapRef.current;
    const uMap = userMapRef.current;
    const ctMap = commentTextMapRef.current;

    const enriched = rawNotifications.map((n) => {
      const meta = { ...(n.metadata || {}) };
      const resolvedName = resolveRealSenderName(meta, bMap, uMap);
      meta.senderName = resolvedName || "Student";
      meta.username = resolveUsername(meta, bMap, uMap);

      const idFields = [meta.senderId, meta.userId, meta.studentId];
      for (const idField of idFields) {
        const sid = toStr(idField);
        if (sid && bMap[sid]) {
          const sbm = bMap[sid];
          if (!meta.email && sbm.email) meta.email = sbm.email;
          if (!meta.phone && sbm.phone) meta.phone = sbm.phone;
          if (meta.senderName === "Student" && sbm.studentName)
            meta.senderName = sbm.studentName;
          if (!meta.username && sbm.username) meta.username = sbm.username;
          break;
        }
      }
      for (const idField of idFields) {
        const sid = toStr(idField);
        if (sid && uMap[sid]) {
          const u = uMap[sid];
          if (!meta.email && u.email) meta.email = u.email;
          if (!meta.phone && u.phone) meta.phone = u.phone;
          if (!meta.username && u.username)
            meta.username = u.username.startsWith("@")
              ? u.username
              : `@${u.username}`;
          break;
        }
      }

      const cid = toStr(meta.courseId);
      const cm = (cid && cMap[cid]) || {};
      const resolvedCourseName =
        resolveCourseNameFromMetadata(meta) ||
        cm.name ||
        extractCourseNameFromMessage(n.message || n.title);
      if (resolvedCourseName && resolvedCourseName !== "Unknown Course")
        meta.courseName = resolvedCourseName;
      else if (!meta.courseName || meta.courseName === "Unknown Course")
        meta.courseName = cm.name || undefined;
      if (!meta.instructor && cm.instructor) meta.instructor = cm.instructor;
      if (!meta.category && cm.category) meta.category = cm.category;
      if (!meta.duration && cm.duration) meta.duration = cm.duration;

      if (n.type === "comment") {
        const existingText = extractCommentText(meta);
        if (existingText) {
          meta.commentText = existingText;
        } else {
          const commentId = toStr(meta.commentId);
          if (commentId && ctMap[commentId]) {
            meta.commentText = ctMap[commentId];
          } else {
            for (const idField of [meta.commentId, meta._id, n._id]) {
              const id = toStr(idField);
              if (id && ctMap[id]) {
                meta.commentText = ctMap[id];
                break;
              }
            }
          }
        }
      }

      if (n.type === "booking") {
        for (const idField of idFields) {
          const sid = toStr(idField);
          if (sid && bMap[sid]) {
            const sbm = bMap[sid];
            if (!meta.plan && sbm.plan) meta.plan = sbm.plan;
            if (!meta.amount && sbm.amount) meta.amount = sbm.amount;
            if (!meta.paymentMethod && sbm.paymentMethod)
              meta.paymentMethod = sbm.paymentMethod;
            if (!meta.orderStatus && sbm.orderStatus)
              meta.orderStatus = sbm.orderStatus;
            if (!meta.paymentStatus && sbm.paymentStatus)
              meta.paymentStatus = sbm.paymentStatus;
            if (!meta.purchaseDate && sbm.purchaseDate)
              meta.purchaseDate = sbm.purchaseDate;
            if (!meta.expiresAt && sbm.expiresAt)
              meta.expiresAt = sbm.expiresAt;
            break;
          }
        }
      }

      meta.avatar = getInitials(meta.senderName);
      return { ...n, metadata: meta };
    });

    setEnrichedNotifications(enriched);
    setEnriching(false);
  }, [rawNotifications, loadMaps, loadCommentTexts]);

  useEffect(() => {
    enrichNotifications();
  }, [enrichNotifications]);

  // ── Navigate to Admin Chat with student pre-selected ─────────────────────
  const handleOpenChat = useCallback(
    (notif) => {
      const m = notif.metadata || {};
      const studentId = toStr(m.senderId || m.userId || m.studentId || "");
      const studentName =
        m.senderName && m.senderName !== "Student" ? m.senderName : null;

      navigate("/admin/comments", {
        state: {
          // Tell AdminCommentPage to open chat tab
          openChatTab: true,
          highlightStudentId: studentId || null,
          highlightStudentName: studentName,
          // Keep old fields for fallback compatibility
          highlightCommentId: m.commentId || null,
          courseId: toStr(m.courseId) || null,
        },
      });
    },
    [navigate],
  );

  let filtered =
    filter === "All"
      ? enrichedNotifications
      : enrichedNotifications.filter((n) => n.type === filter);
  if (showUnreadOnly) filtered = filtered.filter((n) => !n.read);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter((n) => {
      const m = n.metadata || {};
      return (
        (m.senderName || "").toLowerCase().includes(q) ||
        (m.username || "").toLowerCase().includes(q) ||
        (m.courseName || "").toLowerCase().includes(q) ||
        (n.title || "").toLowerCase().includes(q) ||
        (n.message || "").toLowerCase().includes(q) ||
        (m.commentText || m.comment || "").toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q)
      );
    });
  }

  const unread = enrichedNotifications.filter((n) => !n.read).length;
  const isLoading = loading || enriching;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 py-8">
        {profileModal && (
          <UserProfileModal
            notif={profileModal}
            onClose={() => setProfileModal(null)}
          />
        )}

        {/* Header */}
        <div className="mb-7">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/15 border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
                  <Activity size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white leading-none">
                    Activity Feed
                  </h1>
                  <p className="text-[11px] text-white/30 mt-0.5">
                    Real-time student activity · Click any notification to open
                    chat
                  </p>
                </div>
                {unread > 0 && (
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-red-500/12 text-red-400 border border-red-500/22">
                    {unread} unread
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <button
                onClick={() => setShowUnreadOnly((p) => !p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${showUnreadOnly ? "text-indigo-300 bg-indigo-500/12 border-indigo-500/25" : "text-white/45 bg-transparent border-white/6 hover:border-white/12"}`}
              >
                {showUnreadOnly ? <Eye size={11} /> : <EyeOff size={11} />}
                {showUnreadOnly ? "All" : "Unread"}
              </button>
              <button
                onClick={() => {
                  mapsLoadedRef.current = false;
                  loadNotifications();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white/45 bg-transparent border border-white/6 hover:border-white/12 transition-all"
              >
                <RefreshCw size={11} /> Refresh
              </button>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-indigo-300 bg-indigo-500/12 border border-indigo-500/25 hover:bg-indigo-500/20 transition-all"
                >
                  <CheckCheck size={11} /> Mark all read
                </button>
              )}
              {enrichedNotifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-400 bg-red-500/7 border border-red-500/18 hover:bg-red-500/14 transition-all"
                >
                  <Trash2 size={11} /> Clear all
                </button>
              )}
            </div>
          </div>
        </div>

        {!isLoading && enrichedNotifications.length > 0 && (
          <StatsBar notifications={enrichedNotifications} />
        )}
        {!isLoading && enrichedNotifications.length > 0 && (
          <SearchBar value={search} onChange={setSearch} />
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5 mb-4 items-center">
          <Filter size={11} className="text-white/25 mr-1 shrink-0" />
          {FILTERS.map((f) => {
            const count =
              f === "All"
                ? enrichedNotifications.length
                : enrichedNotifications.filter((n) => n.type === f).length;
            if (f !== "All" && count === 0) return null;
            const cfg = f !== "All" ? getConfig(f) : null;
            const FIcon = cfg?.icon;
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all hover:-translate-y-px ${
                  isActive
                    ? cfg
                      ? `${cfg.badge}`
                      : "text-indigo-300 bg-indigo-500/12 border-indigo-500/25"
                    : "text-white/45 bg-transparent border-white/6 hover:border-white/12"
                }`}
              >
                {FIcon && <FIcon size={9} />}
                {f === "All" ? "All" : TYPE_CONFIG[f]?.label || f}
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg ${isActive ? "bg-white/12 text-white" : "bg-white/5 text-white/30"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 mb-3.5 p-3 rounded-xl bg-red-500/7 border border-red-500/18">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <p className="text-[13px] text-red-300 flex-1">{error}</p>
            <button
              onClick={() => {
                mapsLoadedRef.current = false;
                loadNotifications();
              }}
              className="text-[11px] font-bold text-red-400 hover:text-red-300 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <Skeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/2.5 border border-white/6">
              <BellOff size={28} className="text-white/20" />
            </div>
            <p className="text-[14px] font-bold text-white/45">
              No notifications found
            </p>
            <p className="text-[12px] text-white/25">
              {filter !== "All"
                ? `No ${TYPE_CONFIG[filter]?.label || filter} notifications yet`
                : showUnreadOnly
                  ? "All caught up — no unread notifications"
                  : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {filtered.map((n, i) => (
              <NotifCard
                key={n._id}
                notif={n}
                index={i}
                onMarkRead={markRead}
                onDelete={deleteOne}
                onReplySent={(id) => markRead(id)}
                onOpenProfile={(notif) => setProfileModal(notif)}
                onOpenChat={handleOpenChat}
              />
            ))}
            <p className="text-center text-[11px] text-white/20 pt-4 pb-1">
              Showing {filtered.length} notification
              {filtered.length !== 1 ? "s" : ""}
              {filter !== "All"
                ? ` · filtered by ${TYPE_CONFIG[filter]?.label || filter}`
                : ""}
              {search ? ` matching "${search}"` : ""}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .animate-shimmer { animation: shimmer 1.6s infinite linear; }
      `}</style>
    </div>
  );
};

export default NotificationsPage;
