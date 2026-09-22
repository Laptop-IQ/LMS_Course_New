import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const FILE_TYPES = {
  pdf: {
    label: "PDF",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    accent: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
  },
  video: {
    label: "Video",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    accent: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)",
  },
  image: {
    label: "Image",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    accent: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
  },
  default: {
    label: "File",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </svg>
    ),
    accent: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.2)",
  },
};

const getFileType = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("pdf")) return FILE_TYPES.pdf;
  if (t.includes("video")) return FILE_TYPES.video;
  if (t.includes("image")) return FILE_TYPES.image;
  return FILE_TYPES.default;
};

const DownloadIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ResourceRow = ({ r, onOpen, index }) => {
  const [hovered, setHovered] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const ft = getFileType(r.type);

  const handleClick = async () => {
    setDownloading(true);
    await new Promise((res) => setTimeout(res, 400));
    onOpen(r.url);
    setDownloading(false);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "14px 16px",
        borderRadius: "12px",
        border: hovered
          ? `1px solid ${ft.border}`
          : "1px solid rgba(255,255,255,0.07)",
        background: hovered ? ft.bg : "rgba(255,255,255,0.03)",
        cursor: "pointer",
        transition: "all 0.18s ease",
        outline: "none",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        animation: `fadeSlideIn 0.3s ease both`,
        animationDelay: `${index * 55}ms`,
        userSelect: "none",
      }}
    >
      {/* File type badge */}
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: ft.bg,
          border: `1px solid ${ft.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: ft.accent,
          flexShrink: 0,
          transition: "transform 0.18s ease",
          transform: hovered ? "scale(1.08)" : "scale(1)",
        }}
      >
        {ft.icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: hovered ? "#fff" : "rgba(255,255,255,0.85)",
            transition: "color 0.18s ease",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {r.title}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.35)",
            marginTop: "2px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              padding: "1px 7px",
              borderRadius: "20px",
              background: ft.bg,
              color: ft.accent,
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {ft.label}
          </span>
          {r.size && <span>{r.size}</span>}
        </div>
      </div>

      {/* Action */}
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          border: `1px solid ${hovered ? ft.border : "rgba(255,255,255,0.1)"}`,
          background: hovered ? ft.bg : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: hovered ? ft.accent : "rgba(255,255,255,0.3)",
          transition: "all 0.18s ease",
          flexShrink: 0,
        }}
      >
        {downloading ? (
          <div
            style={{
              width: "12px",
              height: "12px",
              border: `1.5px solid ${ft.accent}`,
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
          />
        ) : (
          <DownloadIcon />
        )}
      </div>
    </div>
  );
};

const SkeletonRow = ({ index }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "14px",
      padding: "14px 16px",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(255,255,255,0.02)",
      animation: `pulse 1.5s ease-in-out ${index * 0.15}s infinite`,
    }}
  >
    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.07)",
        flexShrink: 0,
      }}
    />
    <div style={{ flex: 1 }}>
      <div
        style={{
          height: "13px",
          borderRadius: "6px",
          background: "rgba(255,255,255,0.07)",
          width: `${55 + index * 12}%`,
        }}
      />
      <div
        style={{
          height: "10px",
          borderRadius: "6px",
          background: "rgba(255,255,255,0.04)",
          width: "30%",
          marginTop: "8px",
        }}
      />
    </div>
    <div
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        background: "rgba(255,255,255,0.05)",
        flexShrink: 0,
      }}
    />
  </div>
);

const FILTER_OPTIONS = ["All", "PDF", "Video", "Image", "File"];

const ResourceList = ({ courseId }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const API = import.meta.env.VITE_API_BASE?.replace(/\/$/, "");

  useEffect(() => {
    if (courseId) fetchResources();
  }, [courseId]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/api/resources/${courseId}`);
      setResources(res.data.resources || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load resources. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openFile = useCallback(
    (url) => {
      const fullUrl = url.startsWith("http") ? url : `${API}${url}`;
      window.open(fullUrl, "_blank");
    },
    [API],
  );

  const filtered = resources.filter((r) => {
    const matchesFilter =
      activeFilter === "All" || getFileType(r.type).label === activeFilter;
    const matchesSearch =
      !search || r.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = FILTER_OPTIONS.reduce((acc, f) => {
    acc[f] =
      f === "All"
        ? resources.length
        : resources.filter((r) => getFileType(r.type).label === f).length;
    return acc;
  }, {});

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-4px); }
          40%,80% { transform: translateX(4px); }
        }
        .resource-search::placeholder { color: rgba(255,255,255,0.25); }
        .resource-search:focus { outline: none; border-color: rgba(255,255,255,0.2) !important; }
        .filter-pill { cursor: pointer; border: none; background: none; }
        .filter-pill:focus-visible { outline: 2px solid rgba(255,255,255,0.4); outline-offset: 2px; border-radius: 20px; }
      `}</style>

      <div style={{ width: "100%", fontFamily: "inherit" }}>
        {/* Header */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "4px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "17px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.92)",
                letterSpacing: "-0.02em",
              }}
            >
              Course Resources
            </h2>
            {!loading && resources.length > 0 && (
              <span
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.35)",
                  background: "rgba(255,255,255,0.06)",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {resources.length} file{resources.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            Download or preview your learning materials
          </p>
        </div>

        {/* Search */}
        {!loading && resources.length > 0 && (
          <div style={{ position: "relative", marginBottom: "14px" }}>
            <div
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.25)",
                pointerEvents: "none",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              className="resource-search"
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "9px 12px 9px 36px",
                fontSize: "13px",
                color: "rgba(255,255,255,0.85)",
                transition: "border-color 0.15s ease",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Filter Pills */}
        {!loading && resources.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "6px",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            {FILTER_OPTIONS.filter((f) => f === "All" || counts[f] > 0).map(
              (f) => {
                const isActive = activeFilter === f;
                const ft =
                  f !== "All"
                    ? FILE_TYPES[f.toLowerCase()] || FILE_TYPES.default
                    : null;
                return (
                  <button
                    key={f}
                    className="filter-pill"
                    onClick={() => setActiveFilter(f)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive
                        ? ft
                          ? ft.accent
                          : "#fff"
                        : "rgba(255,255,255,0.45)",
                      background: isActive
                        ? ft
                          ? ft.bg
                          : "rgba(255,255,255,0.1)"
                        : "transparent",
                      border: `1px solid ${isActive ? (ft ? ft.border : "rgba(255,255,255,0.2)") : "rgba(255,255,255,0.08)"}`,
                      transition: "all 0.15s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    {f}
                    <span
                      style={{
                        fontSize: "10px",
                        background: isActive
                          ? ft
                            ? ft.border
                            : "rgba(255,255,255,0.15)"
                          : "rgba(255,255,255,0.06)",
                        padding: "1px 5px",
                        borderRadius: "20px",
                        color: isActive
                          ? ft
                            ? ft.accent
                            : "rgba(255,255,255,0.7)"
                          : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {counts[f]}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[0, 1, 2].map((i) => (
              <SkeletonRow key={i} index={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 16px",
              borderRadius: "12px",
              background: "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.2)",
              animation: "shake 0.4s ease",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontSize: "13px", color: "#EF4444", flex: 1 }}>
              {error}
            </span>
            <button
              onClick={fetchResources}
              style={{
                fontSize: "12px",
                color: "#EF4444",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "6px",
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && resources.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "44px 24px",
              borderRadius: "14px",
              border: "1px dashed rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.02)",
              animation: "fadeSlideIn 0.4s ease",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
                color: "rgba(255,255,255,0.25)",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p
              style={{
                margin: "0 0 5px",
                fontSize: "14px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              No resources yet
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "rgba(255,255,255,0.25)",
              }}
            >
              Your instructor hasn't uploaded any materials yet
            </p>
          </div>
        )}

        {/* No search results */}
        {!loading &&
          !error &&
          resources.length > 0 &&
          filtered.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "32px 24px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
                animation: "fadeSlideIn 0.25s ease",
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                No results for "{search}"
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveFilter("All");
                }}
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.4)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                  marginTop: "4px",
                }}
              >
                Clear filters
              </button>
            </div>
          )}

        {/* List */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map((r, i) => (
              <ResourceRow key={r._id} r={r} onOpen={openFile} index={i} />
            ))}
          </div>
        )}

        {/* Footer count */}
        {!loading &&
          !error &&
          filtered.length > 0 &&
          filtered.length < resources.length && (
            <p
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "rgba(255,255,255,0.25)",
                marginTop: "14px",
                marginBottom: 0,
              }}
            >
              Showing {filtered.length} of {resources.length} resources
            </p>
          )}
      </div>
    </>
  );
};

export default ResourceList;
