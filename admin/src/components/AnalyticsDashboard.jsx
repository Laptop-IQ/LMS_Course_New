import React, { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Clock,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  RefreshCw,
  Globe,
  BarChart2,
  BookMarked,
  Crown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

const fmtCompact = (n) => {
  const num = Number(n || 0);
  if (num >= 10_000_000) return `${(num / 10_000_000).toFixed(1)}Cr`;
  if (num >= 100_000) return `${(num / 100_000).toFixed(1)}L`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
};

// ─────────────────────────────────────────────────────────────────────────────
// SPARKLINE
// ─────────────────────────────────────────────────────────────────────────────
const Sparkline = ({ data = [], color = "#06b6d4", height = 36 }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80,
    h = height;
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

// ─────────────────────────────────────────────────────────────────────────────
// MINI BAR CHART
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE BADGE
// ─────────────────────────────────────────────────────────────────────────────
const ChangeBadge = ({ pct, suffix = "vs last period" }) => {
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
      {pct}% {suffix}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DONUT CHART — Free vs Paid
// ─────────────────────────────────────────────────────────────────────────────
const DonutChart = ({ data, centerLabel, centerSub, size = 130 }) => {
  const r = 44;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="13"
      />
      {data.map((d, i) => {
        const pct = d.value / total;
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
            strokeWidth="13"
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
        y={cy - 5}
        textAnchor="middle"
        fill="white"
        fontSize="17"
        fontWeight="700"
      >
        {centerLabel}
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle" fill="#94a3b8" fontSize="9">
        {centerSub}
      </text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────────────────────────────────────
const KpiCard = ({
  icon,
  label,
  value,
  change,
  accent,
  sparkData,
  barData,
  barLabels,
  footer,
  onClick,
  loading,
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: `linear-gradient(135deg,${accent}1E,${accent}08)`,
        border: `1px solid ${hovered ? accent + "80" : accent + "33"}`,
        borderRadius: 20,
        padding: "22px 24px",
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transform: hovered && onClick ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered && onClick ? `0 16px 48px ${accent}30` : "none",
        transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
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
          background: `${accent}0F`,
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
            {label}
          </p>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 800,
              margin: "10px 0 4px",
              color: "white",
              letterSpacing: "-1px",
            }}
          >
            {loading ? "—" : value}
          </h2>
          <ChangeBadge pct={change} />
        </div>
        <div
          style={{ background: `${accent}26`, borderRadius: 14, padding: 12 }}
        >
          {icon}
        </div>
      </div>

      {sparkData && (
        <div style={{ marginTop: 14 }}>
          <Sparkline
            data={sparkData.length >= 2 ? sparkData : [0, 0]}
            color={accent}
          />
          <p style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>trend</p>
        </div>
      )}

      {barData && (
        <div style={{ marginTop: 12 }}>
          <MiniBarChart data={barData} color={accent} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 3,
            }}
          >
            {(barLabels || []).map((l, i) => (
              <span
                key={i}
                style={{
                  fontSize: 9,
                  color: "#475569",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {footer && onClick && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: `1px solid ${accent}1A`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 11, color: accent, fontWeight: 600 }}>
            {footer}
          </span>
          <ArrowUpRight size={14} color={accent} />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LINE CHART — Views & Watch Time
// ─────────────────────────────────────────────────────────────────────────────
const LineChart = ({ viewsData = [], watchData = [], labels = [] }) => {
  const W = 580;
  const H = 160;
  const PAD = { top: 10, right: 8, bottom: 28, left: 36 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;
  const n = Math.max(viewsData.length, 1);

  const maxV = Math.max(...viewsData, 1);
  const maxW = Math.max(...watchData, 1);

  const vPts = viewsData.map((v, i) => ({
    x: PAD.left + (i / (n - 1)) * iW,
    y: PAD.top + iH - (v / maxV) * iH,
  }));
  const wPts = watchData.map((v, i) => ({
    x: PAD.left + (i / (n - 1)) * iW,
    y: PAD.top + iH - (v / maxW) * iH,
  }));

  const toPath = (pts) =>
    pts.length < 2
      ? ""
      : `M${pts[0].x},${pts[0].y} ` +
        pts
          .slice(1)
          .map((p, i) => {
            const prev = pts[i];
            const cpx = (prev.x + p.x) / 2;
            return `C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
          })
          .join(" ");

  const gridLines = 4;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="vg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>

      {Array.from({ length: gridLines + 1 }, (_, i) => {
        const y = PAD.top + (i / gridLines) * iH;
        const val = Math.round(maxV - (i / gridLines) * maxV);
        return (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={y}
              x2={PAD.left + iW}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 6}
              y={y + 4}
              textAnchor="end"
              fill="#4b5563"
              fontSize="9"
            >
              {fmtCompact(val)}
            </text>
          </g>
        );
      })}

      {labels.map((l, i) => {
        const x = PAD.left + (i / (n - 1)) * iW;
        return (
          <text
            key={i}
            x={x}
            y={H - 6}
            textAnchor="middle"
            fill="#4b5563"
            fontSize="9"
          >
            {l}
          </text>
        );
      })}

      {vPts.length > 1 && (
        <path
          d={`${toPath(vPts)} L${vPts[vPts.length - 1].x},${PAD.top + iH} L${PAD.left},${PAD.top + iH} Z`}
          fill="url(#vg)"
        />
      )}
      {wPts.length > 1 && (
        <path
          d={toPath(wPts)}
          stroke="#60a5fa"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="5 3"
          strokeLinecap="round"
        />
      )}
      {vPts.length > 1 && (
        <path
          d={toPath(vPts)}
          stroke="#ef4444"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {vPts.length > 0 && (
        <circle
          cx={vPts[vPts.length - 1].x}
          cy={vPts[vPts.length - 1].y}
          r="4"
          fill="#ef4444"
          stroke="#111"
          strokeWidth="1.5"
        />
      )}
      {wPts.length > 0 && (
        <circle
          cx={wPts[wPts.length - 1].x}
          cy={wPts[wPts.length - 1].y}
          r="4"
          fill="#60a5fa"
          stroke="#111"
          strokeWidth="1.5"
        />
      )}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TRAFFIC SOURCES CARD — Free vs Paid (real data)
// ─────────────────────────────────────────────────────────────────────────────
const TrafficSourcesCard = ({ sources = [], loading }) => {
  const donutData = sources.map((s) => ({ value: s.value, color: s.color }));
  const total = sources.reduce((s, d) => s + (d.count || 0), 0);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: 24,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            background: "rgba(239,68,68,0.12)",
            borderRadius: 12,
            padding: 10,
          }}
        >
          <Globe size={18} color="#ef4444" />
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
            Traffic Sources
          </h3>
          <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
            Free &amp; Paid breakdown
          </p>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#475569",
            fontSize: 13,
          }}
        >
          Loading…
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <DonutChart
              data={
                donutData.length ? donutData : [{ value: 1, color: "#334155" }]
              }
              centerLabel={fmt(total)}
              centerSub="TOTAL"
              size={130}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: "auto",
            }}
          >
            {sources.map((s) => (
              <div
                key={s.name}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: s.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 12, color: "#94a3b8", flex: 1 }}>
                  {s.name}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>
                  {s.value}%
                </span>
                <span style={{ fontSize: 11, color: "#475569" }}>
                  ({fmt(s.count)})
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TIME FILTER → days helper
// ─────────────────────────────────────────────────────────────────────────────
const TIME_FILTERS = ["7 days", "28 days", "90 days", "1 year"];

const filterToDays = (f) => {
  switch (f) {
    case "7 days":
      return 7;
    case "28 days":
      return 28;
    case "90 days":
      return 90;
    case "1 year":
      return 365;
    default:
      return 28;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const AnalyticsDashboard = ({ onBack }) => {
  const [activeFilter, setActiveFilter] = useState("28 days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Data state
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Table state
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("views");
  const [sortDir, setSortDir] = useState("desc");
  const [activeTab, setActiveTab] = useState("all");

  // ── Fetch — re-runs whenever activeFilter changes ──────────────────────────
  const load = async (filter = activeFilter) => {
    try {
      setLoading(true);
      setError("");

      const days = filterToDays(filter);

      const [sRes, cRes, aRes] = await Promise.all([
        fetch(`${API_BASE}/api/booking/stats?days=${days}`),
        fetch(`${API_BASE}/api/course`),
        fetch(`${API_BASE}/api/analytics/overview?days=${days}`).catch(
          () => null,
        ),
      ]);

      const [sJson, cJson] = await Promise.all([sRes.json(), cRes.json()]);
      if (!sJson.success) throw new Error(sJson.message || "Stats failed");
      if (!cJson.success) throw new Error(cJson.message || "Courses failed");

      setStats(sJson.stats);

      const topLookup = {};
      (sJson.stats?.topCourses || []).forEach((t) => {
        topLookup[t.courseName] = {
          purchases: Number(t.count || 0),
          revenue: Number(t.revenue || 0),
        };
      });

      setCourses(
        (cJson.courses || []).map((c) => {
          const m = topLookup[c.name] || {};
          return {
            id: c._id,
            name: c.name || "Untitled",
            image: c.image || null,
            teacher: c.teacher || "Unknown",
            views: c.views || 0,
            purchases: m.purchases || 0,
            revenue: m.revenue || 0,
            price: c.price?.sale || c.price?.original || 0,
            priceLabel:
              c.price?.sale || c.price?.original
                ? `₹${(c.price.sale || c.price.original).toLocaleString("en-IN")}`
                : "Free",
            rating: c.rating || null,
          };
        }),
      );

      if (aRes?.ok) {
        const aJson = await aRes.json();
        if (aJson.success) setAnalytics(aJson.analytics);
        else setAnalytics(null); // clear stale analytics on failure
      } else {
        setAnalytics(null);
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever the time filter changes
  useEffect(() => {
    load(activeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const totalViews = useMemo(
    () => courses.reduce((s, c) => s + (c.views || 0), 0),
    [courses],
  );

  // ── VIEWS — real CourseView daily data ──────────────────────────────────
  const viewsSparkline = analytics?.views?.sparkline || [];
  const viewsChangePct = analytics?.views?.changePercent ?? null;

  // ── WATCH TIME — real StudyLog daily data ────────────────────────────────
  // FIX: Only pull from analytics.watchTime — never fall back to revenue fields
  const watchSparkline = analytics?.watchTime?.sparkline || [];
  const watchTotalHrs = analytics?.watchTime?.totalHrs ?? 0;
  const watchChangePct = analytics?.watchTime?.changePercent ?? null;

  // ── ENROLLMENT — real Booking data ───────────────────────────────────────
  const enrollBarData =
    analytics?.enrollment?.barData ||
    (stats?.weeklyData || []).map((d) => ({
      label: new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" }),
      value: d.count,
    }));
  const enrollLast7 =
    analytics?.enrollment?.last7Days ?? stats?.bookingsLast7Days ?? 0;
  const enrollChangePct =
    analytics?.enrollment?.changePercent ??
    stats?.bookingsChangePercent ??
    null;
  const enrollBarLabels = enrollBarData.map((d) => d.label);

  // ── TRAFFIC SOURCES ───────────────────────────────────────────────────────
  const trafficSources = analytics?.trafficSources || [
    { name: "Paid Views", value: 0, color: "#ef4444", count: 0 },
    { name: "Free Views", value: 0, color: "#f59e0b", count: 0 },
    { name: "Paid Enrollments", value: 0, color: "#10b981", count: 0 },
    { name: "Free Enrollments", value: 0, color: "#3b82f6", count: 0 },
  ];

  // ── REVENUE ───────────────────────────────────────────────────────────────
  const weeklyRevenue = (stats?.weeklyRevenue || []).map((d) => d.total);

  // ── CHART data ────────────────────────────────────────────────────────────
  const viewsChartData =
    analytics?.views?.weeklyData?.map((d) => d.value) ??
    (stats?.weeklyData || []).map((d) => d.count);

  const watchChartData =
    analytics?.watchTime?.weeklyData?.map((d) => d.value) ?? [];

  const chartLabels =
    analytics?.chartLabels ||
    (analytics?.views?.weeklyData || stats?.weeklyData || []).map((d) =>
      new Date(d.date).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      }),
    );

  // Top courses by views
  const topByViews = useMemo(
    () => [...courses].sort((a, b) => b.views - a.views).slice(0, 5),
    [courses],
  );

  // ── Table sort/filter ──────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    let list = [...courses];
    if (activeTab === "paid") list = list.filter((c) => c.price > 0);
    if (activeTab === "free") list = list.filter((c) => c.price === 0);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.teacher.toLowerCase().includes(q),
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
  }, [courses, search, sortKey, sortDir, activeTab]);

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

  // Handle filter pill click — update state (useEffect handles re-fetch)
  const handleFilterChange = (f) => {
    if (f !== activeFilter) setActiveFilter(f);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
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
              "radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 70%)",
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
              "radial-gradient(circle,rgba(239,68,68,0.07) 0%,transparent 70%)",
          }}
        />
        <svg
          width="100%"
          height="100%"
          style={{ opacity: 0.12, position: "absolute", inset: 0 }}
        >
          <defs>
            <pattern
              id="dots2"
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.8" fill="#334155" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots2)" />
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
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              AC
            </div>
            <div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: "-0.8px",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                Courses{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg,#ef4444,#f97316)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Analytics
                </span>
              </h1>
              <p style={{ marginTop: 6, fontSize: 13, color: "#64748b" }}>
                {fmt(courses.length)} courses · views, enrollments &amp; revenue
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
            {/* Time filter pills */}
            <div
              style={{
                display: "flex",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: 3,
                gap: 2,
              }}
            >
              {TIME_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    background:
                      activeFilter === f
                        ? "rgba(239,68,68,0.18)"
                        : "transparent",
                    color: activeFilter === f ? "#f87171" : "#64748b",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

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
              onClick={() => load(activeFilter)}
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
                  display: "inline-block",
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
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* Total Views */}
          <KpiCard
            label="Total Views"
            value={fmtCompact(totalViews)}
            change={viewsChangePct}
            accent="#ef4444"
            icon={<Eye size={22} color="#ef4444" />}
            sparkData={
              viewsSparkline.length >= 2
                ? viewsSparkline
                : viewsChartData.length >= 2
                  ? viewsChartData
                  : [0, 0]
            }
            loading={loading}
          />

          {/* Watch Time — FIX: value and change now come only from watchTime fields */}
          <KpiCard
            label="Watch Time (hrs)"
            value={fmtCompact(watchTotalHrs)}
            change={watchChangePct}
            accent="#06b6d4"
            icon={<Clock size={22} color="#06b6d4" />}
            sparkData={watchSparkline.length >= 2 ? watchSparkline : [0, 0]}
            loading={loading}
          />

          {/* New Enrolled */}
          <KpiCard
            label="New Enrolled"
            value={`+${fmtCompact(enrollLast7)}`}
            change={enrollChangePct}
            accent="#8b5cf6"
            icon={<Users size={22} color="#8b5cf6" />}
            barData={
              enrollBarData.length
                ? enrollBarData
                : Array(7).fill({ label: "", value: 0 })
            }
            barLabels={enrollBarLabels}
            loading={loading}
          />

          <KpiCard
            label="Revenue"
            value={`₹${fmtCompact(stats?.totalRevenue ?? 0)}`}
            change={stats?.revenueChangePercent ?? null}
            accent="#10b981"
            icon={<TrendingUp size={22} color="#10b981" />}
            sparkData={weeklyRevenue.length >= 2 ? weeklyRevenue : [0, 0]}
            loading={loading}
          />
        </div>

        {/* ── CHARTS ROW ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {/* Line Chart */}
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
                marginBottom: 16,
              }}
            >
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                  Views &amp; Watch Time
                </h3>
                <p
                  style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0" }}
                >
                  Trend · {activeFilter}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  fontSize: 11,
                  color: "#94a3b8",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 12,
                      height: 2,
                      background: "#ef4444",
                      display: "inline-block",
                      borderRadius: 99,
                    }}
                  />{" "}
                  Views
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 12,
                      height: 2,
                      background: "#60a5fa",
                      display: "inline-block",
                      borderRadius: 99,
                    }}
                  />{" "}
                  Watch time
                </span>
              </div>
            </div>
            {viewsChartData.length > 0 ? (
              <LineChart
                viewsData={viewsChartData}
                watchData={watchChartData}
                labels={chartLabels}
              />
            ) : (
              <div
                style={{
                  height: 160,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#475569",
                  fontSize: 13,
                }}
              >
                {loading ? "Loading chart…" : "No data for this period"}
              </div>
            )}
          </div>

          <TrafficSourcesCard sources={trafficSources} loading={loading} />
        </div>

        {/* ── TOP COURSES BY VIEWS ── */}
        <div
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: 24,
            marginBottom: 24,
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
                background: "rgba(245,158,11,0.15)",
                borderRadius: 12,
                padding: 10,
              }}
            >
              <Crown size={18} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                Top Courses by Views
              </h3>
              <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
                Real view count per course
              </p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {topByViews.length > 0 ? (
              topByViews.map((c, i) => {
                const maxV = topByViews[0]?.views || 1;
                const barColors = [
                  "#f59e0b",
                  "#94a3b8",
                  "#cd7f32",
                  "#06b6d4",
                  "#818cf8",
                ];
                return (
                  <div
                    key={c.id}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.name}
                          style={{
                            width: 52,
                            height: 38,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 52,
                            height: 38,
                            borderRadius: 8,
                            background: "rgba(99,102,241,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <BookMarked size={16} color="#818cf8" />
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
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#e2e8f0",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 340,
                          }}
                        >
                          {c.name}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            flexShrink: 0,
                          }}
                        >
                          <Eye size={12} color="#94a3b8" />
                          <span
                            style={{
                              fontSize: 12,
                              color: "#94a3b8",
                              fontWeight: 600,
                            }}
                          >
                            {fmt(c.views)}
                          </span>
                        </div>
                      </div>
                      <ProgressBar
                        value={c.views}
                        max={maxV}
                        color={barColors[i] || "#ef4444"}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "#475569",
                  fontSize: 13,
                  padding: "20px 0",
                }}
              >
                {loading ? "Loading courses…" : "No view data yet"}
              </div>
            )}
          </div>
        </div>

        {/* ── COURSE PERFORMANCE TABLE ── */}
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
                  background: "rgba(239,68,68,0.12)",
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <BarChart2 size={18} color="#ef4444" />
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
                        activeTab === t ? "rgba(239,68,68,0.2)" : "transparent",
                      color: activeTab === t ? "#f87171" : "#64748b",
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
                  placeholder="Search courses…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
                minWidth: 820,
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
                    { label: "Course", key: "name", w: "34%" },
                    { label: "Views", key: "views" },
                    { label: "Price", key: "price" },
                    { label: "Purchases", key: "purchases" },
                    { label: "Revenue", key: "revenue" },
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
                        color: sortKey === col.key ? "#ef4444" : "#475569",
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
                  sorted.map((c, i) => (
                    <tr
                      key={c.id || i}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(239,68,68,0.03)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "14px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            {c.image ? (
                              <img
                                src={c.image}
                                alt={c.name}
                                style={{
                                  width: 52,
                                  height: 38,
                                  objectFit: "cover",
                                  borderRadius: 9,
                                  border: "1px solid rgba(255,255,255,0.08)",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 52,
                                  height: 38,
                                  borderRadius: 9,
                                  background: "rgba(99,102,241,0.2)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <BookMarked size={16} color="#818cf8" />
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
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#f1f5f9",
                                margin: 0,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 200,
                              }}
                            >
                              {c.name}
                            </p>
                            <p
                              style={{
                                fontSize: 11,
                                color: "#64748b",
                                margin: "2px 0 0",
                              }}
                            >
                              {c.teacher}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Eye size={14} color="#ef4444" />
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#e2e8f0",
                            }}
                          >
                            {fmt(c.views)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            background:
                              c.price === 0
                                ? "rgba(6,182,212,0.1)"
                                : "rgba(16,185,129,0.1)",
                            border: `1px solid ${c.price === 0 ? "rgba(6,182,212,0.2)" : "rgba(16,185,129,0.2)"}`,
                            color: c.price === 0 ? "#22d3ee" : "#34d399",
                            borderRadius: 8,
                            padding: "4px 10px",
                          }}
                        >
                          {c.priceLabel}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#e2e8f0",
                          }}
                        >
                          {fmt(c.purchases)}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: c.revenue > 0 ? "#10b981" : "#475569",
                          }}
                        >
                          ₹{fmtCompact(c.revenue)}
                        </span>
                      </td>
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
                    border: "3px solid rgba(239,68,68,0.2)",
                    borderTop: "3px solid #ef4444",
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
                    setSearch("");
                    setActiveTab("all");
                  }}
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 12,
                    padding: "10px 20px",
                    color: "#f87171",
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
                Showing {sorted.length} of {courses.length} courses
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
                  Total views:{" "}
                  <strong style={{ color: "#ef4444" }}>
                    {fmt(totalViews)}
                  </strong>
                </span>
                <span>
                  Total purchases:{" "}
                  <strong style={{ color: "#e2e8f0" }}>
                    {sorted.reduce((s, c) => s + c.purchases, 0)}
                  </strong>
                </span>
                <span>
                  Total revenue:{" "}
                  <strong style={{ color: "#10b981" }}>
                    ₹{fmtCompact(sorted.reduce((s, c) => s + c.revenue, 0))}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder { color: #475569; }
        button:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;
