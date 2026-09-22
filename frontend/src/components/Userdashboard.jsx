import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { TOKEN_KEY } from "@/constants/auth";
import {
  BookOpen,
  Award,
  Flame,
  TrendingUp,
  Clock,
  Star,
  Play,
  ChevronRight,
  CheckCircle2,
  Zap,
  Activity,
  User,
  Search,
  BarChart2,
  Grid,
  List,
  ArrowUp,
  MessageSquare,
  AlertCircle,
  Layers,
  Hash,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

/* ─── helpers ─── */
const normalizeCourse = (course) => ({
  ...course,
  lectures: (course.lectures || []).map((l) => ({
    ...l,
    chapters: l.chapters || [],
  })),
});

const getPct = (course, completedMap) => {
  const totalCh = (course.lectures || []).flatMap(
    (l) => l.chapters || [],
  ).length;
  if (!totalCh) return 0;
  const done = completedMap[course.id]?.length || 0;
  return Math.round((done / totalCh) * 100);
};

/* ─── Gradient Text helper ─── */
const G = ({ children }) => (
  <span
    style={{
      background: "linear-gradient(90deg,#22d3ee,#3b82f6)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    {children}
  </span>
);
const ProgressRing = ({
  pct,
  size = 64,
  stroke = 6,
  color = "#6366f1",
  trackColor = "rgba(255,255,255,0.06)",
}) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={trackColor}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={pct === 100 ? "#10b981" : color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
};

/* ─── Mini Sparkline ─── */
const Sparkline = ({ data = [], color = "#6366f1" }) => {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 80,
    h = 32;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

/* ─── Bar Chart ─── */
const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.mins), 1);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "8px",
        height: "140px",
        marginTop: "20px",
      }}
    >
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            gap: "6px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.35)",
              fontWeight: 600,
            }}
          >
            {d.mins}m
          </span>
          <div
            style={{
              width: "100%",
              height: "90px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "26px",
                borderRadius: "6px 6px 0 0",
                height: `${(d.mins / max) * 90}px`,
                background:
                  d.mins === max
                    ? "linear-gradient(180deg,#818cf8,#6366f1)"
                    : "rgba(99,102,241,0.3)",
                transition: "height 0.8s cubic-bezier(.4,0,.2,1)",
                minHeight: "4px",
              }}
            />
          </div>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ─── Heatmap ─── */
