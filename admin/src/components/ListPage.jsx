import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Activity,
  AlertTriangle,
  BadgeIndianRupee,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Eye,
  EyeOff,
  GraduationCap,
  Layers3,
  LayoutGrid,
  LayoutList,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  Sparkles,
  Star,
  StarHalf,
  Trash2,
  TrendingUp,
  Video,
  X,
  Link,
  ListVideo,
  GripVertical,
  Globe,
  Lock,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Radio,
  EyeIcon,
  Users,
  Zap,
  Filter,
  ImageIcon,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

/* ═══════════════════════ STYLE ATOMS ═══════════════════════ */
const darkInput =
  "h-11 w-full rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-white/[0.06]";
const darkTextarea =
  "w-full rounded-xl border border-white/[0.09] bg-white/[0.04] p-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-white/[0.06] resize-none";
const darkSelect =
  "h-11 w-full rounded-xl border border-white/[0.09] bg-[#0b1120] px-4 text-sm text-white outline-none transition focus:border-cyan-400/40 cursor-pointer";
const labelCls =
  "mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500";

/* ═══════════════════════ HELPERS ═══════════════════════════ */
const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const getImageUrl = (p) => {
  if (!p)
    return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${API_BASE}${p}`;
  if (p.includes("/uploads/"))
    return `${API_BASE}/${p}`.replace(/([^:]\/)\/+/g, "$1");
  return `${API_BASE}/uploads/${p}`;
};

const parseDuration = (value) => {
  if (value == null) return 0;
  if (typeof value === "number" && Number.isFinite(value))
    return Math.max(0, Math.floor(value));
  if (typeof value === "string") {
    const str = value.trim();
    const hM = str.match(/(\d+)\s*h/i);
    const mM = str.match(/(\d+)\s*m/i);
    let t = 0;
    if (hM) t += parseInt(hM[1]) * 60;
    if (mM) t += parseInt(mM[1]);
    if (t > 0) return t;
    const plain = parseInt(str.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(plain) ? plain : 0;
  }
  if (typeof value === "object") {
    if (value.duration) return parseDuration(value.duration);
    if ("totalMinutes" in value) return toNum(value.totalMinutes);
    if ("hours" in value || "minutes" in value)
      return toNum(value.hours) * 60 + toNum(value.minutes);
  }
  return 0;
};

const fmtMins = (mins) => {
  const t = Math.max(0, Math.floor(toNum(mins)));
  const h = Math.floor(t / 60),
    m = t % 60;
  if (t === 0) return "—";
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const fmtPrice = (price) => {
  const n = toNum(price);
  if (!n || n <= 0) return "Free";
  return `₹${n.toLocaleString("en-IN")}`;
};

const safeRating = (r) => {
  const n = toNum(r, 0);
  return Math.min(5, Math.max(0, n));
};

const uid = () => `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/* ═══════════════════════ STAR RATING ═══════════════════════ */
const StarRating = ({ rating, size = "sm" }) => {
  const r = Math.round(safeRating(rating) * 2) / 2;
  const full = Math.floor(r);
  const half = r % 1 !== 0;
  const empty = 5 - full - (half ? 1 : 0);
  const sz = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star
          key={`f${i}`}
          className={`${sz} fill-yellow-400 text-yellow-400`}
        />
      ))}
      {half && <StarHalf className={`${sz} fill-yellow-400 text-yellow-400`} />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} className={`${sz} text-slate-700`} />
      ))}
    </div>
  );
};

/* ═══════════════════════ PUBLISH TOGGLE BUTTON ═════════════ */
const PublishToggle = ({
  isPublished,
  onToggle,
  loading = false,
  compact = false,
}) => {
  const handleToggle = (e) => {
    e.stopPropagation();
    onToggle(!isPublished);
  };

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        title={isPublished ? "Click to unpublish" : "Click to publish"}
        className={`group relative flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
          ${
            isPublished
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300"
              : "border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300"
          }`}
      >
        {loading ? (
          <Loader2 size={10} className="animate-spin" />
        ) : (
          <>
            <span
              className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-emerald-400 animate-pulse group-hover:bg-red-400" : "bg-orange-400"}`}
            />
            <span className="group-hover:hidden">
              {isPublished ? "Published" : "Draft"}
            </span>
            <span className="hidden group-hover:inline">
              {isPublished ? "Unpublish?" : "Publish?"}
            </span>
          </>
        )}
      </button>
    );
  }

  return (
    <div
      onClick={handleToggle}
      className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all duration-300 select-none
        ${
          isPublished
            ? "border-emerald-500/20 bg-emerald-500/5 hover:border-red-500/30 hover:bg-red-500/5"
            : "border-orange-500/20 bg-orange-500/5 hover:border-emerald-500/30 hover:bg-emerald-500/5"
        }`}
    >
      <div
        className={`relative h-6 w-11 rounded-full border transition-all duration-300
        ${isPublished ? "border-emerald-500/40 bg-emerald-500/20 group-hover:border-red-500/40 group-hover:bg-red-500/10" : "border-white/10 bg-white/[0.05] group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10"}
      `}
      >
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full shadow-lg transition-all duration-300
          ${
            isPublished
              ? "left-[calc(100%-1.375rem)] bg-emerald-400 group-hover:bg-red-400"
              : "left-0.5 bg-slate-500 group-hover:bg-emerald-400"
          }`}
        >
          {loading && (
            <Loader2
              size={12}
              className="absolute inset-0.5 animate-spin text-white"
            />
          )}
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          {isPublished ? (
            <Globe
              size={12}
              className="text-emerald-400 group-hover:text-red-400 transition-colors"
            />
          ) : (
            <Lock
              size={12}
              className="text-orange-400 group-hover:text-emerald-400 transition-colors"
            />
          )}
          <p
            className={`text-xs font-bold transition-colors
            ${isPublished ? "text-emerald-300 group-hover:text-red-300" : "text-orange-300 group-hover:text-emerald-300"}
          `}
          >
            {isPublished ? "Published" : "Draft / Unpublished"}
          </p>
        </div>
        <p className="text-[10px] text-slate-600 mt-0.5">
          {isPublished
            ? "Visible to all students · Click to unpublish"
            : "Hidden from students · Click to publish"}
        </p>
      </div>
    </div>
  );
};

