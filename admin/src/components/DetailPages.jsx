import React, { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  Users,
  Zap,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  GraduationCap,
  CalendarDays,
  Clock,
  Infinity,
  ShieldCheck,
  XCircle,
  Hourglass,
  PackageCheck,
  Timer,
  Mail,
  TrendingUp,
  Activity,
  BarChart3,
  Crown,
  Search,
  Filter,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

// ─── Date Range Options ───────────────────────────────────────────────────────
const DATE_RANGES = [
  { label: "7 Days", value: "7d", days: 7 },
  { label: "1 Month", value: "1m", days: 30 },
  { label: "3 Months", value: "3m", days: 90 },
  { label: "1 Year", value: "1y", days: 365 },
];

// Returns [startDate, endDate] for a given range value
const getRangeDates = (rangeValue) => {
  const end = new Date();
  const start = new Date();
  const r = DATE_RANGES.find((r) => r.value === rangeValue) || DATE_RANGES[0];
  start.setDate(start.getDate() - r.days);
  return [start, end];
};

// ─── Date Range Filter Pills ──────────────────────────────────────────────────
const DateRangeFilter = ({ value, onChange, accentColor = "#06b6d4" }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 14,
      padding: "4px 5px",
      gap: 2,
    }}
  >
    {DATE_RANGES.map((r) => {
      const active = value === r.value;
      return (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          style={{
            padding: "6px 14px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: active ? 700 : 500,
            transition: "all 0.18s",
            background: active
              ? `linear-gradient(135deg, ${accentColor}cc, ${accentColor}88)`
              : "transparent",
            color: active ? "#fff" : "#64748b",
            boxShadow: active ? `0 0 12px ${accentColor}44` : "none",
          }}
          onMouseEnter={(e) => {
            if (!active) e.currentTarget.style.color = "#94a3b8";
          }}
          onMouseLeave={(e) => {
            if (!active) e.currentTarget.style.color = "#64748b";
          }}
        >
          {r.label}
        </button>
      );
    })}
  </div>
);

// ─── Shared Helpers ───────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmtCurrency = (n) => {
  const num = Number(n || 0);
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString("en-IN")}`;
};

// Filter bookings by date range
const filterByRange = (bookings, rangeValue) => {
  const [start] = getRangeDates(rangeValue);
  return bookings.filter((b) => new Date(b.createdAt) >= start);
};

// ─── Ambient Background ───────────────────────────────────────────────────────
const AmbientBG = ({ color1, color2 }) => (
  <div
    style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
  >
    <div
      style={{
        position: "absolute",
        top: -220,
        left: -220,
        width: 700,
        height: 700,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color1} 0%, transparent 70%)`,
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
        background: `radial-gradient(circle, ${color2} 0%, transparent 70%)`,
      }}
    />
    <svg
      width="100%"
      height="100%"
      style={{ opacity: 0.08, position: "absolute", inset: 0 }}
    >
      <defs>
        <pattern
          id="dotsbg"
          x="0"
          y="0"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="0.8" fill="#334155" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotsbg)" />
    </svg>
  </div>
);

// ─── Page Header ──────────────────────────────────────────────────────────────
const PageHeader = ({
  onBack,
  title,
  loading,
  onRefresh,
  lastUpdated,
  dateRange,
  onDateRangeChange,
  accentColor,
}) => (
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
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "9px 16px",
            color: "#94a3b8",
            fontSize: 13,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
          }
        >
          <ArrowLeft size={15} /> Back
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
            {title}
          </h1>
        </div>
      </div>

      {/* Date range filter — below title */}
      {onDateRangeChange && (
        <DateRangeFilter
          value={dateRange}
          onChange={onDateRangeChange}
          accentColor={accentColor}
        />
      )}
    </div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        paddingTop: 4,
      }}
    >
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
        onClick={onRefresh}
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
          style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
        />{" "}
        Refresh
      </button>
    </div>
  </div>
);

// ─── KPI Chip ─────────────────────────────────────────────────────────────────
const KpiChip = ({ label, value, sub, color, icon: Icon }) => (
  <div
    style={{
      background: `linear-gradient(135deg,${color}18,${color}05)`,
      border: `1px solid ${color}28`,
      borderRadius: 20,
      padding: "20px 22px",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: -18,
        right: -18,
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: `${color}0e`,
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
            fontSize: 10,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontWeight: 600,
            margin: 0,
          }}
        >
          {label}
        </p>
        <h3
          style={{
            fontSize: 28,
            fontWeight: 800,
            margin: "8px 0 4px",
            color: "white",
            letterSpacing: "-0.5px",
          }}
        >
          {value}
        </h3>
        {sub && (
          <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{sub}</p>
        )}
      </div>
      {Icon && (
        <div
          style={{ background: `${color}20`, borderRadius: 12, padding: 10 }}
        >
          <Icon size={20} color={color} />
        </div>
      )}
    </div>
  </div>
);

