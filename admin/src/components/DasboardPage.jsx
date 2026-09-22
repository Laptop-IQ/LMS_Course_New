import React, { useEffect, useMemo, useState } from "react";
import {
  BadgeIndianRupee,
  BookMarked,
  ShoppingCart,
  Users,
  BookOpenText,
  Search,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Activity,
  GraduationCap,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  RefreshCw,
  Crown,
  Zap,
  Flame,
} from "lucide-react";
import RevenueDetailPage from "./RevenueDetailPage";
import {
  EnrollmentsDetailPage,
  WeeklyDetailPage,
  ExpiredDetailPage,
} from "./DetailPages";

const API_BASE = import.meta.env.VITE_API_BASE;

const fmtCurrency = (n) => {
  if (n == null) return "₹0";
  const num = Number(n);
  if (Number.isNaN(num)) return "₹0";
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString("en-IN")}`;
};
const fmtFull = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// ── Sparkline SVG ──────────────────────────────────────────────────────────
const Sparkline = ({ data = [], color = "#06b6d4", height = 32 }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const id = `sg${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M${pts[0]} L${pts.join(" L")} L${w},${h} L0,${h} Z`}
        fill={`url(#${id})`}
      />
      <path
        d={`M${pts[0]} L${pts.join(" L")}`}
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ── Mini Bar Chart ─────────────────────────────────────────────────────────
const MiniBarChart = ({ data = [], color = "#06b6d4" }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div
      style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 44 }}
    >
      {data.map((d, i) => (
        <div
          key={i}
          title={`${d.label}: ${d.value}`}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <div
            style={{
              width: "100%",
              height: `${Math.max((d.value / max) * 40, 3)}px`,
              background: i === data.length - 1 ? color : `${color}55`,
              borderRadius: "3px 3px 0 0",
              transition: "height 0.8s ease",
            }}
          />
        </div>
      ))}
    </div>
  );
};

// ── Donut Chart ────────────────────────────────────────────────────────────
const DonutChart = ({ data, total, size = 120 }) => {
  const r = 42;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const safeTotal = total || data.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="12"
      />
      {data.map((d, i) => {
        const pct = d.value / safeTotal;
        const dash = pct * circ;
        const gap = circ - dash;
        const el = (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth="12"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circ}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        );
        offset += pct;
        return el;
      })}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fill="white"
        fontSize="18"
        fontWeight="700"
      >
        {safeTotal === 1 && total === 0 ? 0 : total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize="9">
        TOTAL
      </text>
    </svg>
  );
};

// ── Progress Bar ───────────────────────────────────────────────────────────
const ProgressBar = ({ value, max, color }) => (
  <div
    style={{
      height: 4,
      background: "rgba(255,255,255,0.07)",
      borderRadius: 99,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        height: "100%",
        width: `${Math.min((value / (max || 1)) * 100, 100)}%`,
        background: color,
        borderRadius: 99,
        transition: "width 1s ease",
      }}
    />
  </div>
);