/* ═══════════════════════ PUBLISH STATUS BADGE ══════════════ */
const PublishBadge = ({ isPublished }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider
    ${
      isPublished
        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
        : "border-orange-500/30 bg-orange-500/15 text-orange-300"
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-emerald-400 animate-pulse" : "bg-orange-400"}`}
    />
    {isPublished ? "Live" : "Draft"}
  </span>
);

/* ═══════════════════════ SKELETON LOADERS ══════════════════ */
const SkeletonCard = () => (
  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 animate-pulse">
    <div className="flex gap-5">
      <div className="h-28 w-40 shrink-0 rounded-xl bg-white/[0.06]" />
      <div className="flex-1 space-y-3 pt-1">
        <div className="h-5 w-3/4 rounded-lg bg-white/[0.06]" />
        <div className="h-3.5 w-1/2 rounded-lg bg-white/[0.04]" />
        <div className="h-3.5 w-1/3 rounded-lg bg-white/[0.04]" />
      </div>
    </div>
  </div>
);

const SkeletonGrid = () => (
  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] animate-pulse">
    <div className="h-44 bg-white/[0.06]" />
    <div className="p-5 space-y-3">
      <div className="h-4 w-3/4 rounded-lg bg-white/[0.06]" />
      <div className="h-3 w-1/2 rounded-lg bg-white/[0.04]" />
      <div className="h-3 w-1/3 rounded-lg bg-white/[0.04]" />
    </div>
  </div>
);

/* ═══════════════════════ THUMBNAIL CHANGER ═════════════════ */
const ThumbnailChanger = ({ src, courseId, onUpdated, className = "" }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(src);

  // sync preview when src prop changes from outside
  useEffect(() => {
    setPreview(src);
  }, [src]);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("image", file);
      // PUT /api/course/:id with multipart — backend deletes old Cloudinary image automatically
      const res = await axios.put(`${API_BASE}/api/course/${courseId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newUrl =
        res.data?.data?.image ||
        res.data?.course?.image ||
        res.data?.image ||
        objectUrl;
      onUpdated(newUrl);
      toast.success("Thumbnail updated!");
    } catch {
      toast.error("Thumbnail upload failed");
      setPreview(src);
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div
      className={`group relative cursor-pointer overflow-hidden ${className}`}
      onClick={() => inputRef.current?.click()}
      title="Click to change thumbnail"
    >
      <img
        src={preview}
        alt="thumbnail"
        onError={(e) => {
          e.target.src =
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop";
        }}
        className="h-full w-full object-cover transition duration-300 group-hover:brightness-50"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
        {uploading ? (
          <Loader2 size={22} className="animate-spin text-white" />
        ) : (
          <>
            <Camera size={22} className="text-white" />
            <span className="mt-1 text-[10px] font-bold text-white/80 uppercase tracking-widest">
              Change
            </span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

/* ═══════════════════════ MODAL THUMBNAIL UPLOADER ══════════ */
// Standalone thumbnail uploader for use inside the EditModal info tab
const ModalThumbnailUploader = ({ src, courseId, onUpdated }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(src);

  useEffect(() => {
    setPreview(src);
  }, [src]);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("image", file);
      // PUT /api/course/:id — backend automatically deletes OLD Cloudinary image
      // and uploads the new one, returning updated course with new image URL
      const res = await axios.put(`${API_BASE}/api/course/${courseId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newUrl =
        res.data?.data?.image ||
        res.data?.course?.image ||
        res.data?.image ||
        objectUrl;
      onUpdated(newUrl);
      toast.success("Thumbnail updated! Old image removed from storage.");
    } catch {
      toast.error("Thumbnail upload failed");
      setPreview(src);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Preview area */}
      <div
        className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.03] transition hover:border-cyan-400/30"
        style={{ height: "180px" }}
        onClick={() => inputRef.current?.click()}
        title="Click to change thumbnail"
      >
        <img
          src={preview}
          alt="Course thumbnail"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop";
          }}
          className="h-full w-full object-cover transition duration-300 group-hover:brightness-40"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200 bg-black/40">
          {uploading ? (
            <>
              <Loader2 size={28} className="animate-spin text-white" />
              <span className="text-xs font-semibold text-white/80">
                Uploading…
              </span>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                <Camera size={24} className="text-white" />
              </div>
              <span className="text-xs font-bold text-white/90 uppercase tracking-widest">
                Change Thumbnail
              </span>
              <span className="text-[10px] text-white/50">
                Old image deleted from Cloudinary automatically
              </span>
            </>
          )}
        </div>

        {/* Upload progress indicator */}
        {uploading && (
          <div className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-500/30">
            <div className="h-full bg-cyan-400 animate-pulse w-2/3" />
          </div>
        )}
      </div>

      {/* Click-to-upload button below preview */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.09] bg-white/[0.02] py-2.5 text-xs font-semibold text-slate-500 transition hover:border-cyan-400/30 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <Loader2 size={13} className="animate-spin" /> Uploading…
          </>
        ) : (
          <>
            <ImageIcon size={13} /> Upload new thumbnail
          </>
        )}
      </button>

      <p className="text-[10px] text-slate-600 text-center">
        JPG, PNG, WebP · Previous thumbnail deleted from Cloudinary on replace
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