// ─── Bar Chart SVG ────────────────────────────────────────────────────────────
const BarSVG = ({
  data = [],
  color = "#06b6d4",
  valueFormatter = (v) => v,
}) => {
  if (!data.length) return null;
  const W = 680,
    H = 180,
    PL = 16,
    PR = 16,
    PT = 20,
    PB = 32;
  const iW = W - PL - PR;
  const iH = H - PT - PB;
  const maxV = Math.max(...data.map((d) => d.value), 1);
  const barW = Math.min((iW / data.length) * 0.6, 40);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", overflow: "visible" }}
    >
      <defs>
        {data.map((_, i) => (
          <linearGradient key={i} id={`bb${i}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.25" />
          </linearGradient>
        ))}
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line
          key={i}
          x1={PL}
          x2={PL + iW}
          y1={PT + t * iH}
          y2={PT + t * iH}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
        />
      ))}
      {data.map((d, i) => {
        const x = PL + (i + 0.5) * (iW / data.length) - barW / 2;
        const barH = Math.max((d.value / maxV) * iH, 3);
        const y = PT + iH - barH;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill={`url(#bb${i})`}
              rx="4"
              ry="4"
            />
            <text
              x={x + barW / 2}
              y={H - 6}
              textAnchor="middle"
              fill="#475569"
              fontSize="10"
            >
              {d.label}
            </text>
            {d.value > 0 && (
              <text
                x={x + barW / 2}
                y={y - 5}
                textAnchor="middle"
                fill={color}
                fontSize="9"
                fontWeight="700"
              >
                {valueFormatter(d.value)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const PBar = ({ value, max, color }) => (
  <div
    style={{
      height: 5,
      background: "rgba(255,255,255,0.06)",
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

// ─── Table Shell ──────────────────────────────────────────────────────────────
const TableShell = ({ children, headers }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", minWidth: 680, borderCollapse: "collapse" }}>
      <thead>
        <tr
          style={{
            background: "rgba(255,255,255,0.02)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {headers.map((h) => (
            <th
              key={h}
              style={{
                padding: "12px 18px",
                textAlign: "left",
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#475569",
                whiteSpace: "nowrap",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

// ─── Card wrapper ─────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 22,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

const CardHeader = ({ icon: Icon, iconColor, title, sub, right }) => (
  <div
    style={{
      padding: "20px 24px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{ background: `${iconColor}18`, borderRadius: 12, padding: 10 }}
      >
        <Icon size={18} color={iconColor} />
      </div>
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h2>
        {sub && (
          <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{sub}</p>
        )}
      </div>
    </div>
    {right}
  </div>
);

// ─── Range Label Helper ───────────────────────────────────────────────────────
const rangeLabel = (rangeValue) => {
  return DATE_RANGES.find((r) => r.value === rangeValue)?.label || "7 Days";
};

// ══════════════════════════════════════════════════════════════════════════════
// 1. ENROLLMENTS DETAIL PAGE
// ══════════════════════════════════════════════════════════════════════════════
export const EnrollmentsDetailPage = ({ onBack }) => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dateRange, setDateRange] = useState("7d");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sRes, bRes] = await Promise.all([
        fetch(`${API_BASE}/api/booking/stats`),
        fetch(`${API_BASE}/api/booking?limit=200&page=1`),
      ]);
      const [sJson, bJson] = await Promise.all([sRes.json(), bRes.json()]);
      if (!sJson.success) throw new Error(sJson.message);
      setStats(sJson.stats);
      if (bJson.success) setBookings(bJson.bookings || []);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Apply date range filter to bookings ──
  const rangedBookings = filterByRange(bookings, dateRange);

  // KPIs derived from filtered bookings
  const totalInRange = rangedBookings.length;

  // Course aggregation from filtered bookings
  const courseCounts = rangedBookings.reduce((acc, b) => {
    if (b.courseName) {
      acc[b.courseName] = acc[b.courseName] || { count: 0, revenue: 0 };
      acc[b.courseName].count++;
      acc[b.courseName].revenue += Number(b.price || 0);
    }
    return acc;
  }, {});
  const rangedTopCourses = Object.entries(courseCounts)
    .map(([courseName, d]) => ({ courseName, ...d }))
    .sort((a, b) => b.count - a.count);

  // Daily bar chart — bucket by day within range
  const [rangeStart] = getRangeDates(dateRange);
  const rangeDays = DATE_RANGES.find((r) => r.value === dateRange)?.days || 7;
  const dayBuckets = Array.from({ length: Math.min(rangeDays, 30) }, (_, i) => {
    const d = new Date(rangeStart);
    d.setDate(
      d.getDate() + Math.floor((i * rangeDays) / Math.min(rangeDays, 30)),
    );
    return d;
  });

  // Simpler: group by date string for the visible bar chart
  const dailyMap = rangedBookings.reduce((acc, b) => {
    const key = new Date(b.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // For the weekly bar — use stats?.weeklyData if range is 7d, else derive from filtered
  const weekBarData =
    dateRange === "7d"
      ? (stats?.weeklyData || []).map((d) => ({
          label: new Date(d.date).toLocaleDateString("en-IN", {
            weekday: "short",
          }),
          value: d.count,
        }))
      : Object.entries(dailyMap)
          .slice(-14)
          .map(([label, value]) => ({ label, value }));

  // Course bar
  const courseBarData = rangedTopCourses
    .slice(0, 7)
    .map((c) => ({ label: c.courseName.slice(0, 10), value: c.count }));

  const maxCount = rangedTopCourses[0]?.count || 1;
  const barColors = [
    "#06b6d4",
    "#818cf8",
    "#f59e0b",
    "#10b981",
    "#f472b6",
    "#34d399",
  ];

  // Revenue in range
  const rangedRevenue = rangedBookings
    .filter((b) => b.paymentStatus === "Paid")
    .reduce((s, b) => s + Number(b.price || 0), 0);

  // Filtered table
  const filtered = rangedBookings.filter(
    (b) =>
      !search ||
      b.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      b.courseName?.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const orderColor = {
    Confirmed: "#06b6d4",
    Pending: "#f59e0b",
    Cancelled: "#ef4444",
  };
  const payColor = {
    Paid: "#10b981",
    Unpaid: "#ef4444",
    Pending: "#f59e0b",
    Refunded: "#818cf8",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070B14",
        color: "white",
        fontFamily: "'DM Sans','Outfit',system-ui,sans-serif",
        position: "relative",
      }}
    >
      <AmbientBG color1="rgba(6,182,212,0.07)" color2="rgba(99,102,241,0.06)" />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1300,
          margin: "0 auto",
          padding: "32px 28px",
        }}
      >
        <PageHeader
          onBack={onBack}
          title="Total Enrollments"
          loading={loading}
          onRefresh={load}
          lastUpdated={lastUpdated}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          accentColor="#06b6d4"
        />

        {error && (
          <div
            style={{
              marginBottom: 20,
              borderRadius: 14,
              border: "1px solid rgba(239,68,68,0.2)",
              background: "rgba(239,68,68,0.08)",
              padding: "12px 18px",
              color: "#fca5a5",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* KPIs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <KpiChip
            label={`Enrollments (${rangeLabel(dateRange)})`}
            value={loading ? "—" : totalInRange.toLocaleString("en-IN")}
            sub={`All time: ${stats?.totalBookings ?? "—"}`}
            color="#06b6d4"
            icon={Users}
          />
          <KpiChip
            label="Revenue in Range"
            value={loading ? "—" : fmtCurrency(rangedRevenue)}
            sub="Paid orders only"
            color="#10b981"
            icon={TrendingUp}
          />
          <KpiChip
            label="Top Course"
            value={loading ? "—" : (rangedTopCourses[0]?.count ?? 0)}
            sub={rangedTopCourses[0]?.courseName?.slice(0, 22) || "—"}
            color="#f59e0b"
            icon={Crown}
          />
          <KpiChip
            label="Unique Courses"
            value={loading ? "—" : rangedTopCourses.length}
            sub={`in last ${rangeLabel(dateRange)}`}
            color="#818cf8"
            icon={BookOpen}
          />
        </div>

        {/* Charts row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <Card>
            <CardHeader
              icon={Activity}
              iconColor="#06b6d4"
              title="Daily Enrollments"
              sub={`Last ${rangeLabel(dateRange)}`}
            />
            <div style={{ padding: "20px 24px" }}>
              {loading ? (
                <div
                  style={{
                    height: 140,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Spinner color="#06b6d4" />
                </div>
              ) : (
                <BarSVG data={weekBarData} color="#06b6d4" />
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              icon={BarChart3}
              iconColor="#818cf8"
              title="Enrollments by Course"
              sub={`Top courses — ${rangeLabel(dateRange)}`}
            />
            <div style={{ padding: "20px 24px" }}>
              {loading ? (
                <div
                  style={{
                    height: 140,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Spinner color="#818cf8" />
                </div>
              ) : (
                <BarSVG data={courseBarData} color="#818cf8" />
              )}
            </div>
          </Card>
        </div>

        {/* Top courses breakdown */}
        <Card style={{ marginBottom: 20 }}>
          <CardHeader
            icon={Crown}
            iconColor="#f59e0b"
            title="Course Enrollment Breakdown"
            sub={`${rangedTopCourses.length} courses — ${rangeLabel(dateRange)}`}
          />
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {rangedTopCourses.map((c, i) => (
                <div key={i}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: i < 3 ? 15 : 11,
                          flexShrink: 0,
                          color: i >= 3 ? "#475569" : undefined,
                        }}
                      >
                        {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#e2e8f0",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 260,
                        }}
                      >
                        {c.courseName}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 14,
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: "#10b981",
                          fontWeight: 600,
                        }}
                      >
                        {fmtCurrency(c.revenue)}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: barColors[i] || "#475569",
                        }}
                      >
                        {c.count} enrolled
                      </span>
                    </div>
                  </div>
                  <PBar
                    value={c.count}
                    max={maxCount}
                    color={barColors[i] || "#475569"}
                  />
                </div>
              ))}
              {!loading && rangedTopCourses.length === 0 && (
                <p
                  style={{
                    color: "#475569",
                    fontSize: 13,
                    textAlign: "center",
                    padding: "16px 0",
                  }}
                >
                  No enrollment data for this period
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* All bookings table */}
        <Card>
          <CardHeader
            icon={Users}
            iconColor="#06b6d4"
            title={`All Enrollments — ${rangeLabel(dateRange)}`}
            sub={`${filtered.length} records`}
            right={
              <div style={{ position: "relative" }}>
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#475569",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search student, course…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "7px 12px 7px 30px",
                    color: "white",
                    fontSize: 12,
                    outline: "none",
                    width: 200,
                  }}
                />
              </div>
            }
          />
          <TableShell
            headers={[
              "Student",
              "Course",
              "Instructor",
              "Validity",
              "Order",
              "Payment",
              "Date",
            ]}
          >
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: "#475569",
                  }}
                >
                  <Spinner color="#06b6d4" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "36px 0",
                    color: "#475569",
                    fontSize: 13,
                  }}
                >
                  No results
                </td>
              </tr>
            ) : (
              filtered.slice(0, 50).map((b, i) => (
                <tr
                  key={b._id || i}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(6,182,212,0.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ padding: "13px 18px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 9 }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg,#06b6d4,#818cf8)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {(b.studentName || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#f1f5f9",
                            margin: 0,
                          }}
                        >
                          {b.studentName || "Unknown"}
                        </p>
                        <p
                          style={{ fontSize: 11, color: "#475569", margin: 0 }}
                        >
                          {b.email || "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#94a3b8",
                        maxWidth: 150,
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {b.courseName || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      {b.teacherName || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <ValidityBadge validity={b.validity} />
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <StatusPill
                      label={b.orderStatus}
                      color={orderColor[b.orderStatus] || "#475569"}
                    />
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <StatusPill
                      label={b.paymentStatus}
                      color={payColor[b.paymentStatus] || "#475569"}
                    />
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#64748b",
                        fontFamily: "monospace",
                      }}
                    >
                      {fmtDate(b.createdAt)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </TableShell>
          {!loading && filtered.length > 50 && (
            <div
              style={{
                padding: "12px 24px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                fontSize: 12,
                color: "#475569",
              }}
            >
              Showing 50 of {filtered.length} results
            </div>
          )}
        </Card>
      </div>
      <GlobalStyles />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 2. LAST 7 DAYS DETAIL PAGE
// ══════════════════════════════════════════════════════════════════════════════
export const WeeklyDetailPage = ({ onBack }) => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dateRange, setDateRange] = useState("7d");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sRes, bRes] = await Promise.all([
        fetch(`${API_BASE}/api/booking/stats`),
        fetch(`${API_BASE}/api/booking?limit=200&page=1`),
      ]);
      const [sJson, bJson] = await Promise.all([sRes.json(), bRes.json()]);
      if (!sJson.success) throw new Error(sJson.message);
      setStats(sJson.stats);
      if (bJson.success) setBookings(bJson.bookings || []);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Filter bookings by selected range ──
  const rangedBookings = filterByRange(bookings, dateRange);
  const [rangeStart] = getRangeDates(dateRange);
  const rangeDays = DATE_RANGES.find((r) => r.value === dateRange)?.days || 7;

  // Compare to previous period
  const prevStart = new Date(rangeStart);
  prevStart.setDate(prevStart.getDate() - rangeDays);
  const prevBookings = bookings.filter(
    (b) =>
      new Date(b.createdAt) >= prevStart && new Date(b.createdAt) < rangeStart,
  );

  const currentCount = rangedBookings.length;
  const prevCount = prevBookings.length;
  const changePct =
    prevCount === 0
      ? currentCount > 0
        ? 100
        : 0
      : Math.round(((currentCount - prevCount) / prevCount) * 100);

  // Revenue in range
  const rangedRevenue = rangedBookings
    .filter((b) => b.paymentStatus === "Paid")
    .reduce((s, b) => s + Number(b.price || 0), 0);

  const avgPerDay = currentCount ? Math.round(currentCount / rangeDays) : 0;

  // Group by day for bar chart (last N days, bucket them)
  const dailyEnrollMap = rangedBookings.reduce((acc, b) => {
    const key = new Date(b.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const dailyRevenueMap = rangedBookings
    .filter((b) => b.paymentStatus === "Paid")
    .reduce((acc, b) => {
      const key = new Date(b.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      acc[key] = (acc[key] || 0) + Number(b.price || 0);
      return acc;
    }, {});

  // For 7d use the richer stats?.weeklyData, for other ranges use derived
  const enrollBarData =
    dateRange === "7d"
      ? (stats?.weeklyData || []).map((d) => ({
          label: new Date(d.date).toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
          }),
          value: d.count,
        }))
      : Object.entries(dailyEnrollMap).map(([label, value]) => ({
          label,
          value,
        }));

  const revenueBarData =
    dateRange === "7d"
      ? (stats?.weeklyRevenue || []).map((d) => ({
          label: new Date(d.date).toLocaleDateString("en-IN", {
            weekday: "short",
          }),
          value: d.total,
        }))
      : Object.entries(dailyRevenueMap).map(([label, value]) => ({
          label,
          value,
        }));

  // Day-by-day breakdown table
  const breakdownRows =
    dateRange === "7d"
      ? (stats?.weeklyData || []).map((d, i) => ({
          dateStr: new Date(d.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          }),
          dayStr: new Date(d.date).toLocaleDateString("en-IN", {
            weekday: "long",
          }),
          count: d.count,
          rev: stats?.weeklyRevenue?.[i]?.total || 0,
        }))
      : Object.entries(dailyEnrollMap).map(([key]) => ({
          dateStr: key,
          dayStr: "",
          count: dailyEnrollMap[key] || 0,
          rev: dailyRevenueMap[key] || 0,
        }));

  const maxDayCount = Math.max(...breakdownRows.map((r) => r.count), 1);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070B14",
        color: "white",
        fontFamily: "'DM Sans','Outfit',system-ui,sans-serif",
        position: "relative",
      }}
    >
      <AmbientBG
        color1="rgba(245,158,11,0.07)"
        color2="rgba(16,185,129,0.05)"
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1300,
          margin: "0 auto",
          padding: "32px 28px",
        }}
      >
        <PageHeader
          onBack={onBack}
          title={`Last ${rangeLabel(dateRange)}`}
          loading={loading}
          onRefresh={load}
          lastUpdated={lastUpdated}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          accentColor="#f59e0b"
        />

        {error && (
          <div
            style={{
              marginBottom: 20,
              borderRadius: 14,
              border: "1px solid rgba(239,68,68,0.2)",
              background: "rgba(239,68,68,0.08)",
              padding: "12px 18px",
              color: "#fca5a5",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* KPIs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <KpiChip
            label={`Enrollments (${rangeLabel(dateRange)})`}
            value={loading ? "—" : currentCount}
            sub={`Prev period: ${prevCount}`}
            color="#f59e0b"
            icon={Zap}
          />
          <KpiChip
            label="Period Change"
            value={loading ? "—" : `${changePct >= 0 ? "+" : ""}${changePct}%`}
            sub={`vs previous ${rangeLabel(dateRange)}`}
            color={changePct >= 0 ? "#10b981" : "#ef4444"}
            icon={changePct >= 0 ? TrendingUp : ArrowDownRight}
          />
          <KpiChip
            label="Revenue"
            value={loading ? "—" : fmtCurrency(rangedRevenue)}
            sub="Paid orders only"
            color="#10b981"
            icon={Activity}
          />
          <KpiChip
            label="Daily Average"
            value={loading ? "—" : avgPerDay}
            sub="enrollments/day"
            color="#818cf8"
            icon={CalendarDays}
          />
        </div>

        {/* Charts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <Card>
            <CardHeader
              icon={BarChart3}
              iconColor="#f59e0b"
              title="Enrollment Count"
              sub={`Last ${rangeLabel(dateRange)}`}
            />
            <div style={{ padding: "20px 24px" }}>
              {loading ? (
                <div
                  style={{
                    height: 140,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Spinner color="#f59e0b" />
                </div>
              ) : (
                <BarSVG data={enrollBarData} color="#f59e0b" />
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              icon={Activity}
              iconColor="#10b981"
              title="Revenue"
              sub={`Last ${rangeLabel(dateRange)}`}
            />
            <div style={{ padding: "20px 24px" }}>
              {loading ? (
                <div
                  style={{
                    height: 140,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Spinner color="#10b981" />
                </div>
              ) : (
                <BarSVG
                  data={revenueBarData}
                  color="#10b981"
                  valueFormatter={fmtCurrency}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Day-by-day breakdown */}
        <Card style={{ marginBottom: 20 }}>
          <CardHeader
            icon={CalendarDays}
            iconColor="#f59e0b"
            title="Day-by-Day Breakdown"
            sub={`Enrollments + revenue — ${rangeLabel(dateRange)}`}
          />
          <TableShell
            headers={["Date", "Day", "Enrollments", "Revenue", "Trend"]}
          >
            {breakdownRows.map((row, i) => {
              const pct = ((row.count / maxDayCount) * 100).toFixed(0);
              return (
                <tr
                  key={i}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(245,158,11,0.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: "13px 18px",
                      fontSize: 12,
                      color: "#94a3b8",
                      fontFamily: "monospace",
                    }}
                  >
                    {row.dateStr}
                  </td>
                  <td
                    style={{
                      padding: "13px 18px",
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    {row.dayStr}
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#f59e0b",
                      }}
                    >
                      {row.count}
                    </span>
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: row.rev > 0 ? "#10b981" : "#475569",
                      }}
                    >
                      {fmtCurrency(row.rev)}
                    </span>
                  </td>
                  <td style={{ padding: "13px 18px", minWidth: 120 }}>
                    <div
                      style={{
                        height: 5,
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: 99,
                        overflow: "hidden",
                        width: 100,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: "#f59e0b",
                          borderRadius: 99,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </TableShell>
        </Card>

        {/* Recent enrollments */}
        <Card>
          <CardHeader
            icon={Zap}
            iconColor="#f59e0b"
            title={`Recent Enrollments — ${rangeLabel(dateRange)}`}
            sub={`${rangedBookings.length} enrollments`}
          />
          <TableShell
            headers={["Student", "Course", "Amount", "Payment", "Date"]}
          >
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    padding: "36px 0",
                    color: "#475569",
                  }}
                >
                  <Spinner color="#f59e0b" />
                </td>
              </tr>
            ) : rangedBookings.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    padding: "36px 0",
                    color: "#475569",
                    fontSize: 13,
                  }}
                >
                  No enrollments in this period
                </td>
              </tr>
            ) : (
              rangedBookings.slice(0, 30).map((b, i) => (
                <tr
                  key={b._id || i}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(245,158,11,0.03)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ padding: "13px 18px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg,#f59e0b,#f472b6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {(b.studentName || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#f1f5f9",
                            margin: 0,
                          }}
                        >
                          {b.studentName || "Unknown"}
                        </p>
                        <p
                          style={{ fontSize: 10, color: "#475569", margin: 0 }}
                        >
                          {b.email || "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#94a3b8",
                        maxWidth: 160,
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {b.courseName || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: b.price > 0 ? "#10b981" : "#06b6d4",
                      }}
                    >
                      {b.price > 0 ? `₹${b.price}` : "Free"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <StatusPill
                      label={b.paymentStatus}
                      color={
                        b.paymentStatus === "Paid"
                          ? "#10b981"
                          : b.paymentStatus === "Pending"
                            ? "#f59e0b"
                            : "#ef4444"
                      }
                    />
                  </td>
                  <td style={{ padding: "13px 18px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#64748b",
                        fontFamily: "monospace",
                      }}
                    >
                      {fmtDate(b.createdAt)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </TableShell>
        </Card>
      </div>
      <GlobalStyles />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 3. EXPIRED ACCESS DETAIL PAGE
// ══════════════════════════════════════════════════════════════════════════════
export const ExpiredDetailPage = ({ onBack }) => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dateRange, setDateRange] = useState("7d");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sRes, bRes] = await Promise.all([
        fetch(`${API_BASE}/api/booking/stats`),
        fetch(`${API_BASE}/api/booking?limit=200&page=1`),
      ]);
      const [sJson, bJson] = await Promise.all([sRes.json(), bRes.json()]);
      if (!sJson.success) throw new Error(sJson.message);
      setStats(sJson.stats);
      if (bJson.success) setBookings(bJson.bookings || []);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const [rangeStart] = getRangeDates(dateRange);
  const rangeDays = DATE_RANGES.find((r) => r.value === dateRange)?.days || 7;

  // Expired: expiresAt is in the past, within range window (expired recently)
  // For "expired within period" we check expiresAt >= rangeStart
  const expiredBookings = bookings.filter(
    (b) =>
      b.paymentStatus === "Paid" &&
      b.validity !== "lifetime" &&
      b.expiresAt &&
      new Date(b.expiresAt) < now &&
      new Date(b.expiresAt) >= rangeStart,
  );

  // Expiring soon changes with range: "will expire within rangeDays days"
  const soonEnd = new Date();
  soonEnd.setDate(soonEnd.getDate() + rangeDays);
  const expiringSoon = bookings.filter(
    (b) =>
      b.paymentStatus === "Paid" &&
      b.validity !== "lifetime" &&
      b.expiresAt &&
      new Date(b.expiresAt) >= now &&
      new Date(b.expiresAt) <= soonEnd,
  );

  const validityBreakdown = stats?.validityBreakdown ?? [];
  const lifetimeCount =
    validityBreakdown.find((v) => v._id === "lifetime")?.count || 0;
  const yearCount =
    validityBreakdown.find((v) => v._id === "1year")?.count || 0;
  const twoYearCount =
    validityBreakdown.find((v) => v._id === "2year")?.count || 0;

  const daysUntil = (d) => {
    const diff = new Date(d) - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredExpired = expiredBookings.filter(
    (b) =>
      !search ||
      b.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      b.courseName?.toLowerCase().includes(search.toLowerCase()),
  );

  const vColors = {
    lifetime: "#818cf8",
    "1year": "#f59e0b",
    "2year": "#06b6d4",
  };
  const vTotal = validityBreakdown.reduce((s, v) => s + (v.count || 0), 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#070B14",
        color: "white",
        fontFamily: "'DM Sans','Outfit',system-ui,sans-serif",
        position: "relative",
      }}
    >
      <AmbientBG color1="rgba(239,68,68,0.07)" color2="rgba(245,158,11,0.05)" />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1300,
          margin: "0 auto",
          padding: "32px 28px",
        }}
      >
        <PageHeader
          onBack={onBack}
          title="Expired Access"
          loading={loading}
          onRefresh={load}
          lastUpdated={lastUpdated}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          accentColor="#ef4444"
        />

        {error && (
          <div
            style={{
              marginBottom: 20,
              borderRadius: 14,
              border: "1px solid rgba(239,68,68,0.2)",
              background: "rgba(239,68,68,0.08)",
              padding: "12px 18px",
              color: "#fca5a5",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* KPIs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <KpiChip
            label={`Expired (${rangeLabel(dateRange)})`}
            value={loading ? "—" : expiredBookings.length}
            sub={`Expired in last ${rangeLabel(dateRange)}`}
            color="#ef4444"
            icon={AlertTriangle}
          />
          <KpiChip
            label={`Expiring (next ${rangeLabel(dateRange)})`}
            value={loading ? "—" : expiringSoon.length}
            sub={`Within next ${rangeLabel(dateRange)}`}
            color="#f59e0b"
            icon={Clock}
          />
          <KpiChip
            label="Lifetime Access"
            value={loading ? "—" : lifetimeCount}
            sub="Never expires"
            color="#818cf8"
            icon={Infinity}
          />
          <KpiChip
            label="Active Limited"
            value={
              loading
                ? "—"
                : yearCount + twoYearCount - (stats?.expiredCount ?? 0)
            }
            sub="1yr + 2yr active"
            color="#10b981"
            icon={ShieldCheck}
          />
        </div>

        {/* Validity breakdown + expiring soon */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {/* Validity split */}
          <Card>
            <CardHeader
              icon={Filter}
              iconColor="#818cf8"
              title="Validity Distribution"
              sub="All paid enrollments"
            />
            <div style={{ padding: "22px 24px" }}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {[
                  { id: "lifetime", label: "Lifetime", count: lifetimeCount },
                  { id: "1year", label: "1 Year", count: yearCount },
                  { id: "2year", label: "2 Years", count: twoYearCount },
                ].map((item) => (
                  <div key={item.id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
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
                            background: vColors[item.id],
                            display: "block",
                          }}
                        />
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>
                          {item.label}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "white",
                          }}
                        >
                          {item.count}
                        </span>
                        <span style={{ fontSize: 11, color: "#475569" }}>
                          {vTotal
                            ? ((item.count / vTotal) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                    <PBar
                      value={item.count}
                      max={vTotal || 1}
                      color={vColors[item.id]}
                    />
                  </div>
                ))}
                {/* Expired highlight */}
                <div
                  style={{
                    marginTop: 4,
                    padding: "14px 16px",
                    background: "rgba(239,68,68,0.07)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <AlertTriangle size={14} color="#ef4444" />
                    <span style={{ fontSize: 13, color: "#fca5a5" }}>
                      Expired in {rangeLabel(dateRange)}
                    </span>
                  </div>
                  <span
                    style={{ fontSize: 15, fontWeight: 700, color: "#ef4444" }}
                  >
                    {expiredBookings.length}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Expiring soon */}
          <Card>
            <CardHeader
              icon={Clock}
              iconColor="#f59e0b"
              title={`Expiring in Next ${rangeLabel(dateRange)}`}
              sub="Action needed"
              right={
                <span
                  style={{
                    fontSize: 11,
                    color: "#f59e0b",
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    borderRadius: 8,
                    padding: "4px 10px",
                    fontWeight: 600,
                  }}
                >
                  {expiringSoon.length} students
                </span>
              }
            />
            <div
              style={{ maxHeight: 280, overflowY: "auto", padding: "12px 0" }}
            >
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: 40,
                  }}
                >
                  <Spinner color="#f59e0b" />
                </div>
              ) : expiringSoon.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "#475569",
                    fontSize: 13,
                    padding: "24px 0",
                  }}
                >
                  No upcoming expirations 🎉
                </p>
              ) : (
                expiringSoon.map((b, i) => {
                  const days = daysUntil(b.expiresAt);
                  const urgent = days <= 7;
                  return (
                    <div
                      key={b._id || i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 22px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(245,158,11,0.04)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#f1f5f9",
                            margin: 0,
                          }}
                        >
                          {b.studentName || "Unknown"}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                            margin: "2px 0 0",
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {b.courseName}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: urgent ? "#ef4444" : "#f59e0b",
                          }}
                        >
                          {days}d left
                        </span>
                        <p
                          style={{
                            fontSize: 10,
                            color: "#475569",
                            margin: "2px 0 0",
                          }}
                        >
                          {fmtDate(b.expiresAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Expired bookings table */}
        <Card>
          <CardHeader
            icon={AlertTriangle}
            iconColor="#ef4444"
            title={`Expired Enrollments — ${rangeLabel(dateRange)}`}
            sub={`${filteredExpired.length} expired`}
            right={
              <div style={{ position: "relative" }}>
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#475569",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "7px 12px 7px 30px",
                    color: "white",
                    fontSize: 12,
                    outline: "none",
                    width: 180,
                  }}
                />
              </div>
            }
          />
          <TableShell
            headers={[
              "Student",
              "Course",
              "Validity",
              "Expired On",
              "Days Ago",
              "Amount",
            ]}
          >
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: "36px 0",
                    color: "#475569",
                  }}
                >
                  <Spinner color="#ef4444" />
                </td>
              </tr>
            ) : filteredExpired.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: "36px 0",
                    color: "#475569",
                    fontSize: 13,
                  }}
                >
                  {search
                    ? "No results for search"
                    : `No expired enrollments in last ${rangeLabel(dateRange)}`}
                </td>
              </tr>
            ) : (
              filteredExpired.map((b, i) => {
                const daysAgo = Math.abs(daysUntil(b.expiresAt));
                return (
                  <tr
                    key={b._id || i}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(239,68,68,0.03)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={{ padding: "13px 18px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg,#ef4444,#f59e0b)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {(b.studentName || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#f1f5f9",
                              margin: 0,
                            }}
                          >
                            {b.studentName || "Unknown"}
                          </p>
                          <p
                            style={{
                              fontSize: 10,
                              color: "#475569",
                              margin: 0,
                            }}
                          >
                            {b.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          maxWidth: 160,
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {b.courseName || "—"}
                      </span>
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <ValidityBadge validity={b.validity} />
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#ef4444",
                          fontFamily: "monospace",
                        }}
                      >
                        {fmtDate(b.expiresAt)}
                      </span>
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: daysAgo > 30 ? "#ef4444" : "#f59e0b",
                        }}
                      >
                        {daysAgo}d ago
                      </span>
                    </td>
                    <td style={{ padding: "13px 18px" }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#94a3b8",
                        }}
                      >
                        ₹{b.price || 0}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </TableShell>
          {!loading && (
            <div
              style={{
                padding: "12px 24px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
                fontSize: 12,
                color: "#475569",
              }}
            >
              <span>
                {filteredExpired.length} expired · {expiringSoon.length}{" "}
                expiring soon
              </span>
              <span>
                Lifetime (safe):{" "}
                <strong style={{ color: "#818cf8" }}>{lifetimeCount}</strong>
              </span>
            </div>
          )}
        </Card>
      </div>
      <GlobalStyles />
    </div>
  );
};