const ActivityHeatmap = ({ grid }) => {
  const getColor = (n) => {
    if (!n) return "rgba(255,255,255,0.05)";
    if (n === 1) return "rgba(34,211,238,0.2)";
    if (n === 2) return "rgba(34,211,238,0.45)";
    if (n === 3) return "rgba(34,211,238,0.7)";
    return "#22d3ee";
  };
  const weeks = [];
  for (let i = 0; i < grid.length; i += 7) weeks.push(grid.slice(i, i + 7));
  const days = ["M", "", "W", "", "F", "", "S"];
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        marginTop: "16px",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          flexShrink: 0,
        }}
      >
        {days.map((d, i) => (
          <span
            key={i}
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.3)",
              height: "16px",
              lineHeight: "16px",
              width: "10px",
              textAlign: "right",
            }}
          >
            {d}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: "4px", flex: 1 }}>
        {weeks.map((week, wi) => (
          <div
            key={wi}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              flex: 1,
            }}
          >
            {week.map((cell, di) => (
              <div
                key={di}
                title={`${cell?.count || 0} sessions`}
                style={{
                  width: "100%",
                  height: "16px",
                  borderRadius: "3px",
                  background: getColor(cell?.count || 0),
                  transition: "background 0.2s",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Stat Card ─── */
const StatCard = ({ label, value, icon: Icon, color, trend, delay = 0 }) => (
  <div
    style={{
      position: "relative",
      borderRadius: "16px",
      border: `1px solid ${color}22`,
      background: `linear-gradient(145deg, ${color}0d 0%, #080c1a 100%)`,
      padding: "24px 20px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      animation: `fadeUp 0.5s ease both`,
      animationDelay: `${delay}ms`,
      transition: "transform 0.2s ease, border-color 0.2s ease",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.borderColor = `${color}55`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.borderColor = `${color}22`;
    }}
  >
    {/* top glow line */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: "20%",
        right: "20%",
        height: "2px",
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        borderRadius: "0 0 4px 4px",
      }}
    />
    {/* bg circle glow */}
    <div
      style={{
        position: "absolute",
        bottom: "-40px",
        right: "-40px",
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        background: color,
        opacity: 0.04,
        pointerEvents: "none",
      }}
    />

    {/* icon circle */}
    <div
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "14px",
        background: `${color}18`,
        border: `1px solid ${color}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        marginBottom: "14px",
        boxShadow: `0 4px 16px ${color}18`,
      }}
    >
      <Icon size={20} />
    </div>

    {/* value */}
    <div
      style={{
        fontSize: "32px",
        fontWeight: 800,
        color: "#fff",
        fontFamily: "'DM Mono',monospace",
        letterSpacing: "-0.04em",
        lineHeight: 1,
      }}
    >
      {value}
    </div>

    {/* label */}
    <div
      style={{
        fontSize: "11px",
        color: "rgba(255,255,255,0.38)",
        marginTop: "6px",
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>

    {/* trend */}
    {trend !== undefined && trend !== 0 && (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "3px",
          marginTop: "10px",
          fontSize: "11px",
          color: trend >= 0 ? "#10b981" : "#f87171",
          fontWeight: 700,
          background:
            trend >= 0 ? "rgba(16,185,129,0.1)" : "rgba(248,113,113,0.1)",
          padding: "3px 8px",
          borderRadius: "20px",
        }}
      >
        <ArrowUp
          size={9}
          style={{ transform: trend < 0 ? "rotate(180deg)" : "none" }}
        />
        {Math.abs(trend)}%
      </div>
    )}
  </div>
);

/* ─── Course Card ─── */
const CourseCard = ({ course, pct, onClick, view = "grid", delay = 0 }) => {
  const doneCh = Math.round(
    (pct / 100) *
      (course.lectures || []).flatMap((l) => l.chapters || []).length,
  );
  const totalCh = (course.lectures || []).flatMap(
    (l) => l.chapters || [],
  ).length;
  const isComplete = pct === 100;

  if (view === "list") {
    return (
      <div
        onClick={onClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "14px 16px",
          borderRadius: "12px",
          border: "1px solid rgba(99,102,241,0.35)",
          boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
          background: "#0a0f1e",
          cursor: "pointer",
          transition: "all 0.2s ease",
          animation: `fadeUp 0.4s ease both`,
          animationDelay: `${delay}ms`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(99,102,241,0.8)";
          e.currentTarget.style.background = "#0d1225";
          e.currentTarget.style.boxShadow =
            "0 0 0 1px rgba(99,102,241,0.3), 0 4px 24px rgba(99,102,241,0.25), 0 0 40px rgba(99,102,241,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(99,102,241,0.35)";
          e.currentTarget.style.background = "#0a0f1e";
          e.currentTarget.style.boxShadow = "0 2px 12px rgba(99,102,241,0.08)";
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "10px",
            overflow: "hidden",
            flexShrink: 0,
            background: "#1a1f35",
          }}
        >
          {course.image ? (
            <img
              src={course.image}
              alt={course.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookOpen size={20} color="rgba(255,255,255,0.2)" />
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#fff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {course.name}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.35)",
              marginTop: "2px",
            }}
          >
            {course.teacher}
          </div>
        </div>
        <div style={{ width: "160px", flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
              {doneCh}/{totalCh} chapters
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: isComplete ? "#10b981" : "#6366f1",
              }}
            >
              {pct}%
            </span>
          </div>
          <div
            style={{
              height: "4px",
              borderRadius: "2px",
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: "2px",
                background: isComplete
                  ? "#10b981"
                  : "linear-gradient(90deg,#6366f1,#818cf8)",
                transition: "width 0.8s ease",
              }}
            />
          </div>
        </div>
        <ChevronRight
          size={16}
          color="rgba(255,255,255,0.3)"
          style={{ flexShrink: 0 }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.07)",
        background: "#0a0f1e",
        cursor: "pointer",
        overflow: "hidden",
        transition: "all 0.25s ease",
        animation: `fadeUp 0.4s ease both`,
        animationDelay: `${delay}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          position: "relative",
          height: "160px",
          background: "#1a1f35",
          overflow: "hidden",
        }}
      >
        {course.image ? (
          <img
            src={course.image}
            alt={course.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BookOpen size={32} color="rgba(255,255,255,0.1)" />
          </div>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top,rgba(0,0,0,0.8) 0%,transparent 60%)",
          }}
        />
        {isComplete && (
          <span
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "rgba(16,185,129,0.9)",
              padding: "3px 8px",
              borderRadius: "6px",
              fontSize: "10px",
              fontWeight: 700,
              color: "#fff",
              backdropFilter: "blur(8px)",
            }}
          >
            ✓ DONE
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          style={{
            position: "absolute",
            bottom: "12px",
            right: "12px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(99,102,241,0.9)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Play size={14} fill="white" color="white" />
        </button>
      </div>
      <div style={{ padding: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#818cf8",
              background: "rgba(99,102,241,0.12)",
              padding: "3px 8px",
              borderRadius: "5px",
              textTransform: "uppercase",
            }}
          >
            {course.category || "Course"}
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "12px",
              color: "#fbbf24",
            }}
          >
            <Star size={11} fill="currentColor" />
            {Number(course.avgRating || 0).toFixed(1)}
          </span>
        </div>
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#fff",
            margin: "0 0 4px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.4,
            minHeight: "39px", // ← ADD THIS
          }}
        >
          {course.name}
        </h3>
        <p
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.35)",
            margin: "0 0 14px",
            minHeight: "18px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <User size={10} />
          {course.teacher}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
            {doneCh} of {totalCh} chapters
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: isComplete ? "#10b981" : "#818cf8",
            }}
          >
            {pct}%
          </span>
        </div>
        <div
          style={{
            height: "5px",
            borderRadius: "3px",
            background: "rgba(255,255,255,0.07)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: "3px",
              background: isComplete
                ? "linear-gradient(90deg,#10b981,#34d399)"
                : "linear-gradient(90deg,#6366f1,#a5b4fc)",
              transition: "width 1s cubic-bezier(.4,0,.2,1)",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
          <span
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            <Layers size={10} />
            {course.lectures?.length || 0} lessons
          </span>
          <span
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            <Hash size={10} />
            {totalCh} chapters
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN DASHBOARD ─── */
const UserDashboard = ({ user: userProp }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem(TOKEN_KEY);
  const isSignedIn = !!token;

  // Always read latest user from localStorage (same as ProfilePage)
  // Falls back to prop if localStorage is empty
  const [localUser, setLocalUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || userProp;
    } catch {
      return userProp;
    }
  });

  // Re-read when profile is updated (ProfilePage dispatches "userUpdated")
  useEffect(() => {
    const sync = () => {
      try {
        setLocalUser(JSON.parse(localStorage.getItem("user")) || userProp);
      } catch {
        setLocalUser(userProp);
      }
    };
    window.addEventListener("userUpdated", sync);
    return () => window.removeEventListener("userUpdated", sync);
  }, [userProp]);

  const user = localUser || userProp;

  const [activeTab, setActiveTab] = useState("overview");
  const [courses, setCourses] = useState([]);
  const [completedMap, setCompletedMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseView, setCourseView] = useState("grid");
  const [courseFilter, setCourseFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [streakDays, setStreakDays] = useState(0);
  const [weeklyStudy, setWeeklyStudy] = useState([]);
  const [activityData, setActivityData] = useState([]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  /* ── Fetch all data ── */
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchAll = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!isSignedIn) {
          setCourses([]);
          setIsLoading(false);
          return;
        }

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };
        const opts = {
          headers,
          credentials: "include",
          signal: controller.signal,
        };

        // ── 1. Bookings ──
        const bookingsRes = await fetch(`${API_BASE}/api/booking/my`, {
          method: "GET",
          ...opts,
        });
        if (bookingsRes.status === 401) throw new Error("Please login again.");
        if (!bookingsRes.ok) throw new Error("Failed to fetch courses.");
        const bookingsJson = await bookingsRes.json();

        const bookings = (bookingsJson.bookings || []).filter((b) => {
          if (!b.course && !b.courseId) return false;
          const status = b.status?.toLowerCase();
          if (b.isFree === true || b.price === 0 || b.amount === 0) return true;
          return ["paid", "success", "completed"].includes(status);
        });

        // ── 2. Courses + Progress ──
        const merged = await Promise.all(
          bookings.map(async (booking) => {
            try {
              const courseId = booking.course || booking.courseId;
              if (!courseId) return null;
              const courseRes = await fetch(
                `${API_BASE}/api/course/${courseId}`,
                { method: "GET", ...opts },
              );
              if (!courseRes.ok) return null;
              const courseJson = await courseRes.json();
              const course = normalizeCourse(courseJson?.course);
              if (!course) return null;

              let completedChapters = [];
              try {
                const progressRes = await fetch(
                  `${API_BASE}/api/progress/completed?courseId=${courseId}`,
                  { method: "GET", ...opts },
                );
                if (progressRes.ok) {
                  const pj = await progressRes.json();
                  completedChapters = pj.completedChapters || [];
                }
              } catch (_) {}

              return {
                id: course._id || course.id || courseId,
                name: course.name || "Untitled Course",
                teacher: course.teacher || "Unknown Instructor",
                image: course.image,
                avgRating: course.avgRating ?? course.rating ?? 0,
                totalRatings: course.totalRatings ?? 0,
                lectures: course.lectures || [],
                category: course.category || "Development",
                totalCh: (course.lectures || []).flatMap(
                  (l) => l.chapters || [],
                ).length,
                completedChapters,
              };
            } catch {
              return null;
            }
          }),
        );

        if (!mounted) return;

        const finalCourses = merged.filter(
          (c) =>
            c &&
            bookings.some(
              (b) => String(b.course || b.courseId) === String(c.id),
            ),
        );
        const progressMap = {};
        finalCourses.forEach((c) => {
          progressMap[c.id] = c.completedChapters || [];
        });
        setCompletedMap(progressMap);
        setCourses(finalCourses);

        // ── 3. Streak ──
        try {
          const res = await fetch(`${API_BASE}/api/progress/streak`, {
            method: "GET",
            ...opts,
          });
          if (res.ok) {
            const sj = await res.json();
            if (mounted)
              setStreakDays(
                sj.currentStreak ?? sj.streak ?? sj.streakDays ?? 0,
              );
          }
        } catch (_) {}

        // ── 4. Weekly Study ──
        // Backend returns: { success: true, data: [{label, date, mins}, ...] }
        try {
          const res = await fetch(`${API_BASE}/api/progress/weekly-study`, {
            method: "GET",
            ...opts,
          });
          if (res.ok) {
            const wj = await res.json();
            const raw = wj.data || wj.weeklyStudy || wj.weekly || [];
            if (mounted && raw.length) {
              setWeeklyStudy(raw);
            } else if (mounted) {
              // Fallback: build from last7 days with 0 mins (shows chart with day labels)
              const DAY_LABELS = [
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ];
              const fallback = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(Date.now() - (6 - i) * 86400000);
                return { label: DAY_LABELS[d.getDay()], mins: 0 };
              });
              setWeeklyStudy(fallback);
            }
          }
        } catch (_) {
          if (mounted) {
            const DAY_LABELS = [
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ];
            const fallback = Array.from({ length: 7 }, (_, i) => {
              const d = new Date(Date.now() - (6 - i) * 86400000);
              return { label: DAY_LABELS[d.getDay()], mins: 0 };
            });
            setWeeklyStudy(fallback);
          }
        }

        // ── 5. Activity Heatmap ──
        // Backend returns: { success: true, grid: [{date, count}, ...] } (84 cells)
        try {
          const res = await fetch(`${API_BASE}/api/progress/activity`, {
            method: "GET",
            ...opts,
          });
          if (res.ok) {
            const aj = await res.json();
            const grid = aj.grid || aj.activity || aj.data || [];
            if (mounted && grid.length) {
              setActivityData(grid);
            } else if (mounted) {
              // Fallback: empty 84-cell grid
              const fallback = Array.from({ length: 84 }, (_, i) => {
                const d = new Date(Date.now() - (83 - i) * 86400000);
                return { date: d.toISOString().split("T")[0], count: 0 };
              });
              setActivityData(fallback);
            }
          }
        } catch (_) {
          if (mounted) {
            const fallback = Array.from({ length: 84 }, (_, i) => {
              const d = new Date(Date.now() - (83 - i) * 86400000);
              return { date: d.toISOString().split("T")[0], count: 0 };
            });
            setActivityData(fallback);
          }
        }
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchAll();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [isSignedIn, token]);

  const openCourse = useCallback(
    async (id) => {
      if (!isSignedIn) {
        toast.error("Please login to access this course");
        return;
      }
      try {
        await fetch(`${API_BASE}/api/course/${id}/view`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (_) {}
      navigate(`/course/${id}`);
    },
    [isSignedIn, navigate, token],
  );

  /* ── Stats ── */
  const stats = useMemo(() => {
    if (!courses.length)
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        totalChDone: 0,
        avgProgress: 0,
        totalMins: 0,
      };
    const total = courses.length;
    const completed = courses.filter((c) => {
      const d = completedMap[c.id]?.length || 0;
      return d >= c.totalCh && c.totalCh > 0;
    }).length;
    const inProgress = total - completed;
    const totalChDone = Object.values(completedMap).reduce(
      (a, arr) => a + arr.length,
      0,
    );
    const avgProgress = Math.round(
      courses.reduce((a, c) => {
        const d = completedMap[c.id]?.length || 0;
        return a + (c.totalCh > 0 ? (d / c.totalCh) * 100 : 0);
      }, 0) / total,
    );
    const totalMins = weeklyStudy.reduce((a, d) => a + (d.mins || 0), 0);
    return {
      total,
      completed,
      inProgress,
      totalChDone,
      avgProgress,
      totalMins,
    };
  }, [courses, completedMap, weeklyStudy]);

  // "5m" | "1h" | "1h 5m" — never shows "0h 5m"
  const formatMins = (mins) => {
    if (!mins || mins <= 0) return "0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const resumeCourse =
    courses.find((c) => getPct(c, completedMap) < 100) || courses[0];

  const filteredCourses = useMemo(() => {
    let list = [...courses];
    if (courseFilter === "completed")
      list = list.filter((c) => getPct(c, completedMap) === 100);
    else if (courseFilter === "inprogress")
      list = list.filter((c) => {
        const p = getPct(c, completedMap);
        return p > 0 && p < 100;
      });
    else if (courseFilter === "notstarted")
      list = list.filter((c) => getPct(c, completedMap) === 0);
    if (searchQuery)
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.teacher.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return list;
  }, [courses, completedMap, courseFilter, searchQuery]);

  const TABS = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "courses", label: "My Courses", icon: BookOpen },
  ];

  if (isLoading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#050a14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "3px solid rgba(99,102,241,0.3)",
              borderTopColor: "#6366f1",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Loading your dashboard…
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#050a14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: "40px",
            borderRadius: "16px",
            border: "1px solid rgba(239,68,68,0.2)",
            background: "rgba(239,68,68,0.05)",
            textAlign: "center",
          }}
        >
          <AlertCircle
            size={40}
            color="#ef4444"
            style={{ margin: "0 auto 16px" }}
          />
          <h2 style={{ color: "#fff", marginBottom: "8px", fontSize: "20px" }}>
            Something went wrong
          </h2>
          <p style={{ color: "#ef4444", fontSize: "14px" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 24px",
              borderRadius: "8px",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;600&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        * { box-sizing: border-box; }
        .lms-tab:hover { background: rgba(34,211,238,0.06) !important; color: rgba(255,255,255,0.8) !important; }
        .pill-btn:hover { border-color: rgba(34,211,238,0.5) !important; color: rgba(255,255,255,0.8) !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.3); border-radius: 2px; }
        @media (max-width: 900px) { .stat-cards-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 600px) { .stat-cards-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#050a14",
          color: "#fff",
          fontFamily: "'DM Sans',sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient BG */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-200px",
              right: "-200px",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(99,102,241,0.08) 0%,transparent 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-150px",
              left: "-150px",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)",
            }}
          />
        </div>

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "28px 24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Hero Banner */}
          <div
            style={{
              borderRadius: "18px",
              border: "1px solid rgba(34,211,238,0.2)",
              background:
                "linear-gradient(135deg,rgba(34,211,238,0.08) 0%,rgba(59,130,246,0.05) 50%,rgba(0,0,0,0) 100%)",
              padding: "28px 32px",
              marginBottom: "24px",
              position: "relative",
              overflow: "hidden",
              animation: "fadeUp 0.4s ease",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: "-60px",
                top: "-60px",
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                background: "rgba(34,211,238,0.06)",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: "260px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    background: "rgba(34,211,238,0.12)",
                    border: "1px solid rgba(34,211,238,0.3)",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#22d3ee",
                    marginBottom: "14px",
                    letterSpacing: "0.04em",
                  }}
                >
                  <Zap size={10} /> ACTIVE LEARNER
                </div>
                <h1
                  style={{
                    fontSize: "clamp(22px,4vw,34px)",
                    fontWeight: 800,
                    margin: "0 0 10px",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.2,
                  }}
                >
                  {greeting},{" "}
                  <span
                    style={{
                      background: "linear-gradient(90deg,#22d3ee,#3b82f6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {user?.username || user?.name || "Learner"}
                  </span>
                </h1>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.45)",
                    margin: "0 0 20px",
                    maxWidth: "550px",
                    lineHeight: 1.6,
                  }}
                >
                  {stats.totalMins > 0 ? (
                    <>
                      You've invested{" "}
                      <strong style={{ color: "#fff" }}>
                        {formatMins(stats.totalMins)}
                      </strong>{" "}
                      in learning this week. Keep building your momentum.
                    </>
                  ) : courses.length > 0 ? (
                    <>
                      You have{" "}
                      <strong style={{ color: "#fff" }}>
                        {stats.inProgress} active course
                        {stats.inProgress !== 1 ? "s" : ""}
                      </strong>
                      . Continue where you left off.
                    </>
                  ) : (
                    <>
                      Welcome back,{" "}
                      <strong style={{ color: "#fff" }}>
                        {user?.username || user?.name}
                      </strong>
                      . Start your next lesson.
                    </>
                  )}
                </p>
                {resumeCourse && (
                  <button
                    onClick={() => openCourse(resumeCourse.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "11px 22px",
                      borderRadius: "10px",
                      border: "none",
                      background: "linear-gradient(135deg,#22d3ee,#3b82f6)",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#fff",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      boxShadow: "0 4px 20px rgba(34,211,238,0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 30px rgba(34,211,238,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 20px rgba(34,211,238,0.3)";
                    }}
                  >
                    <Play size={13} fill="white" /> Resume Learning{" "}
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
              {courses.length > 0 && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "20px" }}
                >
                  <div style={{ position: "relative" }}>
                    <ProgressRing
                      pct={stats.avgProgress}
                      size={120}
                      stroke={9}
                      color="#6366f1"
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "26px",
                          fontWeight: 800,
                          letterSpacing: "-0.03em",
                          fontFamily: "'DM Mono',monospace",
                        }}
                      >
                        {stats.avgProgress}%
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "rgba(255,255,255,0.4)",
                          fontWeight: 600,
                          letterSpacing: "0.05em",
                        }}
                      >
                        OVERALL
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {[
                      {
                        label: "Enrolled",
                        value: stats.total,
                        color: "#38bdf8",
                      },
                      {
                        label: "Completed",
                        value: stats.completed,
                        color: "#10b981",
                      },
                      {
                        label: "In Progress",
                        value: stats.inProgress,
                        color: "#f59e0b",
                      },
                    ].map((s, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: s.color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.4)",
                            minWidth: "70px",
                          }}
                        >
                          {s.label}
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 800,
                            color: "#fff",
                            fontFamily: "'DM Mono',monospace",
                          }}
                        >
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tab Nav */}
          <div
            style={{
              display: "flex",
              gap: "4px",
              marginBottom: "24px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className="lms-tab"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "10px 16px",
                    borderRadius: "8px 8px 0 0",
                    background: isActive
                      ? "rgba(34,211,238,0.08)"
                      : "transparent",
                    border: "none",
                    borderBottom: isActive
                      ? "2px solid #22d3ee"
                      : "2px solid transparent",
                    color: isActive ? "#22d3ee" : "rgba(255,255,255,0.45)",
                    fontSize: "13px",
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <tab.icon size={14} />
                  {tab.label}
                  {tab.id === "courses" && courses.length > 0 && (
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "1px 6px",
                        borderRadius: "10px",
                        background: isActive
                          ? "rgba(34,211,238,0.2)"
                          : "rgba(255,255,255,0.08)",
                        color: isActive ? "#22d3ee" : "rgba(255,255,255,0.3)",
                        fontWeight: 700,
                      }}
                    >
                      {courses.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Stat Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "12px",
                }}
                className="stat-cards-grid"
              >
                <StatCard
                  label="Enrolled Courses"
                  value={stats.total}
                  icon={BookOpen}
                  color="#38bdf8"
                  trend={12}
                  delay={0}
                />
                <StatCard
                  label="Completed"
                  value={stats.completed}
                  icon={Award}
                  color="#10b981"
                  trend={5}
                  delay={60}
                />
                <StatCard
                  label="Chapters Done"
                  value={stats.totalChDone}
                  icon={CheckCircle2}
                  color="#6366f1"
                  trend={18}
                  delay={120}
                />
                <StatCard
                  label="Study Time"
                  value={formatMins(stats.totalMins)}
                  icon={Clock}
                  color="#f59e0b"
                  delay={180}
                />
                <StatCard
                  label="Current Streak"
                  value={`${streakDays}d`}
                  icon={Flame}
                  color="#ef4444"
                  trend={streakDays > 3 ? 20 : 0}
                  delay={240}
                />
              </div>

              {/* Charts Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
                  gap: "16px",
                }}
              >
                {/* Weekly Study Chart */}
                <div
                  style={{
                    padding: "22px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "#0a0f1e",
                    animation: "fadeUp 0.5s ease both",
                    animationDelay: "200ms",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          margin: "0 0 4px",
                        }}
                      >
                        Weekly <G>Study</G>
                      </h3>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.35)",
                          margin: 0,
                        }}
                      >
                        Minutes per day
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: "rgba(34,211,238,0.1)",
                        color: "#22d3ee",
                        fontWeight: 600,
                      }}
                    >
                      This Week
                    </span>
                  </div>
                  {/* Always render chart — shows 0m bars if no data */}
                  <MiniBarChart
                    data={
                      weeklyStudy.length > 0
                        ? weeklyStudy
                        : Array.from({ length: 7 }, (_, i) => {
                            const d = new Date(Date.now() - (6 - i) * 86400000);
                            return {
                              label: [
                                "Sun",
                                "Mon",
                                "Tue",
                                "Wed",
                                "Thu",
                                "Fri",
                                "Sat",
                              ][d.getDay()],
                              mins: 0,
                            };
                          })
                    }
                  />
                </div>

                {/* Activity Heatmap */}
                <div
                  style={{
                    padding: "22px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "#0a0f1e",
                    animation: "fadeUp 0.5s ease both",
                    animationDelay: "280ms",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          margin: "0 0 4px",
                        }}
                      >
                        Activity <G>Heatmap</G>
                      </h3>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.35)",
                          margin: 0,
                        }}
                      >
                        Learning consistency
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "4px",
                        alignItems: "center",
                      }}
                    >
                      {[0.2, 0.4, 0.6, 1].map((op, i) => (
                        <div
                          key={i}
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "3px",
                            background: `rgba(34,211,238,${op})`,
                          }}
                        />
                      ))}
                      <span
                        style={{
                          fontSize: "10px",
                          color: "rgba(255,255,255,0.3)",
                          marginLeft: "4px",
                        }}
                      >
                        More
                      </span>
                    </div>
                  </div>
                  {/* Always render heatmap */}
                  <ActivityHeatmap
                    grid={
                      activityData.length > 0
                        ? activityData
                        : Array.from({ length: 84 }, (_, i) => {
                            const d = new Date(
                              Date.now() - (83 - i) * 86400000,
                            );
                            return {
                              date: d.toISOString().split("T")[0],
                              count: 0,
                            };
                          })
                    }
                  />
                </div>
              </div>

              {/* Continue Learning */}
              {courses.length > 0 && (
                <div
                  style={{
                    padding: "22px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "#0a0f1e",
                    animation: "fadeUp 0.5s ease both",
                    animationDelay: "350ms",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <h3
                      style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}
                    >
                      Continue <G>Learning</G>
                    </h3>
                    <button
                      onClick={() => setActiveTab("courses")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        color: "#22d3ee",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      View all <ChevronRight size={13} />
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {courses.slice(0, 3).map((c, i) => (
                      <CourseCard
                        key={c.id}
                        course={c}
                        pct={getPct(c, completedMap)}
                        onClick={() => openCourse(c.id)}
                        view="list"
                        delay={i * 60}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── COURSES TAB ── */}
          {activeTab === "courses" && (
            <div>
              {/* Heading */}
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  margin: "0 0 20px",
                  letterSpacing: "-0.03em",
                }}
              >
                My{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg,#22d3ee,#3b82f6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Courses
                </span>
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "18px",
                }}
              >
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[
                    { id: "all", label: `All (${courses.length})` },
                    {
                      id: "inprogress",
                      label: `In Progress (${stats.inProgress})`,
                    },
                    {
                      id: "completed",
                      label: `Completed (${stats.completed})`,
                    },
                    { id: "notstarted", label: "Not Started" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      className="pill-btn"
                      onClick={() => setCourseFilter(f.id)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        background:
                          courseFilter === f.id
                            ? "rgba(34,211,238,0.15)"
                            : "transparent",
                        border: `1px solid ${courseFilter === f.id ? "rgba(34,211,238,0.5)" : "rgba(255,255,255,0.1)"}`,
                        color:
                          courseFilter === f.id
                            ? "#22d3ee"
                            : "rgba(255,255,255,0.4)",
                        transition: "all 0.15s",
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[
                    { id: "grid", icon: Grid },
                    { id: "list", icon: List },
                  ].map(({ id, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setCourseView(id)}
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "8px",
                        border: `1px solid ${courseView === id ? "rgba(34,211,238,0.5)" : "rgba(255,255,255,0.1)"}`,
                        background:
                          courseView === id
                            ? "rgba(34,211,238,0.12)"
                            : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color:
                          courseView === id
                            ? "#22d3ee"
                            : "rgba(255,255,255,0.35)",
                      }}
                    >
                      <Icon size={15} />
                    </button>
                  ))}
                </div>
              </div>

              {courses.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 24px",
                    borderRadius: "14px",
                    border: "1px dashed rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <BookOpen
                    size={40}
                    color="rgba(255,255,255,0.15)"
                    style={{ margin: "0 auto 16px" }}
                  />
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.5)",
                      margin: "0 0 8px",
                    }}
                  >
                    No courses yet
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.25)",
                      margin: 0,
                    }}
                  >
                    Enroll in a course to start learning
                  </p>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  <Search size={32} style={{ margin: "0 auto 12px" }} />
                  <p style={{ fontSize: "14px" }}>
                    No courses match your filter
                  </p>
                  <button
                    onClick={() => {
                      setCourseFilter("all");
                      setSearchQuery("");
                    }}
                    style={{
                      marginTop: "10px",
                      fontSize: "12px",
                      color: "#818cf8",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : courseView === "grid" ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                    gap: "16px",
                  }}
                >
                  {filteredCourses.map((c, i) => (
                    <CourseCard
                      key={c.id}
                      course={c}
                      pct={getPct(c, completedMap)}
                      onClick={() => openCourse(c.id)}
                      view="grid"
                      delay={i * 50}
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {filteredCourses.map((c, i) => (
                    <CourseCard
                      key={c.id}
                      course={c}
                      pct={getPct(c, completedMap)}
                      onClick={() => openCourse(c.id)}
                      view="list"
                      delay={i * 40}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: "#0d1225",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: "13px",
            borderRadius: "10px",
          },
        }}
      />
    </>
  );
};

export default UserDashboard;
