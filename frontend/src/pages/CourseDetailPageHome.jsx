import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  Play,
  Clock3,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Loader2,
  Lock,
  ArrowLeft,
  Award,
  User2,
  Sparkles,
  GraduationCap,
  X,
  Layers3,
  Star,
  Shield,
  Infinity,
  CalendarCheck,
  CalendarDays,
  BadgeIndianRupee,
  TrendingUp,
  Zap,
  FileText,
  MessageSquare,
  ChevronUp,
  PlayCircle,
  BarChart3,
  Video,
} from "lucide-react";
import CommentBox from "../components/CommentBox";
import ResourceList from "../components/ResourceList";
import ThreadChatModal from "../components/ThreadChatModal";
import useWatchTracker from "../hooks/useWatchTracker";

/* =========================================================
   CONFIG
========================================================= */
const API_BASE = import.meta.env.VITE_API_BASE;
const TOKEN_KEY = "token";

/* =========================================================
   HELPERS
========================================================= */
const toNum = (v, fb = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
};

const fmtMinutes = (value = 0) => {
  if (typeof value === "object" && value !== null) {
    const h = toNum(value.hours);
    const m = toNum(value.minutes);
    if (h <= 0) return `${m}m`;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  const mins = toNum(value);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const fmtCurrency = (v) =>
  v != null ? `₹${toNum(v).toLocaleString("en-IN")}` : "";

const toEmbedUrl = (url = "") => {
  try {
    if (!url) return "";
    if (url.includes("/embed/")) return url;
    const watch = url.match(/[?&]v=([^&#]+)/);
    if (watch?.[1]) return `https://www.youtube.com/embed/${watch[1]}`;
    const short = url.match(/youtu\.be\/([^?&#/]+)/);
    if (short?.[1]) return `https://www.youtube.com/embed/${short[1]}`;
    return url;
  } catch {
    return url;
  }
};

const appendAutoplay = (url, autoplay = false) => {
  if (!url) return "";
  const origin = encodeURIComponent(window.location.origin);
  const base = url.includes("?")
    ? `${url}&enablejsapi=1&origin=${origin}`
    : `${url}?enablejsapi=1&origin=${origin}`;
  return autoplay ? `${base}&autoplay=1` : base;
};

const normalizeCourse = (course) => {
  if (!course) return null;
  return {
    ...course,
    lectures: (course.lectures || []).map((l) => ({
      ...l,
      durationMin: l.durationMin || l.totalMinutes || 0,
      chapters: (l.chapters || []).map((c) => ({
        ...c,
        durationMin: c.durationMin || c.totalMinutes || 0,
      })),
    })),
  };
};

/* =========================================================
   VALIDITY OPTIONS
========================================================= */
const VALIDITY_OPTIONS = [
  {
    key: "1year",
    label: "1 Year",
    sublabel: "Best for short-term learners",
    icon: CalendarCheck,
    accent: "cyan",
    badge: null,
  },
  {
    key: "2year",
    label: "2 Years",
    sublabel: "Most popular choice",
    icon: CalendarDays,
    accent: "indigo",
    badge: "Popular",
  },
  {
    key: "lifetime",
    label: "Lifetime",
    sublabel: "One-time, forever access",
    icon: Infinity,
    accent: "emerald",
    badge: "Best Value",
  },
];

const VALIDITY_MULTIPLIER = { "1year": 1, "2year": 1.6, lifetime: 2.2 };

/* =========================================================
   ENROLL MODAL
========================================================= */
const EnrollModal = ({ course, onClose, onConfirm, isEnrolling }) => {
  const [selected, setSelected] = useState("lifetime");

  const courseIsFree =
    course?.isFree || course?.pricingType === "free" || !course?.price?.sale;

  const basePrice = toNum(course?.price?.sale || course?.price?.original || 0);

  const getPrice = (key) =>
    courseIsFree ? 0 : Math.round(basePrice * VALIDITY_MULTIPLIER[key]);

  const accentMap = {
    cyan: {
      border: "border-cyan-500/40",
      bg: "bg-cyan-500/10",
      text: "text-cyan-300",
      ring: "ring-cyan-400/20",
      badge: "bg-cyan-500/20 text-cyan-300",
    },
    indigo: {
      border: "border-indigo-500/40",
      bg: "bg-indigo-500/10",
      text: "text-indigo-300",
      ring: "ring-indigo-400/20",
      badge: "bg-indigo-500/20 text-indigo-300",
    },
    emerald: {
      border: "border-emerald-500/40",
      bg: "bg-emerald-500/10",
      text: "text-emerald-300",
      ring: "ring-emerald-400/20",
      badge: "bg-emerald-500/20 text-emerald-300",
    },
  };

  const chosen = VALIDITY_OPTIONS.find((v) => v.key === selected);
  const chosenPrice = getPrice(selected);
  const baseOptPrice = getPrice("1year");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#060d18] shadow-2xl shadow-black/70">
        <div className="relative overflow-hidden border-b border-white/[0.07] px-6 py-5">
          <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 mb-1">
                Choose Your Plan
              </p>
              <h3 className="text-xl font-black text-white leading-tight line-clamp-1">
                {course?.name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-2 text-slate-500 transition hover:text-red-400"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {VALIDITY_OPTIONS.map((opt) => {
            const active = selected === opt.key;
            const a = accentMap[opt.accent];
            const Icon = opt.icon;
            const price = getPrice(opt.key);
            const savings =
              !courseIsFree && opt.key !== "1year"
                ? Math.round(((price - baseOptPrice) / baseOptPrice) * 100)
                : null;

            return (
              <button
                key={opt.key}
                onClick={() => setSelected(opt.key)}
                className={`w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
                  active
                    ? `${a.border} ${a.bg} ring-1 ${a.ring}`
                    : "border-white/[0.07] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                }`}
              >
                <div
                  className={`rounded-xl border p-2.5 shrink-0 ${
                    active
                      ? `${a.border} ${a.bg} ${a.text}`
                      : "border-white/10 bg-white/[0.03] text-slate-500"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-bold ${active ? "text-white" : "text-slate-300"}`}
                    >
                      {opt.label}
                    </span>
                    {opt.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${a.badge}`}
                      >
                        {opt.badge}
                      </span>
                    )}
                    {savings !== null && (
                      <span className="rounded-full bg-amber-500/15 text-amber-400 px-2 py-0.5 text-[10px] font-bold">
                        +{savings}% value
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {opt.sublabel}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`text-lg font-black ${active ? a.text : "text-slate-400"}`}
                  >
                    {courseIsFree ? "Free" : fmtCurrency(price)}
                  </p>
                </div>
              </button>
            );
          })}

          <div className="mt-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 space-y-2">
            {[
              "Full course access",
              "Certificate of completion",
              "All future updates",
              selected === "lifetime"
                ? "Lifetime access — no expiry"
                : `Access for ${chosen?.label}`,
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-2.5 text-sm text-slate-400"
              >
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>

          <button
            onClick={() => onConfirm(selected)}
            disabled={isEnrolling}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/25 to-purple-500/25 py-4 text-sm font-bold text-white transition hover:from-indigo-500/35 hover:to-purple-500/35 hover:shadow-lg hover:shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEnrolling ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Processing…
              </>
            ) : (
              <>
                <Sparkles size={16} />
                {courseIsFree
                  ? "Enroll Free"
                  : `Enroll for ${fmtCurrency(chosenPrice)}`}
                <ChevronRight size={16} />
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-slate-600">
            <Shield size={10} className="inline mr-1" />
            Secure payment · 7-day refund guarantee
          </p>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   SKELETON LOADER
========================================================= */
const Skeleton = ({ className }) => (
  <div className={`animate-pulse rounded-xl bg-white/[0.04] ${className}`} />
);

const PageSkeleton = () => (
  <div className="min-h-screen bg-[#060d18]">
    <div className="h-16 border-b border-white/[0.07] bg-[#060d18]" />
    <div className="max-w-[1800px] mx-auto px-4 lg:px-8 py-6">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-4">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* =========================================================
   PROGRESS RING
========================================================= */
const ProgressRing = ({ pct, size = 48, stroke = 4 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        stroke="rgba(255,255,255,0.06)"
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        stroke="url(#prog)"
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <defs>
        <linearGradient id="prog" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/* =========================================================
   MAIN
========================================================= */
const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem(TOKEN_KEY);
  const isLoggedIn = !!token;

  /* ── state ── */
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [expandedLectures, setExpandedLectures] = useState(new Set());
  const [completedChapters, setCompletedChapters] = useState(new Set());
  const [hasStarted, setHasStarted] = useState(false);
  const [threadModal, setThreadModal] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [selectedContent, setSelectedContent] = useState({
    type: null,
    lectureId: null,
    chapterId: null,
  });

  const videoRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const iframeId = "yt-player-iframe";

  /* ── fetch course ── */
  useEffect(() => {
    let mounted = true;
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/course/${id}`);
        if (!res.ok) throw new Error("Failed to load course");
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Load failed");
        if (!mounted) return;
        const normalized = normalizeCourse(data.course);
        setCourse(normalized);
        if (normalized?.lectures?.length > 0) {
          const fl = normalized.lectures[0];
          const lid = fl._id || fl.id;
          setExpandedLectures(new Set([lid]));
          if (fl.chapters?.length > 0) {
            const fc = fl.chapters[0];
            setSelectedContent({
              type: "chapter",
              lectureId: lid,
              chapterId: fc._id || fc.id,
            });
          }
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
    return () => {
      mounted = false;
    };
  }, [id]);

  /* ── check enrollment ── */
  useEffect(() => {
    if (!token || !course?._id) {
      setIsEnrolled(false);
      return;
    }
    const check = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/booking/check?courseId=${course._id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        const b = data?.booking;
        const paid =
          b?.paymentStatus?.toLowerCase() === "paid" ||
          b?.orderStatus?.toLowerCase() === "confirmed" ||
          !!b?.paidAt;
        const free =
          course?.isFree || course?.pricingType === "free" || !course?.price;
        setIsEnrolled(free ? !!b : paid);
      } catch {
        setIsEnrolled(false);
      }
    };
    check();
  }, [course, token]);

  /* ── fetch progress ── */
  useEffect(() => {
    if (!token || !course?._id || !isEnrolled) return;
    const fetchProgress = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/progress/completed?courseId=${course._id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        setCompletedChapters(new Set(data.completedChapters || []));
      } catch {
        /* silent */
      }
    };
    fetchProgress();
  }, [course, token, isEnrolled]);

  /* ── memos ── */
  const selectedLecture = useMemo(
    () =>
      course?.lectures?.find(
        (l) => String(l._id || l.id) === String(selectedContent.lectureId),
      ),
    [course, selectedContent],
  );

  const selectedChapter = useMemo(
    () =>
      selectedLecture?.chapters?.find(
        (c) => String(c._id || c.id) === String(selectedContent.chapterId),
      ),
    [selectedLecture, selectedContent],
  );

  const currentContent = useMemo(
    () =>
      selectedContent.type === "chapter" && selectedChapter
        ? selectedChapter
        : selectedContent.type === "lecture" && selectedLecture
          ? selectedLecture
          : null,
    [selectedContent, selectedChapter, selectedLecture],
  );

  const totalChapters = useMemo(
    () => course?.lectures?.flatMap((l) => l.chapters || []).length || 0,
    [course],
  );

  const progressPct = useMemo(() => {
    if (!isEnrolled || !totalChapters) return 0;
    return Math.round((completedChapters.size / totalChapters) * 100);
  }, [completedChapters, totalChapters, isEnrolled]);

  const totalMinutes = useMemo(
    () =>
      (course?.lectures || []).reduce((a, l) => a + toNum(l.durationMin), 0),
    [course],
  );

  /* ── chapter change: reset hasStarted ── */
  useEffect(() => {
    setHasStarted(false);
  }, [selectedContent.chapterId, selectedContent.lectureId]);

  /* ── YouTube IFrame API player (depends on currentContent, defined above) ── */
  useEffect(() => {
    if (!hasStarted || !currentContent?.videoUrl) return;

    const initPlayer = () => {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
      }
      ytPlayerRef.current = new window.YT.Player(iframeId, {
        events: {
          onStateChange: (e) => {
            const video = videoRef.current;
            if (!video) return;
            if (e.data === 1) video.dispatchEvent(new Event("play"));
            else if (e.data === 2) video.dispatchEvent(new Event("pause"));
            else if (e.data === 0) video.dispatchEvent(new Event("ended"));
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prevCallback?.();
        initPlayer();
      };

      if (!document.getElementById("yt-api-script")) {
        const tag = document.createElement("script");
        tag.id = "yt-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }

    return () => {
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
    };
  }, [hasStarted, currentContent?.videoUrl]);

  /* ── watch tracker (safe: currentContent is defined above) ── */
  useWatchTracker(videoRef, {
    courseId: course?._id || null,
    lessonId: selectedContent.chapterId || selectedContent.lectureId || null,
    token,
  });

  /* ── actions ── */
  const toggleLecture = useCallback((lid) => {
    setExpandedLectures((prev) => {
      const next = new Set(prev);
      next.has(lid) ? next.delete(lid) : next.add(lid);
      return next;
    });
  }, []);

  const handleSelectContent = useCallback(
    (lectureId, chapterId = null) => {
      if (!isLoggedIn) {
        toast.error("Please login first");
        return;
      }
      if (!isEnrolled) {
        toast.error("Enroll to access content");
        setShowEnrollModal(true);
        return;
      }
      setHasStarted(false);
      setSelectedContent({
        type: chapterId ? "chapter" : "lecture",
        lectureId,
        chapterId,
      });
    },
    [isLoggedIn, isEnrolled],
  );

  const toggleChapterCompletion = useCallback(
    async (chapterId) => {
      if (!isLoggedIn || !isEnrolled) {
        toast.error("Please enroll first");
        return;
      }
      const completed = completedChapters.has(String(chapterId));

      let durationMins = 10;
      for (const lec of course.lectures || []) {
        const ch = lec.chapters?.find(
          (c) => String(c._id || c.id) === String(chapterId),
        );
        if (ch) {
          durationMins = toNum(ch.durationMin) || 10;
          break;
        }
      }

      setCompletedChapters((prev) => {
        const next = new Set(prev);
        completed ? next.delete(chapterId) : next.add(chapterId);
        return next;
      });

      try {
        const res = await fetch(`${API_BASE}/api/progress/mark`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            courseId: course._id,
            chapterId,
            completed: !completed,
            durationMins,
          }),
        });
        if (!res.ok) throw new Error();
        if (!completed) toast.success("Chapter marked complete ✓");
      } catch {
        setCompletedChapters((prev) => {
          const next = new Set(prev);
          completed ? next.add(chapterId) : next.delete(chapterId);
          return next;
        });
        toast.error("Progress update failed");
      }
    },
    [completedChapters, course, isEnrolled, isLoggedIn, token],
  );

  const handleEnroll = useCallback(
    async (validity = "lifetime") => {
      if (!isLoggedIn) {
        toast.error("Please login first");
        return;
      }
      try {
        setIsEnrolling(true);
        const basePrice = toNum(
          course?.price?.sale || course?.price?.original || 0,
        );
        const courseIsFree =
          course?.isFree ||
          course?.pricingType === "free" ||
          !course?.price?.sale;
        const price = courseIsFree
          ? 0
          : Math.round(basePrice * VALIDITY_MULTIPLIER[validity]);

        const res = await fetch(`${API_BASE}/api/booking/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            courseId: course._id,
            courseName: course.name,
            teacherName: course.teacher,
            price,
            validity,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.message || "Enrollment failed");
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
        setIsEnrolled(true);
        setShowEnrollModal(false);
        toast.success("Welcome to the course! 🎉");
      } catch (err) {
        toast.error(err.message || "Enrollment failed");
      } finally {
        setIsEnrolling(false);
      }
    },
    [course, isLoggedIn, token],
  );

  /* ── render guards ── */
  if (loading) return <PageSkeleton />;
  if (error)
    return (
      <div className="min-h-screen bg-[#060d18] flex flex-col items-center justify-center gap-4 text-white">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center max-w-sm">
          <X size={32} className="text-red-400 mx-auto mb-3" />
          <p className="font-bold text-lg">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-sm text-slate-400 hover:text-white flex items-center gap-1.5 mx-auto"
          >
            <ArrowLeft size={14} /> Go back
          </button>
        </div>
      </div>
    );
  if (!course) return null;

  const courseIsFree =
    course?.isFree || course?.pricingType === "free" || !course?.price?.sale;
  const salePrice = course?.price?.sale;
  const originalPrice = course?.price?.original;
  const hasDiscount = originalPrice && salePrice && originalPrice > salePrice;

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#060d18] text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            fontSize: "14px",
          },
          success: { style: { borderColor: "#6366f1" } },
          error: { style: { borderColor: "#ef4444" } },
        }}
      />

      {/* ── TOP NAV ── */}
      <div className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#060d18]/95 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-sm text-slate-300 transition hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft size={15} /> Back
          </button>

          {isEnrolled && (
            <div className="flex items-center gap-5 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/80 flex items-center justify-center shrink-0">
                  <GraduationCap size={18} />
                </div>
                <div className="min-w-0 hidden sm:block">
                  <p className="text-sm font-bold text-white truncate max-w-[200px] lg:max-w-[400px]">
                    {course.name}
                  </p>
                  <p className="text-[11px] text-slate-500">{course.teacher}</p>
                </div>
              </div>
              {isEnrolled && (
                <div className="flex items-center gap-3 shrink-0">
                  <div className="relative">
                    <ProgressRing pct={progressPct} size={40} stroke={3} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-indigo-300">
                      {progressPct}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="max-w-[1800px] mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 items-start">
          {/* ════════════════ LEFT ════════════════ */}
          <div className="space-y-5 min-w-0">
            {/* VIDEO PLAYER */}
            <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0b1220] shadow-2xl shadow-black/40">
              <div className="aspect-video bg-black relative">
                {currentContent?.videoUrl && isEnrolled ? (
                  <>
                    <video
                      ref={videoRef}
                      style={{ display: "none" }}
                      aria-hidden="true"
                    />

                    <iframe
                      key={`${currentContent.videoUrl}-${hasStarted}`}
                      id="yt-player-iframe"
                      title={currentContent?.name || "Video"}
                      src={appendAutoplay(
                        toEmbedUrl(currentContent.videoUrl),
                        hasStarted,
                      )}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      loading="lazy"
                    />

                    {!hasStarted && (
                      <div
                        onClick={() => {
                          setHasStarted(true);
                          videoRef.current?.dispatchEvent(new Event("play"));
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 cursor-pointer z-10 backdrop-blur-[2px] group"
                      >
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center shadow-2xl transition-transform duration-200 group-hover:scale-110 group-hover:border-indigo-400/60 group-hover:bg-indigo-500/20">
                            <Play size={36} className="text-white ml-1" />
                          </div>
                          <p className="text-white/70 text-sm font-medium tracking-wide">
                            Click to Play
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#0b1220] to-[#060d18]">
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5 text-slate-600">
                      {isEnrolled ? (
                        <PlayCircle size={40} strokeWidth={1.2} />
                      ) : (
                        <Lock size={40} strokeWidth={1.2} />
                      )}
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white">
                        {isEnrolled
                          ? "Select a chapter"
                          : "Enroll to Access Content"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {isEnrolled
                          ? "Choose from the sidebar →"
                          : "Get full access to all videos"}
                      </p>
                    </div>
                    {!isEnrolled && (
                      <button
                        onClick={() =>
                          isLoggedIn
                            ? setShowEnrollModal(true)
                            : toast.error("Please login first")
                        }
                        className="flex items-center gap-2 rounded-2xl border border-indigo-500/30 bg-indigo-500/15 px-6 py-2.5 text-sm font-bold text-indigo-300 transition hover:bg-indigo-500/25"
                      >
                        <Sparkles size={14} /> Enroll Now
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* BELOW VIDEO INFO */}
              <div className="p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${courseIsFree ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"}`}
                  >
                    {courseIsFree ? "Free Course" : "Premium"}
                  </span>
                  {isEnrolled && (
                    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Enrolled
                    </span>
                  )}
                  {isEnrolled && selectedContent.chapterId && (
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold flex items-center gap-1 ${completedChapters.has(selectedContent.chapterId) ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-white/[0.07] bg-white/[0.03] text-slate-400"}`}
                    >
                      {completedChapters.has(selectedContent.chapterId) ? (
                        <>
                          <CheckCircle2 size={11} /> Completed
                        </>
                      ) : (
                        <>
                          <Circle size={11} /> In Progress
                        </>
                      )}
                    </span>
                  )}
                  {course.rating > 0 && (
                    <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-300 flex items-center gap-1">
                      <Star size={11} className="fill-yellow-400" />{" "}
                      {Number(course.rating).toFixed(1)}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">
                  {currentContent?.name || currentContent?.title || course.name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-500 mb-5">
                  <span className="flex items-center gap-1.5">
                    <User2 size={14} className="text-slate-600" />
                    {course.teacher}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock3 size={14} className="text-slate-600" />
                    {fmtMinutes(currentContent?.durationMin || totalMinutes)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={14} className="text-slate-600" />
                    {course.lectures?.length} Lectures
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers3 size={14} className="text-slate-600" />
                    {totalChapters} Chapters
                  </span>
                  {course.category && (
                    <span className="flex items-center gap-1.5">
                      <Award size={14} className="text-slate-600" />
                      {course.category}
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <p
                    className={`text-slate-400 text-sm leading-relaxed transition-all duration-300 ${showMore ? "" : "line-clamp-3"}`}
                  >
                    {course.overview}
                  </p>
                  {(course.overview?.length || 0) > 200 && (
                    <button
                      onClick={() => setShowMore(!showMore)}
                      className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                    >
                      {showMore ? (
                        <>
                          <ChevronUp size={12} /> Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown size={12} /> Show more
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* ACTIONS ROW */}
                <div className="flex flex-wrap items-center gap-4">
                  {isEnrolled && selectedContent.chapterId && (
                    <button
                      onClick={() =>
                        toggleChapterCompletion(selectedContent.chapterId)
                      }
                      className={`flex items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-bold transition-all duration-200 ${
                        completedChapters.has(selectedContent.chapterId)
                          ? "bg-emerald-500 text-white hover:bg-emerald-400"
                          : "border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                      }`}
                    >
                      {completedChapters.has(selectedContent.chapterId) ? (
                        <>
                          <CheckCircle2 size={16} /> Completed
                        </>
                      ) : (
                        <>
                          <Circle size={16} /> Mark Complete
                        </>
                      )}
                    </button>
                  )}

                  <div className="flex-1 min-w-[220px] max-w-sm mx-auto flex flex-col items-center">
                    {!isEnrolled && (
                      <>
                        <button
                          onClick={() =>
                            isLoggedIn
                              ? setShowEnrollModal(true)
                              : toast.error("Please login first")
                          }
                          className="group relative overflow-hidden flex w-full items-center justify-center gap-2.5 rounded-lg border border-indigo-500/30 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 py-3.5 px-6 text-sm font-bold text-white transition hover:from-indigo-600/40 hover:to-purple-600/40 hover:shadow-lg hover:shadow-indigo-500/15"
                        >
                          <div className="absolute inset-0 -skew-x-12 -translate-x-full bg-gradient-to-r from-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                          <Sparkles size={15} />
                          {courseIsFree
                            ? "Enroll Free"
                            : salePrice
                              ? `Enroll · ${fmtCurrency(salePrice)}`
                              : `Enroll · ${fmtCurrency(originalPrice)}`}
                          <ChevronRight size={15} />
                        </button>

                        {!courseIsFree && (
                          <div className="mt-2 flex items-center justify-center gap-2.5">
                            <span className="text-2xl font-black text-white">
                              {fmtCurrency(salePrice || originalPrice)}
                            </span>
                            {hasDiscount && (
                              <>
                                <span className="text-sm text-slate-600 line-through">
                                  {fmtCurrency(originalPrice)}
                                </span>
                                <span className="rounded-full bg-amber-500/15 text-amber-400 px-2 py-0.5 text-[11px] font-bold">
                                  {Math.round(
                                    ((originalPrice - salePrice) /
                                      originalPrice) *
                                      100,
                                  )}
                                  % OFF
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* TABS — mobile */}
            <div className="xl:hidden">
              <div className="flex border-b border-white/[0.07] gap-1 mb-4">
                {[
                  { id: "content", label: "Content", icon: BookOpen },
                  { id: "resources", label: "Resources", icon: FileText },
                  {
                    id: "discussion",
                    label: "Discussion",
                    icon: MessageSquare,
                  },
                ].map((t) => {
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${active ? "border-indigo-400 text-indigo-300 bg-indigo-500/5" : "border-transparent text-slate-500 hover:text-slate-300"}`}
                    >
                      <t.icon size={13} /> {t.label}
                    </button>
                  );
                })}
              </div>
              {activeTab === "resources" && (
                <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.02] p-4">
                  {isEnrolled ? (
                    <ResourceList courseId={course._id} />
                  ) : (
                    <LockedSection
                      label="Resources"
                      onEnroll={() => setShowEnrollModal(true)}
                    />
                  )}
                </div>
              )}
              {activeTab === "discussion" && (
                <div>
                  {isEnrolled ? (
                    <CommentBox
                      courseId={course._id}
                      course={course}
                      onOpenPrivateChat={(user, comment) => {
                        setThreadModal({
                          rootComment: comment,
                          otherUser: user,
                          courseName: course.name,
                        });
                      }}
                    />
                  ) : (
                    <LockedSection
                      label="Discussion"
                      onEnroll={() => setShowEnrollModal(true)}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Discussion — desktop */}
            <div className="hidden xl:block">
              {isEnrolled ? (
                <CommentBox
                  courseId={course._id}
                  course={course}
                  onOpenPrivateChat={(user, comment) => {
                    setThreadModal({
                      rootComment: comment,
                      otherUser: user,
                      courseName: course.name,
                    });
                  }}
                />
              ) : (
                <LockedSection
                  label="Discussion"
                  onEnroll={() => setShowEnrollModal(true)}
                />
              )}
            </div>
          </div>

          {/* ════════════════ RIGHT SIDEBAR ════════════════ */}
          <div className="space-y-4 xl:sticky xl:top-[88px]">
            <div className="rounded-[10px] overflow-hidden border border-white/[0.08] bg-[#0b1220]">
              {isEnrolled && (
                <div className="mt-0 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                      <BarChart3 size={14} className="text-indigo-400" /> Your
                      Progress
                    </span>
                    <span className="text-sm font-black text-indigo-300">
                      {progressPct}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    {completedChapters.size} of {totalChapters} chapters
                    completed
                  </p>
                </div>
              )}

              <div className="border-b border-white/[0.07] p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-black text-white">
                      Course Content
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {course.lectures.length} lectures · {totalChapters}{" "}
                      chapters · {fmtMinutes(totalMinutes)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-[520px] overflow-y-auto overscroll-contain">
                {course.lectures.map((lecture, li) => {
                  const lid = lecture._id || lecture.id;
                  const expanded = expandedLectures.has(lid);
                  const lecDone = (lecture.chapters || []).filter((c) =>
                    completedChapters.has(String(c._id || c.id)),
                  ).length;

                  return (
                    <div
                      key={lid}
                      className="border-b border-white/[0.05] last:border-0"
                    >
                      <button
                        onClick={() => toggleLecture(lid)}
                        className="w-full flex items-center gap-3 p-4 text-left transition hover:bg-white/[0.03]"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-xs font-bold text-slate-400">
                          {li + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xl font-semibold text-white truncate">
                            {lecture.title}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {lecture.chapters?.length || 0} chapters ·{" "}
                            {fmtMinutes(lecture.durationMin)}
                            {isEnrolled &&
                              lecDone > 0 &&
                              ` · ${lecDone}/${lecture.chapters?.length} done`}
                          </p>
                        </div>
                        <ChevronDown
                          size={15}
                          className={`text-slate-600 transition-transform duration-200 shrink-0 ${expanded ? "rotate-180" : ""}`}
                        />
                      </button>

                      {expanded && (
                        <div className="pb-2 bg-black/20">
                          {(lecture.chapters || []).map((chapter, ci) => {
                            const cid = String(chapter._id || chapter.id);
                            const isSelected =
                              String(selectedContent.chapterId) === cid;
                            const isDone = completedChapters.has(cid);

                            return (
                              <button
                                key={cid}
                                onClick={() => handleSelectContent(lid, cid)}
                                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition ${isSelected ? "bg-indigo-500/10 border-l-2 border-indigo-400" : "hover:bg-white/[0.03] border-l-2 border-transparent"}`}
                              >
                                <span
                                  className="mt-0.5 shrink-0 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isEnrolled)
                                      toggleChapterCompletion(cid);
                                  }}
                                >
                                  {isDone ? (
                                    <CheckCircle2
                                      size={18}
                                      className="text-emerald-400"
                                    />
                                  ) : (
                                    <Circle
                                      size={18}
                                      className="text-slate-600"
                                    />
                                  )}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div
                                    className={`flex-1 min-w-0 transition-opacity ${isDone ? "opacity-60" : ""}`}
                                  >
                                    <p
                                      className={`text-sm truncate ${isSelected ? "text-indigo-200 font-semibold" : "text-slate-300"} ${isDone ? "line-through" : ""}`}
                                    >
                                      {ci + 1}. {chapter.name}
                                    </p>
                                    <p className="text-[11px] text-slate-700 mt-0.5">
                                      {fmtMinutes(chapter.durationMin)}
                                    </p>
                                  </div>
                                </div>
                                {!isEnrolled && (
                                  <Lock
                                    size={12}
                                    className="text-slate-700 mt-1 shrink-0"
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RESOURCES */}
            <div className="rounded-[10px] overflow-hidden border border-white/[0.08] bg-[#0b1220]">
              <button
                onClick={() => setShowResources(!showResources)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-indigo-500/20 bg-indigo-500/10 flex items-center justify-center text-indigo-300 group-hover:scale-105 transition">
                    <FileText size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white group-hover:text-indigo-200 transition">
                      Learning Resources
                    </p>
                    <p className="text-[11px] text-slate-500">
                      PDFs, notes & links
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isEnrolled && <Lock size={13} className="text-slate-600" />}
                  <ChevronDown
                    size={16}
                    className={`text-slate-500 transition-transform duration-200 ${showResources ? "rotate-180" : ""}`}
                  />
                </div>
              </button>
              {showResources && (
                <div className="border-t border-white/[0.06] p-4">
                  {isEnrolled ? (
                    <div className="max-h-80 overflow-y-auto">
                      <ResourceList courseId={course._id} />
                    </div>
                  ) : (
                    <LockedSection
                      label="Resources"
                      compact
                      onEnroll={() => setShowEnrollModal(true)}
                    />
                  )}
                </div>
              )}
            </div>

            {/* COURSE STATS */}
            <div className="rounded-[10px] border border-white/[0.08] bg-[#0b1220] p-5">
              <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">
                Course Includes
              </h3>
              <div className="space-y-3">
                {[
                  {
                    icon: Video,
                    label: `${totalChapters} on-demand videos`,
                    color: "text-indigo-400",
                  },
                  {
                    icon: FileText,
                    label: "Downloadable resources",
                    color: "text-cyan-400",
                  },
                  {
                    icon: Award,
                    label: "Certificate of completion",
                    color: "text-yellow-400",
                  },
                  {
                    icon: Infinity,
                    label: "Full lifetime access",
                    color: "text-emerald-400",
                  },
                  {
                    icon: TrendingUp,
                    label: "Access on all devices",
                    color: "text-purple-400",
                  },
                ].map(({ icon: Icon, label, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 text-sm text-slate-400"
                  >
                    <Icon size={15} className={`${color} shrink-0`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ENROLL MODAL */}
      {showEnrollModal && (
        <EnrollModal
          course={course}
          onClose={() => setShowEnrollModal(false)}
          onConfirm={handleEnroll}
          isEnrolling={isEnrolling}
        />
      )}

      {/* THREAD MODAL */}
      {threadModal && (
        <ThreadChatModal
          rootComment={threadModal.rootComment}
          otherUser={threadModal.otherUser}
          courseName={threadModal.courseName}
          onClose={() => setThreadModal(null)}
        />
      )}
    </div>
  );
};

/* =========================================================
   LOCKED SECTION
========================================================= */
const LockedSection = ({ label, onEnroll, compact = false }) => (
  <div
    className={`flex flex-col items-center justify-center text-center ${compact ? "py-6" : "py-12 rounded-2xl border border-white/[0.07] bg-white/[0.02]"}`}
  >
    <div className="w-14 h-14 rounded-2xl border border-red-500/20 bg-red-500/10 flex items-center justify-center mb-4">
      <Lock size={22} className="text-red-400" />
    </div>
    <h3 className="font-bold text-white text-base">{label} Locked</h3>
    <p className="text-slate-500 text-sm mt-1.5 max-w-[260px] leading-relaxed">
      Enroll in this course to access {label.toLowerCase()}.
    </p>
    <button
      onClick={onEnroll}
      className="mt-4 flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-5 py-2.5 text-sm font-bold text-indigo-300 transition hover:bg-indigo-500/20"
    >
      <Sparkles size={13} /> Enroll Now
    </button>
  </div>
);

export default CourseDetail;