// ── % Change Badge ─────────────────────────────────────────────────────────
const ChangeBadge = ({ pct }) => {
  if (pct === null || pct === undefined) return null;
  const up = pct >= 0;
  return (
    <div
      style={{
        fontSize: 11,
        color: up ? "#34d399" : "#f87171",
        display: "flex",
        alignItems: "center",
        gap: 3,
      }}
    >
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {up ? "+" : ""}
      {pct}% vs last month
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
const DashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState("purchases");
  const [sortDir, setSortDir] = useState("desc");
  const [activeTab, setActiveTab] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showRevenuePage, setShowRevenuePage] = useState(false);
  const [showEnrollmentsPage, setShowEnrollmentsPage] = useState(false);
  const [showWeeklyPage, setShowWeeklyPage] = useState(false);
  const [showExpiredPage, setShowExpiredPage] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const [sRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/api/booking/stats`),
        fetch(`${API_BASE}/api/course`),
      ]);
      const [sJson, cJson] = await Promise.all([sRes.json(), cRes.json()]);
      if (!sJson.success) throw new Error(sJson.message || "Stats failed");
      if (!cJson.success) throw new Error(cJson.message || "Courses failed");

      const s = sJson.stats;
      setStats(s);

      const topLookup = {};
      (s.topCourses || []).forEach((t) => {
        topLookup[t.courseName] = {
          purchases: Number(t.count || 0),
          revenue: Number(t.revenue || 0),
        };
      });

      setCoursesData(
        (cJson.courses || []).map((c) => {
          const m = topLookup[c.name] || {};
          return {
            id: c._id,
            image: c.image,
            name: c.name || "Untitled",
            instructor: c.teacher || "Unknown",
            students: m.purchases || c.students || 0,
            purchases: m.purchases || 0,
            revenue: m.revenue || 0,
            price: c.price?.sale || c.price?.original || 0,
            priceLabel:
              c.price?.sale || c.price?.original
                ? fmtFull(c.price.sale || c.price.original)
                : "Free",
            rating: c.rating || null,
          };
        }),
      );
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ── Derived values from REAL stats ──────────────────────────────────────
  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalBookings = stats?.totalBookings ?? 0;
  const last7 = stats?.bookingsLast7Days ?? 0;
  const expiredCount = stats?.expiredCount ?? 0;
  const validityBreakdown = stats?.validityBreakdown ?? [];
  const topCourses = stats?.topCourses ?? [];

  // Real sparkline arrays from weeklyData
  const weeklyBookingCounts = (stats?.weeklyData || []).map((d) => d.count);
  const weeklyRevenueTotals = (stats?.weeklyRevenue || []).map((d) => d.total);

  // Real % changes from backend
  const revenueChangePct = stats?.revenueChangePercent ?? null;
  const bookingsChangePct = stats?.bookingsChangePercent ?? null;
  const weeklyChangePct = stats?.weeklyBookingsChangePercent ?? null;

  // Weekly bar chart with real day labels
  const weekBarData = (stats?.weeklyData || []).map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" }),
    value: d.count,
  }));

  // ── Sorting & filtering ──────────────────────────────────────────────────
  const sorted = useMemo(() => {
    let list = [...coursesData];
    if (activeTab === "paid") list = list.filter((c) => c.price > 0);
    if (activeTab === "free") list = list.filter((c) => c.price === 0);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      const va = a[sortKey] ?? 0;
      const vb = b[sortKey] ?? 0;
      if (typeof va === "string")
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return list;
  }, [coursesData, searchTerm, sortKey, sortDir, activeTab]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };
  const SortIcon = ({ k }) =>
    sortKey === k ? (
      sortDir === "asc" ? (
        <ChevronUp size={13} />
      ) : (
        <ChevronDown size={13} />
      )
    ) : (
      <ChevronDown size={13} style={{ opacity: 0.3 }} />
    );

  // ── JSX ──────────────────────────────────────────────────────────────────

  if (showRevenuePage) {
    return <RevenueDetailPage onBack={() => setShowRevenuePage(false)} />;
  }

  if (showEnrollmentsPage)
    return (
      <EnrollmentsDetailPage onBack={() => setShowEnrollmentsPage(false)} />
    );
  if (showWeeklyPage)
    return <WeeklyDetailPage onBack={() => setShowWeeklyPage(false)} />;
  if (showExpiredPage)
    return <ExpiredDetailPage onBack={() => setShowExpiredPage(false)} />;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070B14",
        color: "white",
        fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif",
        position: "relative",
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
            top: -200,
            left: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -200,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
          }}
        />
        <svg
          width="100%"
          height="100%"
          style={{ opacity: 0.12, position: "absolute", inset: 0 }}
        >
          <defs>
            <pattern
              id="dots"
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.8" fill="#334155" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1400,
          margin: "0 auto",
          padding: "32px 28px",
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 36,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            
            <h1
              style={{
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: "-1px",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Dashboard{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#06b6d4,#6366f1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Overview
              </span>
            </h1>
            <p
              style={{
                marginTop: 10,
                fontSize: 14,
                color: "#64748b",
                maxWidth: 480,
                lineHeight: 1.7,
              }}
            >
              Real-time insights into revenue, enrollments, and course
              performance.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {lastUpdated && (
              <span style={{ fontSize: 11, color: "#475569" }}>
                Updated{" "}
                {lastUpdated.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <button
              onClick={loadDashboard}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "8px 16px",
                color: "#94a3b8",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <RefreshCw
                size={14}
                style={{
                  animation: loading ? "spin 1s linear infinite" : "none",
                }}
              />{" "}
              Refresh
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.15)",
                borderRadius: 14,
                padding: "8px 16px",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 6px #10b981",
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#34d399" }}>
                Live
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 24,
              borderRadius: 16,
              border: "1px solid rgba(239,68,68,0.2)",
              background: "rgba(239,68,68,0.08)",
              padding: "14px 20px",
              color: "#fca5a5",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* ── KPI CARDS ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* Revenue */}
          <div
            onClick={() => setShowRevenuePage(true)}
            style={{
              background:
                "linear-gradient(135deg,rgba(16,185,129,0.12),rgba(16,185,129,0.03))",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 20,
              padding: "22px 24px",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow =
                "0 16px 48px rgba(16,185,129,0.18)";
              e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "rgba(16,185,129,0.2)";
            }}
          >
            {/* Decorative circle */}
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "rgba(16,185,129,0.06)",
              }}
            />

            {/* Top row: label + icon */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  Total Revenue
                </p>
                <h2
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    margin: "10px 0 4px",
                    color: "#ecfdf5",
                    letterSpacing: "-1px",
                  }}
                >
                  {loading ? "—" : fmtCurrency(totalRevenue)}
                </h2>
                <ChangeBadge pct={revenueChangePct} />
              </div>
              <div
                style={{
                  background: "rgba(16,185,129,0.15)",
                  borderRadius: 14,
                  padding: 12,
                }}
              >
                <BadgeIndianRupee size={22} color="#10b981" />
              </div>
            </div>

            {/* Sparkline */}
            <div style={{ marginTop: 16 }}>
              <Sparkline
                data={
                  weeklyRevenueTotals.length >= 2 ? weeklyRevenueTotals : [0, 0]
                }
                color="#10b981"
              />
              {weeklyRevenueTotals.length > 0 && (
                <p style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
                  7-day trend
                </p>
              )}
            </div>

            {/* Click hint */}
            <div
              style={{
                marginTop: 12,
                paddingTop: 10,
                borderTop: "1px solid rgba(16,185,129,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 11, color: "#34d399", fontWeight: 600 }}>
                View detailed breakdown
              </span>
              <ArrowUpRight size={14} color="#34d399" />
            </div>
          </div>

          {/* Enrollments */}
          <div
            onClick={() => setShowEnrollmentsPage(true)}
            style={{
              background:
                "linear-gradient(135deg,rgba(6,182,212,0.12),rgba(6,182,212,0.03))",
              border: "1px solid rgba(6,182,212,0.2)",
              borderRadius: 20,
              padding: "22px 24px",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow =
                "0 16px 48px rgba(6,182,212,0.18)";
              e.currentTarget.style.borderColor = "rgba(6,182,212,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "rgba(6,182,212,0.2)";
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "rgba(6,182,212,0.06)",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  Total Enrollments
                </p>
                <h2
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    margin: "10px 0 4px",
                    color: "#ecfeff",
                    letterSpacing: "-1px",
                  }}
                >
                  {loading ? "—" : totalBookings.toLocaleString("en-IN")}
                </h2>
                <ChangeBadge pct={bookingsChangePct} />
              </div>
              <div
                style={{
                  background: "rgba(6,182,212,0.15)",
                  borderRadius: 14,
                  padding: 12,
                }}
              >
                <Users size={22} color="#06b6d4" />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Sparkline
                data={
                  weeklyBookingCounts.length >= 2 ? weeklyBookingCounts : [0, 0]
                }
                color="#06b6d4"
              />
              {weeklyBookingCounts.length > 0 && (
                <p style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
                  7-day trend
                </p>
              )}
            </div>
            {/* Click hint */}
            <div
              style={{
                marginTop: 12,
                paddingTop: 10,
                borderTop: "1px solid rgba(6,182,212,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 11, color: "#22d3ee", fontWeight: 600 }}>
                View detailed breakdown
              </span>
              <ArrowUpRight size={14} color="#22d3ee" />
            </div>
          </div>

          {/* Last 7 Days */}
          <div
            onClick={() => setShowWeeklyPage(true)}
            style={{
              background:
                "linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.03))",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 20,
              padding: "22px 24px",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow =
                "0 16px 48px rgba(245,158,11,0.18)";
              e.currentTarget.style.borderColor = "rgba(245,158,11,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "rgba(245,158,11,0.2)";
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "rgba(245,158,11,0.06)",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  Last 7 Days
                </p>
                <h2
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    margin: "10px 0 4px",
                    color: "#fffbeb",
                    letterSpacing: "-1px",
                  }}
                >
                  {loading ? "—" : last7}
                </h2>
                <ChangeBadge pct={weeklyChangePct} />
              </div>
              <div
                style={{
                  background: "rgba(245,158,11,0.15)",
                  borderRadius: 14,
                  padding: 12,
                }}
              >
                <Zap size={22} color="#f59e0b" />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <MiniBarChart
                data={
                  weekBarData.length ? weekBarData : [{ label: "", value: 0 }]
                }
                color="#f59e0b"
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 3,
                }}
              >
                {weekBarData.map((d, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 9,
                      color: "#475569",
                      flex: 1,
                      textAlign: "center",
                    }}
                  >
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
            {/* Click hint */}
            <div
              style={{
                marginTop: 12,
                paddingTop: 10,
                borderTop: "1px solid rgba(245,158,11,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600 }}>
                View weekly analytics
              </span>
              <ArrowUpRight size={14} color="#fbbf24" />
            </div>
          </div>

          {/* Expired */}
          <div
            onClick={() => setShowExpiredPage(true)}
            style={{
              background:
                "linear-gradient(135deg,rgba(239,68,68,0.1),rgba(239,68,68,0.02))",
              border: "1px solid rgba(239,68,68,0.18)",
              borderRadius: 20,
              padding: "22px 24px",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow =
                "0 16px 48px rgba(239,68,68,0.18)";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.18)";
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "rgba(239,68,68,0.05)",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  Expired Access
                </p>
                <h2
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    margin: "10px 0 4px",
                    color: "#fff1f2",
                    letterSpacing: "-1px",
                  }}
                >
                  {loading ? "—" : expiredCount}
                </h2>
                <div
                  style={{
                    fontSize: 11,
                    color: "#f87171",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <AlertTriangle size={12} /> Needs renewal
                </div>
              </div>
              <div
                style={{
                  background: "rgba(239,68,68,0.12)",
                  borderRadius: 14,
                  padding: 12,
                }}
              >
                <AlertTriangle size={22} color="#ef4444" />
              </div>
            </div>
            <div
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: "1px solid rgba(239,68,68,0.1)",
              }}
            >
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                <span style={{ color: "#f87171", fontWeight: 600 }}>
                  {expiredCount}
                </span>{" "}
                of{" "}
                <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
                  {totalBookings}
                </span>{" "}
                expired{" "}
                <span style={{ color: "#475569" }}>
                  (
                  {totalBookings
                    ? ((expiredCount / totalBookings) * 100).toFixed(1)
                    : 0}
                  %)
                </span>
              </div>
              <ProgressBar
                value={expiredCount}
                max={totalBookings || 1}
                color="#ef4444"
              />
            </div>
            {/* Click hint */}
            <div
              style={{
                marginTop: 12,
                paddingTop: 10,
                borderTop: "1px solid rgba(239,68,68,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 11, color: "#f87171", fontWeight: 600 }}>
                View expired & expiring soon
              </span>
              <ArrowUpRight size={14} color="#f87171" />
            </div>
          </div>
        </div>

        {/* ── MIDDLE ROW ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* Validity Breakdown — 100% real */}
          <div
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  background: "rgba(99,102,241,0.15)",
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <Target size={18} color="#818cf8" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                  Validity Split
                </h3>
                <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
                  Paid enrollments only
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <DonutChart
                total={validityBreakdown.reduce(
                  (s, v) => s + (v.count || 0),
                  0,
                )}
                data={[
                  {
                    value:
                      validityBreakdown.find((v) => v._id === "lifetime")
                        ?.count || 0,
                    color: "#818cf8",
                  },
                  {
                    value:
                      validityBreakdown.find((v) => v._id === "1year")?.count ||
                      0,
                    color: "#f59e0b",
                  },
                  {
                    value:
                      validityBreakdown.find((v) => v._id === "2year")?.count ||
                      0,
                    color: "#06b6d4",
                  },
                ]}
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {[
                  { label: "Lifetime", id: "lifetime", color: "#818cf8" },
                  { label: "1 Year", id: "1year", color: "#f59e0b" },
                  { label: "2 Years", id: "2year", color: "#06b6d4" },
                ].map((item) => {
                  const found = validityBreakdown.find(
                    (v) => v._id === item.id,
                  );
                  const count = found?.count || 0;
                  const paidTotal = validityBreakdown.reduce(
                    (s, v) => s + (v.count || 0),
                    0,
                  );
                  const pct = paidTotal
                    ? ((count / paidTotal) * 100).toFixed(1)
                    : "0.0";
                  return (
                    <div key={item.id}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 5,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: item.color,
                              display: "block",
                            }}
                          />
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>
                            {item.label}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "white",
                            }}
                          >
                            {count}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: "#475569",
                              minWidth: 36,
                              textAlign: "right",
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <ProgressBar
                        value={count}
                        max={paidTotal || 1}
                        color={item.color}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Courses — 100% real */}
          <div
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    background: "rgba(245,158,11,0.15)",
                    borderRadius: 12,
                    padding: 10,
                  }}
                >
                  <Crown size={18} color="#f59e0b" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                    Top Courses
                  </h3>
                  <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
                    Ranked by enrollments · real data
                  </p>
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: "#475569",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: "4px 10px",
                }}
              >
                Top {topCourses.length}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topCourses.map((c, i) => {
                const maxCount = topCourses[0]?.count || 1;
                const medals = ["🥇", "🥈", "🥉"];
                const barColors = [
                  "#f59e0b",
                  "#94a3b8",
                  "#cd7f32",
                  "#06b6d4",
                  "#818cf8",
                  "#34d399",
                ];
                return (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <span
                      style={{
                        fontSize: i < 3 ? 16 : 12,
                        minWidth: 22,
                        textAlign: "center",
                        color: i >= 3 ? "#475569" : undefined,
                      }}
                    >
                      {i < 3 ? medals[i] : `#${i + 1}`}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 5,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#e2e8f0",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 160,
                          }}
                        >
                          {c.courseName}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: "#10b981",
                              fontWeight: 600,
                            }}
                          >
                            {fmtCurrency(c.revenue)}
                          </span>
                          <span style={{ fontSize: 11, color: "#64748b" }}>
                            {c.count} enrolled
                          </span>
                        </div>
                      </div>
                      <ProgressBar
                        value={c.count}
                        max={maxCount}
                        color={barColors[i] || "#06b6d4"}
                      />
                    </div>
                  </div>
                );
              })}
              {!loading && topCourses.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#475569",
                    fontSize: 13,
                    padding: "20px 0",
                  }}
                >
                  No booking data yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── COURSE TABLE ── */}
        <div
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "22px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  background: "rgba(6,182,212,0.12)",
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <BookOpenText size={18} color="#06b6d4" />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>
                  Course Performance
                </h2>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                  {sorted.length} courses · sorted by {sortKey}
                </p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: 3,
                  gap: 2,
                }}
              >
                {["all", "paid", "free"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 9,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                      background:
                        activeTab === t ? "rgba(6,182,212,0.2)" : "transparent",
                      color: activeTab === t ? "#22d3ee" : "#64748b",
                      textTransform: "capitalize",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div style={{ position: "relative" }}>
                <Search
                  size={15}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#475569",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    padding: "8px 14px 8px 34px",
                    color: "white",
                    fontSize: 13,
                    outline: "none",
                    width: 200,
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 860,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {[
                    { label: "Course", key: "name", w: "32%" },
                    { label: "Students", key: "students" },
                    { label: "Price", key: "price" },
                    { label: "Purchases", key: "purchases" },
                    { label: "Revenue", key: "revenue" },
                    ...(coursesData.some((c) => c.rating)
                      ? [{ label: "Rating", key: "rating" }]
                      : []),
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => toggleSort(col.key)}
                      style={{
                        padding: "14px 20px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: sortKey === col.key ? "#06b6d4" : "#475569",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        width: col.w,
                        userSelect: "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {col.label} <SortIcon k={col.key} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  sorted.map((course, i) => (
                    <tr
                      key={course.id || i}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(6,182,212,0.03)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "16px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                          }}
                        >
                          <div style={{ position: "relative" }}>
                            {course.image ? (
                              <img
                                src={course.image}
                                alt={course.name}
                                style={{
                                  width: 56,
                                  height: 40,
                                  objectFit: "cover",
                                  borderRadius: 10,
                                  border: "1px solid rgba(255,255,255,0.08)",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 56,
                                  height: 40,
                                  borderRadius: 10,
                                  background: "rgba(99,102,241,0.2)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <BookMarked size={18} color="#818cf8" />
                              </div>
                            )}
                            {i < 3 && (
                              <span
                                style={{
                                  position: "absolute",
                                  top: -6,
                                  right: -6,
                                  fontSize: 12,
                                }}
                              >
                                {["🥇", "🥈", "🥉"][i]}
                              </span>
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#f1f5f9",
                                margin: 0,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 200,
                              }}
                            >
                              {course.name}
                            </p>
                            <p
                              style={{
                                fontSize: 12,
                                color: "#64748b",
                                margin: "2px 0 0",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <GraduationCap size={11} /> {course.instructor}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Users size={14} color="#06b6d4" />
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#e2e8f0",
                            }}
                          >
                            {course.students.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            background:
                              course.price === 0
                                ? "rgba(6,182,212,0.1)"
                                : "rgba(16,185,129,0.1)",
                            border: `1px solid ${course.price === 0 ? "rgba(6,182,212,0.2)" : "rgba(16,185,129,0.2)"}`,
                            color: course.price === 0 ? "#22d3ee" : "#34d399",
                            borderRadius: 8,
                            padding: "4px 10px",
                          }}
                        >
                          {course.priceLabel}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <ShoppingCart size={14} color="#a78bfa" />
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#e2e8f0",
                            }}
                          >
                            {course.purchases}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: course.revenue > 0 ? "#10b981" : "#475569",
                          }}
                        >
                          {fmtCurrency(course.revenue)}
                        </span>
                      </td>
                      {coursesData.some((c) => c.rating) && (
                        <td style={{ padding: "16px 20px" }}>
                          {course.rating ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              <Star size={13} color="#f59e0b" fill="#f59e0b" />
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "#fbbf24",
                                }}
                              >
                                {Number(course.rating).toFixed(1)}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: "#475569" }}>
                              —
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>

            {loading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "60px 0",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "3px solid rgba(6,182,212,0.2)",
                    borderTop: "3px solid #06b6d4",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              </div>
            )}
            {!loading && sorted.length === 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "60px 0",
                  textAlign: "center",
                }}
              >
                <Search
                  size={36}
                  color="#475569"
                  style={{ marginBottom: 16 }}
                />
                <h3
                  style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}
                >
                  No courses found
                </h3>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setActiveTab("all");
                  }}
                  style={{
                    background: "rgba(6,182,212,0.1)",
                    border: "1px solid rgba(6,182,212,0.2)",
                    borderRadius: 12,
                    padding: "10px 20px",
                    color: "#22d3ee",
                    fontSize: 13,
                    cursor: "pointer",
                    marginTop: 16,
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {!loading && sorted.length > 0 && (
            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 12, color: "#475569" }}>
                Showing {sorted.length} of {coursesData.length} courses
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  fontSize: 12,
                  color: "#64748b",
                }}
              >
                <span>
                  Total purchases:{" "}
                  <strong style={{ color: "#e2e8f0" }}>
                    {sorted.reduce((s, c) => s + c.purchases, 0)}
                  </strong>
                </span>
                <span>
                  Total revenue:{" "}
                  <strong style={{ color: "#10b981" }}>
                    {fmtCurrency(sorted.reduce((s, c) => s + c.revenue, 0))}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}input::placeholder{color:#475569}button:hover{opacity:0.85}`}</style>
    </div>
  );
};

export default DashboardPage;