// ─── Shared Mini Components ───────────────────────────────────────────────────
const Spinner = ({ color = "#06b6d4" }) => (
  <div
    style={{
      width: 36,
      height: 36,
      borderRadius: "50%",
      border: `3px solid ${color}30`,
      borderTop: `3px solid ${color}`,
      animation: "spin 0.8s linear infinite",
      margin: "0 auto",
    }}
  />
);

const StatusPill = ({ label, color }) => (
  <span
    style={{
      fontSize: 11,
      fontWeight: 600,
      padding: "3px 9px",
      borderRadius: 8,
      background: `${color}15`,
      border: `1px solid ${color}28`,
      color,
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      whiteSpace: "nowrap",
    }}
  >
    <span
      style={{
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: color,
        display: "inline-block",
      }}
    />
    {label}
  </span>
);

const ValidityBadge = ({ validity }) => {
  const map = {
    lifetime: { label: "Lifetime", color: "#818cf8", icon: "∞" },
    "1year": { label: "1 Year", color: "#f59e0b", icon: "⏱" },
    "2year": { label: "2 Years", color: "#06b6d4", icon: "⏱" },
  };
  const cfg = map[validity] || {
    label: validity || "N/A",
    color: "#475569",
    icon: "?",
  };
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 8,
        background: `${cfg.color}15`,
        border: `1px solid ${cfg.color}28`,
        color: cfg.color,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
};

const GlobalStyles = () => (
  <style>{`
    @keyframes spin { to { transform: rotate(360deg) } }
    * { box-sizing: border-box }
    button:active { transform: scale(0.97) }
    input::placeholder { color: #475569 }
    ::-webkit-scrollbar { width: 4px; height: 4px }
    ::-webkit-scrollbar-track { background: transparent }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px }
  `}</style>
);