/* ═══════════════════════ CHAPTER ROW ═══════════════════════ */
const ChapterRow = ({ chapter, onUpdate, onRemove }) => {
  const [open, setOpen] = useState(false);
  const upd = (k, v) => onUpdate({ ...chapter, [k]: v });
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <GripVertical
          size={14}
          className="text-slate-700 shrink-0 cursor-grab"
        />
        <div className="rounded-lg bg-cyan-500/10 p-1.5 text-cyan-300 shrink-0">
          <Video size={13} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {chapter.name || (
              <span className="text-slate-600 italic">Untitled chapter</span>
            )}
          </p>
          {(chapter.durationMinutes || chapter.duration) && (
            <p className="text-xs text-slate-600 mt-0.5">
              {fmtMins(
                chapter.durationMinutes || parseDuration(chapter.duration),
              )}
              {chapter.topic && ` · ${chapter.topic}`}
            </p>
          )}
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg border border-white/[0.07] bg-white/[0.04] p-1.5 text-slate-500 transition hover:text-cyan-300 shrink-0"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={onRemove}
          className="rounded-lg border border-white/[0.07] bg-white/[0.04] p-1.5 text-slate-500 transition hover:text-red-400 shrink-0"
        >
          <X size={12} />
        </button>
      </div>
      {open && (
        <div className="border-t border-white/[0.06] px-4 pb-4 pt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Chapter Name *</label>
            <input
              value={chapter.name || ""}
              onChange={(e) => upd("name", e.target.value)}
              placeholder="e.g. Introduction"
              className={darkInput}
            />
          </div>
          <div>
            <label className={labelCls}>Topic</label>
            <input
              value={chapter.topic || ""}
              onChange={(e) => upd("topic", e.target.value)}
              placeholder="e.g. What we'll build"
              className={darkInput}
            />
          </div>
          <div>
            <label className={labelCls}>Duration (minutes)</label>
            <input
              type="number"
              min="0"
              value={chapter.durationMinutes ?? ""}
              onChange={(e) => upd("durationMinutes", e.target.value)}
              placeholder="e.g. 15"
              className={darkInput}
            />
          </div>
          <div>
            <label className={labelCls}>Video URL</label>
            <input
              value={chapter.videoUrl || ""}
              onChange={(e) => upd("videoUrl", e.target.value)}
              placeholder="https://youtube.com/..."
              className={darkInput}
            />
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════ LECTURE ACCORDION ═════════════════ */
const LectureAccordion = ({ lecture, index, onUpdate, onRemove }) => {
  const [open, setOpen] = useState(false);
  const updateChapter = (ci, updated) =>
    onUpdate({
      ...lecture,
      chapters: lecture.chapters.map((c, i) => (i === ci ? updated : c)),
    });
  const removeChapter = (ci) =>
    onUpdate({
      ...lecture,
      chapters: lecture.chapters.filter((_, i) => i !== ci),
    });
  const addChapter = () => {
    onUpdate({
      ...lecture,
      chapters: [
        ...(lecture.chapters || []),
        {
          _localId: uid(),
          name: "",
          topic: "",
          durationMinutes: "",
          videoUrl: "",
        },
      ],
    });
    setOpen(true);
  };
  const totalMins = (lecture.chapters || []).reduce(
    (s, c) => s + (toNum(c.durationMinutes) || parseDuration(c.duration)),
    0,
  );

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <GripVertical
          size={15}
          className="text-slate-700 shrink-0 cursor-grab"
        />
        <span className="shrink-0 w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[11px] font-bold text-indigo-300">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          {open ? (
            <input
              value={lecture.title || ""}
              onChange={(e) => onUpdate({ ...lecture, title: e.target.value })}
              placeholder="Lecture title..."
              className="w-full bg-transparent text-sm font-semibold text-white outline-none border-b border-white/[0.08] pb-0.5 focus:border-cyan-400/40"
            />
          ) : (
            <p className="text-sm font-semibold text-white truncate">
              {lecture.title || (
                <span className="text-slate-600 italic">Untitled lecture</span>
              )}
            </p>
          )}
          <p className="text-xs text-slate-600 mt-0.5">
            {(lecture.chapters || []).length} chapters ·{" "}
            {fmtMins(
              totalMins ||
                parseDuration(lecture.duration) ||
                lecture._parsedDurationMinutes,
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={addChapter}
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300 transition hover:bg-emerald-500/20 shrink-0"
        >
          <Plus size={11} /> Chapter
        </button>
        <button
          onClick={onRemove}
          className="rounded-lg border border-white/[0.07] bg-white/[0.04] p-2 text-slate-600 transition hover:text-red-400 shrink-0"
        >
          <Trash2 size={13} />
        </button>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg border border-white/[0.07] bg-white/[0.04] p-2 text-slate-500 transition hover:text-white shrink-0"
        >
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/[0.06] px-5 pb-4 pt-3 space-y-2">
          {(lecture.chapters || []).length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/[0.06] py-6 text-center">
              <p className="text-xs text-slate-600">No chapters yet</p>
              <button
                type="button"
                onClick={addChapter}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
              >
                <Plus size={11} /> Add Chapter
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {lecture.chapters.map((ch, ci) => (
                <ChapterRow
                  key={ch._localId || ch.id || ch._id || ci}
                  chapter={ch}
                  onUpdate={(updated) => updateChapter(ci, updated)}
                  onRemove={() => removeChapter(ci)}
                />
              ))}
              <button
                type="button"
                onClick={addChapter}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.07] py-2.5 text-xs text-slate-600 transition hover:border-cyan-400/20 hover:text-cyan-400"
              >
                <Plus size={12} /> Add Chapter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════ EDIT MODAL ════════════════════════ */
const TABS = [
  { id: "info", label: "Course Info", icon: Settings2 },
  { id: "publish", label: "Visibility", icon: Globe },
  { id: "lectures", label: "Lectures", icon: ListVideo },
  { id: "resources", label: "Resources", icon: Link },
];

const EditModal = ({ course, onClose, onSaved }) => {
  const [tab, setTab] = useState("info");
  const [saving, setSaving] = useState(false);

  const [info, setInfo] = useState({
    name: course.name || "",
    instructor: course.instructor || "",
    price: course.price ?? 0,
    category: course.category || "",
    description: course.description || "",
    courseType: course.courseType || "regular",
  });

  // Track current thumbnail URL for the modal's own preview
  const [currentThumbnail, setCurrentThumbnail] = useState(
    course.image || getImageUrl(null),
  );

  const [isPublished, setIsPublished] = useState(course.isPublished ?? false);
  const [publishLoading, setPublishLoading] = useState(false);

  const [lectures, setLectures] = useState(
    (course.courseLectures || []).map((l) => ({
      ...l,
      _localId: l._localId || l.id || l._id || uid(),
      chapters: (l.chapters || []).map((c) => ({
        ...c,
        _localId: c._localId || c.id || c._id || uid(),
        durationMinutes:
          c.durationMin ?? c.totalMinutes ?? parseDuration(c.duration) ?? "",
      })),
    })),
  );

  const addLecture = () => {
    setLectures((p) => [
      ...p,
      { _localId: uid(), title: "", duration: "", chapters: [] },
    ]);
    setTab("lectures");
  };
  const updateLecture = (li, updated) =>
    setLectures((p) => p.map((l, i) => (i === li ? updated : l)));
  const removeLecture = (li) =>
    setLectures((p) => p.filter((_, i) => i !== li));

  const handlePublishToggle = async (newVal) => {
    try {
      setPublishLoading(true);
      await axios.patch(`${API_BASE}/api/course/${course.id}/publish`, {
        isPublished: newVal,
      });
      setIsPublished(newVal);
      toast.success(
        newVal ? "Course is now Live! 🎉" : "Course moved to Draft",
      );
    } catch {
      toast.error("Failed to update visibility");
    } finally {
      setPublishLoading(false);
    }
  };

  // Called when thumbnail is changed from inside the modal
  const handleThumbnailUpdatedInModal = (newUrl) => {
    const resolved = getImageUrl(newUrl);
    setCurrentThumbnail(resolved);
    // Bubble up to list so card thumbnail also updates immediately
    onSaved({ ...course, image: resolved });
  };

  const handleSave = async () => {
    if (!info.name.trim()) {
      toast.error("Course name is required");
      return;
    }
    try {
      setSaving(true);
      const sanitizedLectures = lectures.map((l) => ({
        ...l,
        chapters: (l.chapters || []).map((c) => ({
          ...c,
          duration: {
            hours: Math.floor(toNum(c.durationMinutes) / 60),
            minutes: toNum(c.durationMinutes) % 60,
          },
          totalMinutes: toNum(c.durationMinutes),
        })),
      }));
      await axios.put(`${API_BASE}/api/course/${course.id}`, {
        ...info,
        price: toNum(info.price, 0),
        lectures: sanitizedLectures,
        isPublished,
      });
      toast.success("Course saved!");
      onSaved({
        ...course,
        ...info,
        price: toNum(info.price, 0),
        courseLectures: sanitizedLectures,
        isPublished,
        image: currentThumbnail,
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  const totalChapters = lectures.reduce(
    (s, l) => s + (l.chapters || []).length,
    0,
  );
  const totalMinsAll = lectures.reduce((s, l) => {
    const cm = (l.chapters || []).reduce(
      (a, c) => a + (toNum(c.durationMinutes) || parseDuration(c.duration)),
      0,
    );
    return (
      s + (cm || parseDuration(l.duration) || l._parsedDurationMinutes || 0)
    );
  }, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="relative flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#060d18] shadow-2xl shadow-black/70">
        <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-cyan-500/8 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-blue-500/8 blur-[100px]" />

        {/* HEADER */}
        <div className="relative flex shrink-0 items-center justify-between border-b border-white/[0.07] px-6 py-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-cyan-400">
                LMS Editor
              </span>
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <h2 className="text-lg font-bold text-white leading-tight line-clamp-1">
                {info.name || "Edit Course"}
              </h2>
              <PublishBadge isPublished={isPublished} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-2 text-xs font-bold text-cyan-300 transition hover:from-cyan-500/30 hover:to-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}{" "}
              Save All
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-2 text-slate-500 transition hover:text-red-400 hover:border-red-400/20 hover:bg-red-500/5"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="relative shrink-0 flex gap-1 border-b border-white/[0.07] px-4 py-2">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${active ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-300" : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent"}`}
              >
                <t.icon size={13} />
                {t.label}
                {t.id === "lectures" && (
                  <span className="rounded-lg bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-slate-500">
                    {lectures.length}
                  </span>
                )}
                {t.id === "publish" && (
                  <PublishBadge isPublished={isPublished} />
                )}
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <div className="relative flex-1 overflow-y-auto p-6">
          {/* INFO TAB */}
          {tab === "info" && (
            <div className="space-y-5">
              {/* ── THUMBNAIL SECTION ── */}
              <div>
                <label className={labelCls}>
                  <span className="flex items-center gap-1.5">
                    <Camera size={11} />
                    Course Thumbnail
                  </span>
                </label>
                <ModalThumbnailUploader
                  src={currentThumbnail}
                  courseId={course.id}
                  onUpdated={handleThumbnailUpdatedInModal}
                />
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.05]" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Course Name *</label>
                  <input
                    value={info.name}
                    onChange={(e) =>
                      setInfo((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. React Masterclass"
                    className={darkInput}
                  />
                </div>
                <div>
                  <label className={labelCls}>Instructor</label>
                  <input
                    value={info.instructor}
                    onChange={(e) =>
                      setInfo((p) => ({ ...p, instructor: e.target.value }))
                    }
                    placeholder="e.g. Sophia Miller"
                    className={darkInput}
                  />
                </div>
                <div>
                  <label className={labelCls}>Category</label>
                  <input
                    value={info.category}
                    onChange={(e) =>
                      setInfo((p) => ({ ...p, category: e.target.value }))
                    }
                    placeholder="e.g. Development"
                    className={darkInput}
                  />
                </div>
                <div>
                  <label className={labelCls}>Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={info.price}
                    onChange={(e) =>
                      setInfo((p) => ({ ...p, price: e.target.value }))
                    }
                    placeholder="0 for free"
                    className={darkInput}
                  />
                </div>
                <div>
                  <label className={labelCls}>Course Type</label>
                  <select
                    value={info.courseType}
                    onChange={(e) =>
                      setInfo((p) => ({ ...p, courseType: e.target.value }))
                    }
                    className={darkSelect}
                  >
                    <option value="regular">Regular</option>
                    <option value="top">Top Course</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Rating (User-Generated)</label>
                  <div className="flex items-center gap-3 h-11 px-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <StarRating rating={safeRating(course.rating)} size="sm" />
                    <span className="text-sm font-semibold text-white">
                      {safeRating(course.rating).toFixed(1)}
                    </span>
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      Auto-calculated · Read only
                    </span>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Description</label>
                  <textarea
                    rows={4}
                    value={info.description}
                    onChange={(e) =>
                      setInfo((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="What will students learn..."
                    className={darkTextarea}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-yellow-500/10 bg-yellow-500/5 px-4 py-3">
                <AlertTriangle size={13} className="text-yellow-400 shrink-0" />
                <p className="text-xs text-yellow-300/70">
                  Thumbnail changes save instantly. Other changes require{" "}
                  <strong>Save All</strong>.
                </p>
              </div>
            </div>
          )}

          {/* PUBLISH TAB */}
          {tab === "publish" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Course Visibility
                </h3>
                <p className="text-xs text-slate-500">
                  Control whether this course is visible to students on your
                  platform.
                </p>
              </div>

              {/* Big Toggle Card */}
              <div
                className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-500
                ${isPublished ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5" : "border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent"}`}
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl opacity-30"
                  style={{ background: isPublished ? "#10b981" : "#f97316" }}
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-2xl p-3.5 ${isPublished ? "bg-emerald-500/20 text-emerald-300" : "bg-orange-500/15 text-orange-300"}`}
                    >
                      {isPublished ? <Globe size={22} /> : <Lock size={22} />}
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">
                        {isPublished ? "Course is Live" : "Course is in Draft"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        {isPublished
                          ? "This course is publicly visible. Students can discover, enroll, and access all content."
                          : "This course is hidden. Only admins can see it. Publish when ready to go live."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {isPublished ? (
                          <>
                            <span className="flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1">
                              <Users size={9} /> Student Visible
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-2 py-1">
                              <Search size={9} /> Searchable
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg px-2 py-1">
                              <Zap size={9} /> Enrollable
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="flex items-center gap-1 text-[10px] text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded-lg px-2 py-1">
                              <EyeOff size={9} /> Hidden from students
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1">
                              <ShieldCheck size={9} /> Admin only
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handlePublishToggle(!isPublished)}
                    disabled={publishLoading}
                    className="shrink-0 relative h-8 w-14 rounded-full transition-all duration-300 disabled:opacity-60 focus:outline-none"
                    style={{
                      background: isPublished
                        ? "rgba(16,185,129,0.3)"
                        : "rgba(255,255,255,0.08)",
                      border: isPublished
                        ? "1px solid rgba(16,185,129,0.4)"
                        : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div
                      className={`absolute top-1 h-6 w-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center
                      ${isPublished ? "left-[calc(100%-1.75rem)] bg-emerald-400 shadow-emerald-500/40" : "left-1 bg-slate-400 shadow-slate-700/40"}`}
                    >
                      {publishLoading && (
                        <Loader2
                          size={12}
                          className="animate-spin text-white"
                        />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Publish/Unpublish Action Button */}
              <button
                onClick={() => handlePublishToggle(!isPublished)}
                disabled={publishLoading}
                className={`w-full flex items-center justify-center gap-2.5 rounded-xl border py-3.5 text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    isPublished
                      ? "border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                  }`}
              >
                {publishLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : isPublished ? (
                  <>
                    <Lock size={15} /> Unpublish Course
                  </>
                ) : (
                  <>
                    <Globe size={15} /> Publish Course Now
                  </>
                )}
              </button>

              {/* Info box */}
              <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-4 space-y-2">
                <p className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                  <ShieldCheck size={12} /> Publishing Checklist
                </p>
                <ul className="space-y-1.5">
                  {[
                    { label: "Course has a title", ok: !!info.name.trim() },
                    {
                      label: "Instructor is set",
                      ok: !!info.instructor.trim(),
                    },
                    {
                      label: "Description is added",
                      ok: !!info.description.trim(),
                    },
                    { label: "At least 1 lecture", ok: lectures.length > 0 },
                  ].map((item) => (
                    <li
                      key={item.label}
                      className={`flex items-center gap-2 text-xs ${item.ok ? "text-emerald-300" : "text-slate-500"}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${item.ok ? "bg-emerald-400" : "bg-slate-600"}`}
                      />
                      {item.label}
                      {item.ok ? (
                        <Check size={10} className="ml-auto text-emerald-400" />
                      ) : (
                        <X size={10} className="ml-auto text-slate-600" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* LECTURES TAB */}
          {tab === "lectures" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Course Content
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lectures.length} lectures · {fmtMins(totalMinsAll)} total
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addLecture}
                  className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                >
                  <Plus size={13} /> Add Lecture
                </button>
              </div>
              {lectures.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/[0.07] py-14 text-center">
                  <div className="rounded-2xl bg-white/[0.04] p-4 text-slate-700">
                    <ListVideo size={28} strokeWidth={1.5} />
                  </div>
                  <p className="text-sm text-slate-500">No lectures yet</p>
                  <button
                    type="button"
                    onClick={addLecture}
                    className="flex items-center gap-1.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                  >
                    <Plus size={12} /> Add First Lecture
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {lectures.map((lec, li) => (
                    <LectureAccordion
                      key={lec._localId || lec.id || lec._id || li}
                      lecture={lec}
                      index={li}
                      onUpdate={(updated) => updateLecture(li, updated)}
                      onRemove={() => removeLecture(li)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RESOURCES TAB */}
          {tab === "resources" && (
            <div>
              <div className="mb-5">
                <h3 className="text-sm font-bold text-white">
                  Course Resources
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  PDFs, links & videos for enrolled students
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-8 text-center text-slate-500 text-sm">
                CourseResourcesAdmin component renders here
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="relative shrink-0 flex items-center justify-between border-t border-white/[0.07] px-6 py-3.5">
          <div className="flex items-center gap-2">
            <PublishBadge isPublished={isPublished} />
            <p className="text-xs text-slate-600">
              {tab === "lectures"
                ? `${totalChapters} total chapters`
                : "All changes require Save All"}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.08]"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-5 py-2 text-xs font-bold text-cyan-300 transition hover:from-cyan-500/30 hover:to-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Check size={13} />
              )}{" "}
              Save All Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════ NORMALIZE COURSE ══════════════════ */
const normalizeCourse = (course) => {
  const lectures =
    course.courseLectures || course.lectures || course.contents || [];
  const isPriceObj = typeof course.price === "object" && course.price !== null;
  const salePrice = isPriceObj ? course.price.sale : course.price;
  const originalPrice = isPriceObj
    ? course.price.original
    : course.originalPrice;
  return {
    ...course,
    id: course._id || course.id,
    name: course.name || course.title || "Untitled Course",
    instructor: course.teacher || course.instructor || "Unknown Instructor",
    image: getImageUrl(course.image || course.img || course.thumbnail),
    category: course.category || "Development",
    description:
      course.description ||
      course.overview ||
      course.desc ||
      "No description available.",
    rating: safeRating(course.avgRating ?? course.rating),
    courseType: course.courseType || course.type || "regular",
    lectures: lectures.length,
    isPublished: course.isPublished ?? course.published ?? false,
    courseLectures: lectures.map((l) => ({
      ...l,
      _parsedDurationMinutes:
        l.durationMin ?? l.totalMinutes ?? parseDuration(l.duration),
      chapters: Array.isArray(l.chapters)
        ? l.chapters.map((c) => ({
            ...c,
            _parsedDurationMinutes:
              c.durationMin ?? c.totalMinutes ?? parseDuration(c.duration),
          }))
        : [],
    })),
    totalDurationMinutes: parseDuration(
      course.totalDuration || course.duration || course.totalDurationObj,
    ),
    price: toNum(salePrice, 0),
    originalPrice: toNum(originalPrice ?? salePrice, 0),
    isFree: !!course.isFree || toNum(salePrice) === 0,
  };
};

/* ═══════════════════════ SORT OPTIONS ══════════════════════ */
const SORT_OPTIONS = [
  { value: "default", label: "Default Order" },
  { value: "name_asc", label: "Name A→Z" },
  { value: "name_desc", label: "Name Z→A" },
  { value: "rating_desc", label: "Highest Rated" },
  { value: "price_asc", label: "Price: Low→High" },
  { value: "price_desc", label: "Price: High→Low" },
  { value: "lectures_desc", label: "Most Lectures" },
  { value: "published_first", label: "Published First" },
  { value: "draft_first", label: "Draft First" },
];

const sortCourses = (courses, sort) => {
  const arr = [...courses];
  switch (sort) {
    case "name_asc":
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    case "name_desc":
      return arr.sort((a, b) => b.name.localeCompare(a.name));
    case "rating_desc":
      return arr.sort((a, b) => b.rating - a.rating);
    case "price_asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price_desc":
      return arr.sort((a, b) => b.price - a.price);
    case "lectures_desc":
      return arr.sort((a, b) => b.lectures - a.lectures);
    case "published_first":
      return arr.sort(
        (a, b) => (b.isPublished ? 1 : 0) - (a.isPublished ? 1 : 0),
      );
    case "draft_first":
      return arr.sort(
        (a, b) => (a.isPublished ? 1 : 0) - (b.isPublished ? 1 : 0),
      );
    default:
      return arr;
  }
};

/* ═══════════════════════ VISIBILITY FILTER OPTIONS ═════════ */
const VISIBILITY_FILTERS = [
  { value: "all", label: "All Courses", icon: Layers3 },
  { value: "published", label: "Published", icon: Globe },
  { value: "draft", label: "Drafts", icon: Lock },
];

/* ═══════════════════════════════════════════════════════════
                       MAIN LIST PAGE
═══════════════════════════════════════════════════════════ */
const ListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [expandedLectures, setExpandedLectures] = useState({});
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [sortBy, setSortBy] = useState("default");
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState("all");

  /* ─── fetch ─── */
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/course`);
      let raw = response.data;
      if (raw?.data) raw = raw.data;
      const courseArray = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.courses)
          ? raw.courses
          : Array.isArray(raw?.items)
            ? raw.items
            : [];
      setCourses(courseArray.map(normalizeCourse));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  /* ─── polling ─── */
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/course`);
        let raw = response.data;
        if (raw?.data) raw = raw.data;
        const courseArray = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.courses)
            ? raw.courses
            : Array.isArray(raw?.items)
              ? raw.items
              : [];
        setCourses((prev) =>
          prev.map((existing) => {
            const fresh = courseArray.find(
              (c) => (c._id || c.id) === existing.id,
            );
            if (!fresh) return existing;
            const newRating = safeRating(fresh.avgRating ?? fresh.rating);
            return newRating !== existing.rating
              ? { ...existing, rating: newRating }
              : existing;
          }),
        );
      } catch {
        /* silent */
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  /* ─── categories ─── */
  const categories = useMemo(
    () => ["All", ...new Set(courses.map((c) => c.category).filter(Boolean))],
    [courses],
  );

  /* ─── filter + sort ─── */
  const filteredCourses = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    let result = courses.filter((c) => {
      const matchSearch =
        !t ||
        c.name.toLowerCase().includes(t) ||
        c.instructor.toLowerCase().includes(t) ||
        c.category.toLowerCase().includes(t);
      const matchCat =
        activeCategory === "All" || c.category === activeCategory;
      const matchVis =
        visibilityFilter === "all" ||
        (visibilityFilter === "published" && c.isPublished) ||
        (visibilityFilter === "draft" && !c.isPublished);
      return matchSearch && matchCat && matchVis;
    });
    return sortCourses(result, sortBy);
  }, [courses, searchTerm, sortBy, activeCategory, visibilityFilter]);

  /* ─── stats ─── */
  const avgRating = useMemo(() => {
    if (!courses.length) return "0.0";
    return (
      courses.reduce((a, c) => a + safeRating(c.rating), 0) / courses.length
    ).toFixed(1);
  }, [courses]);

  const publishedCount = useMemo(
    () => courses.filter((c) => c.isPublished).length,
    [courses],
  );
  const draftCount = useMemo(
    () => courses.filter((c) => !c.isPublished).length,
    [courses],
  );

  /* ─── publish toggle from card ─── */
  const handlePublishToggle = async (courseId, newVal) => {
    setCourses((p) =>
      p.map((c) => (c.id === courseId ? { ...c, isPublished: newVal } : c)),
    );
    try {
      await axios.patch(`${API_BASE}/api/course/${courseId}/publish`, {
        isPublished: newVal,
      });
      toast.success(newVal ? "Course published! 🎉" : "Course moved to Draft", {
        icon: newVal ? "🌐" : "🔒",
      });
    } catch {
      setCourses((p) =>
        p.map((c) => (c.id === courseId ? { ...c, isPublished: !newVal } : c)),
      );
      toast.error("Failed to update visibility");
    }
  };

  /* ─── delete ─── */
  // DELETE /api/course/:id — backend calls deleteFromCloudinary(course.imagePublicId)
  // so the Cloudinary thumbnail is removed automatically on course deletion.
  const handleRemoveCourse = async (courseId, courseName) => {
    const prev = [...courses];
    setCourses((p) => p.filter((c) => c.id !== courseId));
    let undone = false;
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-200">"{courseName}" deleted</span>
          <button
            onClick={() => {
              undone = true;
              setCourses(prev);
              toast.dismiss(t.id);
              toast.success("Undo successful");
            }}
            className="rounded-lg bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition"
          >
            Undo
          </button>
        </div>
      ),
      { duration: 4000 },
    );
    await new Promise((r) => setTimeout(r, 4200));
    if (undone) return;
    try {
      // Backend deleteCourse controller calls deleteFromCloudinary(course.imagePublicId)
      await axios.delete(`${API_BASE}/api/course/${courseId}`);
    } catch {
      setCourses(prev);
      toast.error("Failed to delete course");
    }
  };

  /* ─── callbacks ─── */
  const handleCourseSaved = (updated) => {
    setCourses((p) =>
      p.map((c) =>
        c.id === updated.id ? normalizeCourse({ ...c, ...updated }) : c,
      ),
    );
  };

  const handleThumbnailUpdated = (courseId, newUrl) => {
    setCourses((p) =>
      p.map((c) =>
        c.id === courseId ? { ...c, image: getImageUrl(newUrl) } : c,
      ),
    );
  };

  const toggleCourseDetails = (id) =>
    setExpandedCourse((p) => (p === id ? null : id));
  const toggleLecture = (cid, lid) => {
    const key = `${cid}-${lid}`;
    setExpandedLectures((p) => ({ ...p, [key]: !p[key] }));
  };

  /* ═══════════════ CARD VIEW (GRID) ═══════════════ */
  const CourseCard = ({ course }) => (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
      ${
        course.isPublished
          ? "border-white/10 bg-white/[0.03] hover:shadow-cyan-500/5 hover:border-white/20"
          : "border-orange-500/10 bg-orange-500/[0.02] hover:shadow-orange-500/5 hover:border-orange-500/20"
      }`}
    >
      {!course.isPublished && (
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-orange-500/0 via-orange-500/50 to-orange-500/0" />
      )}

      <ThumbnailChanger
        src={course.image}
        courseId={course.id}
        onUpdated={(url) => handleThumbnailUpdated(course.id, url)}
        className="h-44 w-full shrink-0"
      />

      {/* Badges */}
      <div className="absolute top-3 left-3 flex gap-1.5">
        <span
          className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold border ${course.courseType === "top" ? "border-yellow-500/30 bg-yellow-500/20 text-yellow-300" : "border-indigo-500/20 bg-indigo-500/10 text-indigo-300"}`}
        >
          {course.courseType === "top" ? "⭐ Top" : "Regular"}
        </span>
        <PublishBadge isPublished={course.isPublished} />
      </div>

      <div className="flex flex-1 flex-col p-5 gap-3">
        <div>
          <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
            {course.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
            <GraduationCap size={12} className="text-cyan-400 shrink-0" />
            <span className="truncate">{course.instructor}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <StarRating rating={course.rating} />
          <span className="text-xs text-slate-500">
            {safeRating(course.rating).toFixed(1)}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <BookOpen size={11} className="text-cyan-400" />
            {course.lectures} lectures
          </span>
          <span className="flex items-center gap-1">
            <Clock3 size={11} className="text-emerald-400" />
            {fmtMins(course.totalDurationMinutes)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <div>
            {course.isFree ? (
              <span className="text-sm font-bold text-emerald-400">Free</span>
            ) : (
              <div>
                <span className="text-base font-black text-white">
                  {fmtPrice(course.price)}
                </span>
                {course.originalPrice > course.price && (
                  <span className="ml-1.5 text-xs text-slate-600 line-through">
                    {fmtPrice(course.originalPrice)}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <PublishToggle
              isPublished={course.isPublished}
              onToggle={(v) => handlePublishToggle(course.id, v)}
              compact
            />
            <button
              onClick={() => setEditingCourse(course)}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
            >
              <Pencil size={11} />
            </button>
            <button
              onClick={() => handleRemoveCourse(course.id, course.name)}
              className="rounded-lg border border-white/[0.07] bg-white/[0.04] p-1.5 text-red-400 transition hover:bg-red-500/10"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══════════════ LIST ROW ═══════════════ */
  const CourseRow = ({ course }) => (
    <div
      className={`overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl
      ${
        course.isPublished
          ? "border-white/10 bg-white/[0.03] hover:shadow-cyan-500/5"
          : "border-orange-500/10 bg-orange-500/[0.015] hover:shadow-orange-500/5"
      }`}
    >
      {/* Draft banner */}
      {!course.isPublished && (
        <div className="flex items-center gap-2 bg-orange-500/10 border-b border-orange-500/15 px-5 py-2">
          <Lock size={11} className="text-orange-400" />
          <span className="text-[11px] font-semibold text-orange-300">
            Draft — Not visible to students
          </span>
          <button
            onClick={() => handlePublishToggle(course.id, true)}
            className="ml-auto flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            <Globe size={9} /> Publish Now
          </button>
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex flex-1 gap-4 sm:gap-5 min-w-0">
            <ThumbnailChanger
              src={course.image}
              courseId={course.id}
              onUpdated={(url) => handleThumbnailUpdated(course.id, url)}
              className="h-28 w-40 sm:h-32 sm:w-48 shrink-0 rounded-xl ring-1 ring-white/10 shadow-lg"
            />
            <div className="flex-1 min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
                  {course.name}
                </h2>
                <span
                  className={`rounded-lg px-2.5 py-0.5 text-[11px] font-semibold border shrink-0 ${course.courseType === "top" ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-300" : "border-indigo-500/20 bg-indigo-500/10 text-indigo-300"}`}
                >
                  {course.courseType === "top" ? "⭐ Top" : "Regular"}
                </span>
                <PublishBadge isPublished={course.isPublished} />
              </div>
              <div className="mb-2 flex items-center gap-2 text-slate-400 text-sm">
                <GraduationCap className="h-4 w-4 text-cyan-400 shrink-0" />
                <span className="truncate">{course.instructor}</span>
              </div>
              <div className="mb-3 flex flex-wrap gap-3 sm:gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  {course.lectures} Lectures
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  {fmtMins(course.totalDurationMinutes)}
                </span>
                <span className="flex items-center gap-1.5">
                  <StarRating rating={course.rating} />
                  <span className="text-xs">
                    {safeRating(course.rating).toFixed(1)}
                  </span>
                </span>
              </div>
              <p className="line-clamp-2 text-sm text-slate-500 leading-relaxed">
                {course.description}
              </p>
            </div>
          </div>

          <div className="flex xl:flex-col items-center xl:items-end justify-between xl:justify-start gap-4 shrink-0">
            <div className="text-left xl:text-right">
              {course.isFree ? (
                <span className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-bold text-emerald-300">
                  Free
                </span>
              ) : (
                <>
                  <div className="flex items-center gap-1 text-xl sm:text-2xl font-black text-white">
                    <BadgeIndianRupee className="h-5 w-5 text-cyan-400" />
                    {fmtPrice(course.price)}
                  </div>
                  {course.originalPrice > course.price && (
                    <p className="mt-0.5 text-xs text-slate-600 line-through">
                      {fmtPrice(course.originalPrice)}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <PublishToggle
                isPublished={course.isPublished}
                onToggle={(v) => handlePublishToggle(course.id, v)}
                compact
              />

              <button
                onClick={() => toggleCourseDetails(course.id)}
                title={
                  expandedCourse === course.id ? "Hide details" : "Show details"
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-cyan-300 transition hover:scale-105 hover:border-cyan-400/30 hover:bg-cyan-500/10"
              >
                {expandedCourse === course.id ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
              <button
                onClick={() => setEditingCourse(course)}
                className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => handleRemoveCourse(course.id, course.name)}
                title="Delete course"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-red-400 transition hover:scale-105 hover:border-red-400/30 hover:bg-red-500/10"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EXPANDED DETAIL */}
      {expandedCourse === course.id && (
        <div className="border-t border-white/10 bg-white/[0.02] p-5 sm:p-8">
          {course.description && (
            <p className="mb-6 leading-relaxed text-slate-400 text-sm">
              {course.description}
            </p>
          )}
          <h3 className="mb-4 text-base font-bold text-white">
            Course Content
          </h3>
          {course.courseLectures.length === 0 ? (
            <p className="text-sm text-slate-600 italic">
              No lectures added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {course.courseLectures.map((lecture, li) => {
                const lkey = `${course.id}-${lecture.id || lecture._id || li}`;
                return (
                  <div
                    key={lkey}
                    className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
                  >
                    <button
                      onClick={() =>
                        toggleLecture(
                          course.id,
                          lecture.id || lecture._id || li,
                        )
                      }
                      className="flex w-full items-center justify-between p-4 text-left transition hover:bg-white/[0.03]"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {lecture.title || "Untitled Lecture"}
                        </h4>
                        <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Video className="h-3.5 w-3.5 text-cyan-400" />
                            {(lecture.chapters || []).length} chapters
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5 text-emerald-400" />
                            {fmtMins(lecture._parsedDurationMinutes)}
                          </span>
                        </div>
                      </div>
                      {expandedLectures[lkey] ? (
                        <ChevronUp
                          size={16}
                          className="text-cyan-400 shrink-0 ml-3"
                        />
                      ) : (
                        <ChevronDown
                          size={16}
                          className="text-slate-600 shrink-0 ml-3"
                        />
                      )}
                    </button>
                    {expandedLectures[lkey] && (
                      <div className="border-t border-white/10 p-4 space-y-3">
                        {(lecture.chapters || []).length === 0 ? (
                          <p className="text-xs text-slate-600 italic">
                            No chapters.
                          </p>
                        ) : (
                          lecture.chapters.map((ch, ci) => (
                            <div
                              key={ch.id || ch._id || ci}
                              className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5"
                            >
                              <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-300 shrink-0">
                                <Video size={13} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {ch.name || "Untitled Chapter"}
                                </p>
                                {ch.topic && (
                                  <p className="mt-0.5 text-xs text-slate-500 truncate">
                                    {ch.topic}
                                  </p>
                                )}
                                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                                  <span className="flex items-center gap-1 text-xs text-slate-600">
                                    <Clock3
                                      size={11}
                                      className="text-emerald-400"
                                    />
                                    {fmtMins(ch._parsedDurationMinutes)}
                                  </span>
                                  {ch.videoUrl && (
                                    <a
                                      href={ch.videoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-semibold text-cyan-400 hover:underline"
                                    >
                                      Watch ↗
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#e2e8f0",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
          },
        }}
      />

      {/* bg fx */}
      <div className="absolute left-0 top-0 h-[350px] w-[350px] bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-[350px] w-[350px] bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-2">
        {/* HERO */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="mt-5 text-3xl font-black tracking-tight md:text-4xl">
              Course
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {" "}
                Catalog
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
              Manage, monitor and optimize courses across your learning
              platform.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 backdrop-blur-2xl">
            <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-400">
              <Activity size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-400">System Status</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />{" "}
                All systems operational
              </p>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-5">
          {[
            {
              label: "Total Courses",
              value: courses.length,
              icon: BookOpen,
              color: "indigo",
            },
            {
              label: "Published",
              value: publishedCount,
              icon: Globe,
              color: "emerald",
            },
            { label: "Drafts", value: draftCount, icon: Lock, color: "orange" },
            {
              label: "Active Results",
              value: filteredCourses.length,
              icon: Layers3,
              color: "cyan",
            },
            {
              label: "Avg Rating",
              value: avgRating,
              icon: Star,
              color: "yellow",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className={`group relative overflow-hidden rounded-2xl border border-${color}-500/20 bg-gradient-to-br from-${color}-500/15 to-${color}-500/5 p-5 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
              onClick={() => {
                if (label === "Published") setVisibilityFilter("published");
                else if (label === "Drafts") setVisibilityFilter("draft");
                else if (label === "Total Courses") setVisibilityFilter("all");
              }}
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/5 blur-3xl" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400">{label}</p>
                  <h2 className="mt-3 text-2xl font-black tracking-tight">
                    {value}
                  </h2>
                  <div className="mt-4 inline-flex items-center gap-1 text-[10px] text-emerald-300">
                    <TrendingUp size={11} /> Live data
                  </div>
                </div>
                <div
                  className={`rounded-xl border border-white/10 bg-white/[0.05] p-3 text-${color}-300`}
                >
                  <Icon size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH + CONTROLS */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl">
          <div className="flex flex-col gap-5 border-b border-white/10 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
                <BookOpen size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">All Courses</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Search, edit and manage your catalog.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-2xl">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  placeholder="Search courses, instructors, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-12 pr-4 text-sm text-white outline-none backdrop-blur-xl transition-all placeholder:text-slate-500 focus:border-cyan-400/30 focus:bg-cyan-500/[0.03]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:text-white transition"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-12 rounded-xl border border-white/10 bg-[#0b1120] px-4 text-sm text-white outline-none transition focus:border-cyan-400/30 cursor-pointer shrink-0"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <div className="flex h-12 rounded-xl border border-white/10 bg-white/[0.04] p-1 gap-1 shrink-0">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${viewMode === "list" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/20" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <LayoutList size={15} /> List
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${viewMode === "grid" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/20" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <LayoutGrid size={15} /> Grid
                </button>
              </div>

              <button
                onClick={fetchCourses}
                disabled={loading}
                title="Refresh"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:text-cyan-300 hover:border-cyan-400/20 disabled:opacity-40"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {/* FILTERS ROW */}
          <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-1 mr-2">
              <Filter size={12} className="text-slate-600" />
              <span className="text-[11px] text-slate-600 font-semibold uppercase tracking-widest">
                Status
              </span>
            </div>
            {VISIBILITY_FILTERS.map((vf) => (
              <button
                key={vf.value}
                onClick={() => setVisibilityFilter(vf.value)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition
                  ${
                    visibilityFilter === vf.value
                      ? vf.value === "published"
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                        : vf.value === "draft"
                          ? "border-orange-500/30 bg-orange-500/15 text-orange-300"
                          : "border-cyan-500/30 bg-cyan-500/15 text-cyan-300"
                      : "border-white/[0.07] bg-white/[0.03] text-slate-500 hover:text-slate-300"
                  }`}
              >
                <vf.icon size={11} />
                {vf.label}
                <span className="rounded-md bg-white/[0.08] px-1 py-0.5 text-[10px]">
                  {vf.value === "all"
                    ? courses.length
                    : vf.value === "published"
                      ? publishedCount
                      : draftCount}
                </span>
              </button>
            ))}

            {categories.length > 1 && (
              <div className="w-px h-4 bg-white/[0.08] mx-1" />
            )}

            {categories.length > 1 &&
              categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition
                  ${activeCategory === cat ? "border-cyan-500/30 bg-cyan-500/15 text-cyan-300" : "border-white/[0.07] bg-white/[0.03] text-slate-500 hover:text-slate-300 hover:border-white/10"}`}
                >
                  {cat}
                </button>
              ))}
          </div>

          {/* Active filter summary */}
          {(visibilityFilter !== "all" ||
            activeCategory !== "All" ||
            searchTerm) && (
            <div className="flex items-center gap-3 px-6 py-2.5 bg-white/[0.015]">
              <span className="text-[11px] text-slate-500">
                Showing {filteredCourses.length} of {courses.length} courses
              </span>
              <button
                onClick={() => {
                  setVisibilityFilter("all");
                  setActiveCategory("All");
                  setSearchTerm("");
                }}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-red-400 transition"
              >
                <X size={10} /> Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* LOADING SKELETONS */}
        {loading &&
          (viewMode === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonGrid key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ))}

        {/* COURSE DISPLAY */}
        {!loading &&
          filteredCourses.length > 0 &&
          (viewMode === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {filteredCourses.map((course) => (
                <CourseRow key={course.id} course={course} />
              ))}
            </div>
          ))}

        {/* EMPTY STATE */}
        {!loading && filteredCourses.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl">
            <div className="rounded-2xl bg-white/[0.04] p-5 text-slate-600">
              <Search size={36} strokeWidth={1.5} />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-white">
              No Courses Found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {visibilityFilter === "published"
                ? "No published courses yet."
                : visibilityFilter === "draft"
                  ? "No draft courses."
                  : searchTerm
                    ? "Try a different keyword."
                    : activeCategory !== "All"
                      ? `No courses in "${activeCategory}".`
                      : "No courses have been added yet."}
            </p>
            {(searchTerm ||
              activeCategory !== "All" ||
              visibilityFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("All");
                  setVisibilityFilter("all");
                }}
                className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingCourse && (
        <EditModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSaved={handleCourseSaved}
        />
      )}
    </div>
  );
};

export default ListPage;
