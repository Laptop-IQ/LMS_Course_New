import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BadgeIndianRupee,
  Users,
  ShoppingCart,
  CalendarDays,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Crown,
  AlertTriangle,
  Sparkles,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

// ─── Period Config ─────────────────────────────────────────────────────────────
const PERIODS = [
  { id: "7d", label: "7 Days", days: 7 },
  { id: "1m", label: "1 Month", days: 30 },
  { id: "3m", label: "3 Months", days: 90 },
  { id: "1y", label: "1 Year", days: 365 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtCurrency = (n) => {
  const num = Number(n || 0);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString("en-IN")}`;
};

const fmtFull = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

// ─── Ambient Background ───────────────────────────────────────────────────────
const AmbientBG = () => (
  <div
    style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
  >
    <div
      style={{
        position: "absolute",
        top: -200,
        left: -200,
        width: 700,
        height: 700,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)",
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
          "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
      }}
    />
    <svg
      width="100%"
      height="100%"
      style={{ opacity: 0.08, position: "absolute", inset: 0 }}
    >
      <defs>
        <pattern
          id="dotsbg2"
          x="0"
          y="0"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="0.8" fill="#334155" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotsbg2)" />
    </svg>
  </div>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ color = "#10b981" }) => (
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

// ─── Animated Counter ─────────────────────────────────────────────────────────
const Counter = ({ target, prefix = "₹", duration = 1200 }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return (
    <span>
      {prefix}
      {val.toLocaleString("en-IN")}
    </span>
  );
};

// ─── Period Tabs ──────────────────────────────────────────────────────────────
const PeriodTabs = ({ active, onChange }) => (
  <div
    style={{
      display: "flex",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14,
      padding: 4,
      gap: 2,
    }}
  >
    {PERIODS.map((p) => {
      const isActive = active === p.id;
      return (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          style={{
            padding: "8px 16px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            border: "none",
            transition: "all 0.18s ease",
            background: isActive
              ? "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(6,182,212,0.15))"
              : "transparent",
            color: isActive ? "#34d399" : "#64748b",
            boxShadow: isActive ? "0 0 0 1px rgba(16,185,129,0.3)" : "none",
          }}
        >
          {p.label}
        </button>
      );
    })}
  </div>
);

// ─── SVG Line Chart ───────────────────────────────────────────────────────────
const LineChartSVG = ({ data = [], color = "#10b981" }) => {
  if (data.length < 2)
    return (
      <div
        style={{
          color: "#475569",
          fontSize: 13,
          textAlign: "center",
          padding: "40px 0",
        }}
      >
        No data for this period
      </div>
    );

  const W = 700,
    H = 220;
  const PAD = { top: 20, right: 20, bottom: 40, left: 70 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;
  const maxV = Math.max(...data.map((d) => d.value), 1);
  const pts = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * iW,
    y: PAD.top + (1 - d.value / maxV) * iH,
    ...d,
  }));

  const pathD = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaD = `${pathD} L${pts[pts.length - 1].x},${PAD.top + iH} L${pts[0].x},${PAD.top + iH} Z`;

  const yTicks = 5;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", overflow: "visible" }}
    >
      <defs>
        <linearGradient id="revGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
        <filter id="glow2">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const y = PAD.top + (i / yTicks) * iH;
        const val = maxV - (i / yTicks) * maxV;
        return (
          <g key={i}>
            <line
              x1={PAD.left}
              x2={PAD.left + iW}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={PAD.left - 8}
              y={y + 4}
              textAnchor="end"
              fill="#475569"
              fontSize="10"
              fontFamily="monospace"
            >
              {fmtCurrency(val)}
            </text>
          </g>
        );
      })}

      <path d={areaD} fill="url(#revGrad)" />
      <path
        d={pathD}
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow2)"
      />

      {pts.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r="5"
            fill={color}
            stroke="#070B14"
            strokeWidth="2"
          />
          <text
            x={p.x}
            y={H - 8}
            textAnchor="middle"
            fill="#475569"
            fontSize="10"
            fontFamily="monospace"
          >
            {p.label}
          </text>
          <title>
            {p.label}: {fmtFull(p.value)}
          </title>
        </g>
      ))}
    </svg>
  );
};

// ─── SVG Bar Chart (Period Comparison) ────────────────────────────────────────
const BarChartSVG = ({ data = [], color = "#10b981" }) => {
  if (!data.length) return null;
  const W = 700,
    H = 200;
  const PAD = { top: 16, right: 16, bottom: 36, left: 70 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;
  const maxV = Math.max(...data.map((d) => d.value), 1);
  const barW = (iW / data.length) * 0.5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        {data.map((d, i) => (
          <linearGradient key={i} id={`revBg${i}`} x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="0%"
              stopColor={i === 1 ? color : "#818cf8"}
              stopOpacity="0.9"
            />
            <stop
              offset="100%"
              stopColor={i === 1 ? color : "#818cf8"}
              stopOpacity="0.3"
            />
          </linearGradient>
        ))}
      </defs>

      {Array.from({ length: 4 }).map((_, i) => {
        const y = PAD.top + (i / 4) * iH;
        return (
          <line
            key={i}
            x1={PAD.left}
            x2={PAD.left + iW}
            y1={y}
            y2={y}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        );
      })}

      {data.map((d, i) => {
        const x = PAD.left + (i / data.length) * iW + (iW / data.length) * 0.25;
        const barH = Math.max((d.value / maxV) * iH, 4);
        const y = PAD.top + iH - barH;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill={`url(#revBg${i})`}
              rx="5"
              ry="5"
            />
            <text
              x={x + barW / 2}
              y={H - 8}
              textAnchor="middle"
              fill="#475569"
              fontSize="11"
              fontFamily="monospace"
            >
              {d.label}
            </text>
            <text
              x={x + barW / 2}
              y={y - 6}
              textAnchor="middle"
              fill={i === 1 ? color : "#818cf8"}
              fontSize="10"
              fontWeight="700"
            >
              {fmtCurrency(d.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── Donut Chart ──────────────────────────────────────────────────────────────
const DonutSVG = ({ segments = [], totalRevenue = 0, size = 160 }) => {
  const r = 60,
    cx = size / 2,
    cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;

  return (
    <svg width={size} height={size}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="18"
      />
      {segments.map((d, i) => {
        const pct = d.value / total;
        const dash = pct * circ;
        const el = (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth="18"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset * circ}
            strokeLinecap="butt"
            style={{ transition: "stroke-dasharray 1.2s ease" }}
          />
        );
        offset += pct;
        return el;
      })}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fill="white"
        fontSize="16"
        fontWeight="800"
      >
        {fmtCurrency(totalRevenue)}
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fill="#64748b"
        fontSize="9"
        fontFamily="monospace"
      >
        TOTAL REV
      </text>
    </svg>
  );
};

// ─── Stat Chip ────────────────────────────────────────────────────────────────
const StatChip = ({ label, value, sub, subColor, color, icon: Icon }) => (
  <div
    style={{
      background: `linear-gradient(135deg, ${color}18, ${color}06)`,
      border: `1px solid ${color}30`,
      borderRadius: 20,
      padding: "20px 22px",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: -16,
        right: -16,
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: `${color}10`,
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
          <p style={{ fontSize: 11, color: subColor || "#64748b", margin: 0 }}>
            {sub}
          </p>
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

// ─── Card ─────────────────────────────────────────────────────────────────────
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

// ── Derive chart buckets from raw bookings given a period ─────────────────────
function buildChartData(bookings, periodId) {
  const period = PERIODS.find((p) => p.id === periodId) || PERIODS[0];
  const now = new Date();
  const cutoff = new Date(now - period.days * 24 * 60 * 60 * 1000);

  const paid = bookings.filter(
    (b) =>
      b.paymentStatus === "Paid" &&
      b.price > 0 &&
      new Date(b.paidAt || b.createdAt) >= cutoff,
  );

  let buckets = [];

  if (period.days <= 7) {
    for (let i = period.days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      buckets.push({
        label: d.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
        }),
        from: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        to: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1),
        value: 0,
      });
    }
  } else if (period.days <= 31) {
    for (let i = period.days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const showLabel = i % 5 === 0 || i === 0;
      buckets.push({
        label: showLabel
          ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
          : "",
        from: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        to: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1),
        value: 0,
      });
    }
  } else if (period.days <= 92) {
    const weeks = Math.ceil(period.days / 7);
    for (let i = weeks - 1; i >= 0; i--) {
      const from = new Date(now - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const to = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
      buckets.push({
        label: from.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        from,
        to,
        value: 0,
      });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      buckets.push({
        label: d.toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        }),
        from: d,
        to: next,
        value: 0,
      });
    }
  }

  paid.forEach((b) => {
    const date = new Date(b.paidAt || b.createdAt);
    const bucket = buckets.find((bk) => date >= bk.from && date < bk.to);
    if (bucket) bucket.value += Number(b.price || 0);
  });

  return buckets.map(({ label, value }) => ({ label, value }));
}

// ── Filter bookings and compute KPIs for the selected period ──────────────────
function periodKPIs(bookings, periodId) {
  const period = PERIODS.find((p) => p.id === periodId) || PERIODS[0];
  const now = new Date();
  const cutoff = new Date(now - period.days * 24 * 60 * 60 * 1000);
  const prevCutoff = new Date(now - 2 * period.days * 24 * 60 * 60 * 1000);

  const inRange = (b) => {
    const d = new Date(b.paidAt || b.createdAt);
    return d >= cutoff && d <= now;
  };
  const inPrev = (b) => {
    const d = new Date(b.paidAt || b.createdAt);
    return d >= prevCutoff && d < cutoff;
  };

  const current = bookings.filter(
    (b) => b.paymentStatus === "Paid" && b.price > 0 && inRange(b),
  );
  const previous = bookings.filter(
    (b) => b.paymentStatus === "Paid" && b.price > 0 && inPrev(b),
  );

  const revenue = current.reduce((s, b) => s + Number(b.price || 0), 0);
  const prevRevenue = previous.reduce((s, b) => s + Number(b.price || 0), 0);
  const changePct =
    prevRevenue > 0
      ? (((revenue - prevRevenue) / prevRevenue) * 100).toFixed(1)
      : null;

  const paidCount = current.length;
  const freeCount = bookings.filter((b) => b.price === 0 && inRange(b)).length;
  const avgOrder = paidCount ? Math.round(revenue / paidCount) : 0;

  const courseMap = {};
  current.forEach((b) => {
    const key = b.courseName || "Unknown";
    if (!courseMap[key])
      courseMap[key] = { courseName: key, revenue: 0, count: 0 };
    courseMap[key].revenue += Number(b.price || 0);
    courseMap[key].count++;
  });
  const topCourses = Object.values(courseMap).sort(
    (a, b) => b.revenue - a.revenue,
  );

  return {
    revenue,
    prevRevenue,
    changePct,
    paidCount,
    freeCount,
    avgOrder,
    topCourses,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN — Revenue Detail Page
// ══════════════════════════════════════════════════════════════════════════════
const RevenueDetailPage = ({ onBack }) => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeChart, setActiveChart] = useState("line");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [period, setPeriod] = useState("7d");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sRes, bRes] = await Promise.all([
        fetch(`${API_BASE}/api/booking/stats`),
        fetch(`${API_BASE}/api/booking?limit=500&page=1`),
      ]);
      const [sJson, bJson] = await Promise.all([sRes.json(), bRes.json()]);
      if (!sJson.success) throw new Error(sJson.message || "Stats failed");
      setStats(sJson.stats);
      if (bJson.success) setBookings(bJson.bookings || []);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Derived data ────────────────────────────────────────────────────────────
  const totalRevenue = stats?.totalRevenue ?? 0;
  const validityBreakdown = stats?.validityBreakdown ?? [];

  const kpi = periodKPIs(bookings, period);
  const lineData = buildChartData(bookings, period);
  const barData = [
    { label: "Prev Period", value: kpi.prevRevenue },
    { label: "This Period", value: kpi.revenue },
  ];

  const validityColors = {
    lifetime: "#818cf8",
    "1year": "#f59e0b",
    "2year": "#06b6d4",
  };
  const validityLabels = {
    lifetime: "Lifetime",
    "1year": "1 Year",
    "2year": "2 Years",
  };
  const validitySegments = validityBreakdown.map((v) => ({
    label: validityLabels[v._id] || v._id,
    value: v.count || 0,
    color: validityColors[v._id] || "#475569",
  }));
  const vTotal = validitySegments.reduce((s, v) => s + v.value, 0) || 1;

  const sortedTopCourses = kpi.topCourses;
  const maxRevenue = sortedTopCourses[0]?.revenue || 1;
  const courseBarColors = [
    "#10b981",
    "#06b6d4",
    "#818cf8",
    "#f59e0b",
    "#f472b6",
    "#34d399",
  ];

  const cutoffDate = new Date(
    Date.now() - (PERIODS.find((p) => p.id === period)?.days || 7) * 86400000,
  );
  const paidBookings = bookings
    .filter(
      (b) =>
        b.paymentStatus === "Paid" &&
        b.price > 0 &&
        new Date(b.paidAt || b.createdAt) >= cutoffDate,
    )
    .slice(0, 8);

  const periodLabel = PERIODS.find((p) => p.id === period)?.label || "";

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
      <AmbientBG />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1300,
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
          {/* Left: back + title + period tabs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                width: "fit-content",
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

            <h1
              style={{
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: "-1px",
                margin: 0,
                lineHeight: 1,
              }}
            >
              Revenue{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#10b981,#06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Deep Dive
              </span>
            </h1>

            {/* Period tabs below title */}
            <PeriodTabs active={period} onChange={setPeriod} />
          </div>

          {/* Right: updated time + refresh */}
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
              onClick={load}
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
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Error */}
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

        {/* ── KPI ROW ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <StatChip
            label={`Revenue (${periodLabel})`}
            color="#10b981"
            icon={BadgeIndianRupee}
            value={loading ? "—" : fmtCurrency(kpi.revenue)}
            sub={
              kpi.changePct !== null
                ? `${Number(kpi.changePct) >= 0 ? "+" : ""}${kpi.changePct}% vs prev period`
                : "no previous data"
            }
            subColor={
              kpi.changePct !== null
                ? Number(kpi.changePct) >= 0
                  ? "#10b981"
                  : "#ef4444"
                : "#64748b"
            }
          />
          <StatChip
            label="Prev Period"
            color="#06b6d4"
            icon={CalendarDays}
            value={loading ? "—" : fmtCurrency(kpi.prevRevenue)}
            sub={`All-time: ${fmtCurrency(totalRevenue)}`}
          />
          <StatChip
            label="Avg Order Value"
            color="#818cf8"
            icon={Target}
            value={loading ? "—" : fmtCurrency(kpi.avgOrder)}
            sub={`${kpi.paidCount} paid orders`}
          />
          <StatChip
            label="Paid Enrollments"
            color="#f59e0b"
            icon={ShoppingCart}
            value={loading ? "—" : kpi.paidCount}
            sub={`${kpi.freeCount} free enrollments`}
          />
        </div>

        {/* ── MAIN CHART ── */}
        <Card style={{ marginBottom: 20 }}>
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
                style={{
                  background: "rgba(16,185,129,0.12)",
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <Activity size={18} color="#10b981" />
              </div>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                  Revenue Trend
                </h2>
                <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
                  Last {periodLabel} · real data
                </p>
              </div>
            </div>

            {/* Chart type toggle */}
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
              {[
                { id: "line", icon: LineChart, label: "Line" },
                { id: "bar", icon: BarChart3, label: "Bar" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveChart(id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 9,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    background:
                      activeChart === id
                        ? "rgba(16,185,129,0.2)"
                        : "transparent",
                    color: activeChart === id ? "#34d399" : "#64748b",
                  }}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: "24px 28px" }}>
            {loading ? (
              <div
                style={{
                  height: 180,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Spinner color="#10b981" />
              </div>
            ) : activeChart === "line" ? (
              <LineChartSVG data={lineData} color="#10b981" />
            ) : (
              <BarChartSVG data={barData} color="#10b981" />
            )}
          </div>
        </Card>

        {/* ── MIDDLE ROW: Donut + Top Courses ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.8fr",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {/* Validity Donut — all-time */}
          <Card>
            <CardHeader
              icon={PieChart}
              iconColor="#818cf8"
              title="Validity Split"
              sub="All-time enrollments"
            />
            <div style={{ padding: "22px 24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <DonutSVG
                  segments={
                    validitySegments.length
                      ? validitySegments
                      : [{ value: 1, color: "#1e293b" }]
                  }
                  totalRevenue={totalRevenue}
                  size={160}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {validitySegments.map((s) => (
                  <div
                    key={s.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "9px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: s.color,
                          display: "block",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>
                        {s.label}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", gap: 10, alignItems: "center" }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "white",
                        }}
                      >
                        {s.value}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#475569",
                          minWidth: 38,
                          textAlign: "right",
                        }}
                      >
                        {((s.value / vTotal) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Per-Course Revenue — period-scoped */}
          <Card>
            <CardHeader
              icon={Crown}
              iconColor="#f59e0b"
              title="Revenue by Course"
              sub={`${periodLabel} · sorted by revenue`}
            />
            <div style={{ padding: "22px 24px" }}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "24px 0",
                    }}
                  >
                    <Spinner color="#f59e0b" />
                  </div>
                ) : sortedTopCourses.length === 0 ? (
                  <p
                    style={{
                      color: "#475569",
                      fontSize: 13,
                      textAlign: "center",
                      padding: "20px 0",
                    }}
                  >
                    No revenue data for this period
                  </p>
                ) : (
                  sortedTopCourses.slice(0, 6).map((c, i) => {
                    const col = courseBarColors[i] || "#475569";
                    const pct = ((c.revenue / maxRevenue) * 100).toFixed(1);
                    return (
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
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#e2e8f0",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 200,
                              }}
                            >
                              {c.courseName}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              alignItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: col,
                              }}
                            >
                              {fmtCurrency(c.revenue)}
                            </span>
                            <span style={{ fontSize: 11, color: "#475569" }}>
                              {c.count} sales
                            </span>
                          </div>
                        </div>
                        <PBar value={c.revenue} max={maxRevenue} color={col} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* ── RECENT PAID TRANSACTIONS ── */}
        <Card>
          <CardHeader
            icon={Zap}
            iconColor="#06b6d4"
            title="Recent Paid Transactions"
            sub={`${periodLabel} · ${paidBookings.length} transactions`}
            right={
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
                {periodLabel}
              </span>
            }
          />

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 700,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  {[
                    "Student",
                    "Course",
                    "Amount",
                    "Method",
                    "Date",
                    "Status",
                  ].map((h) => (
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
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: "40px 0",
                        color: "#475569",
                      }}
                    >
                      <Spinner color="#06b6d4" />
                    </td>
                  </tr>
                ) : paidBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: "40px 0",
                        color: "#475569",
                        fontSize: 13,
                      }}
                    >
                      No paid transactions in this period
                    </td>
                  </tr>
                ) : (
                  paidBookings.map((b, i) => (
                    <tr
                      key={b._id || i}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(16,185,129,0.03)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Student */}
                      <td style={{ padding: "14px 18px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg,#06b6d4,#818cf8)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 13,
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
                              style={{
                                fontSize: 11,
                                color: "#475569",
                                margin: 0,
                              }}
                            >
                              {b.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td style={{ padding: "14px 18px" }}>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#94a3b8",
                            fontWeight: 500,
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

                      {/* Amount */}
                      <td style={{ padding: "14px 18px" }}>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#10b981",
                          }}
                        >
                          ₹{b.price}
                        </span>
                      </td>

                      {/* Method */}
                      <td style={{ padding: "14px 18px" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 10px",
                            borderRadius: 8,
                            background: "rgba(99,102,241,0.12)",
                            border: "1px solid rgba(99,102,241,0.2)",
                            color: "#a78bfa",
                          }}
                        >
                          {b.paymentMethod || "Online"}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: "14px 18px" }}>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#64748b",
                            fontFamily: "monospace",
                          }}
                        >
                          {fmtDate(b.paidAt || b.createdAt)}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 18px" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 10px",
                            borderRadius: 8,
                            background: "rgba(16,185,129,0.1)",
                            border: "1px solid rgba(16,185,129,0.2)",
                            color: "#34d399",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: "#10b981",
                              display: "inline-block",
                            }}
                          />
                          Paid
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && (
            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 12, color: "#475569" }}>
                Showing {paidBookings.length} paid transactions · {periodLabel}
              </span>
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  fontSize: 12,
                  color: "#64748b",
                }}
              >
                <span>
                  Paid orders:{" "}
                  <strong style={{ color: "#e2e8f0" }}>{kpi.paidCount}</strong>
                </span>
                <span>
                  Period revenue:{" "}
                  <strong style={{ color: "#10b981" }}>
                    {fmtCurrency(kpi.revenue)}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box }
        button:active { transform: scale(0.97) }
        ::-webkit-scrollbar { width: 4px; height: 4px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px }
      `}</style>
    </div>
  );
};

export default RevenueDetailPage;
