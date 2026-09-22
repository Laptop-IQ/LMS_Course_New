import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import {
  BadgeIndianRupee,
  BookOpenText,
  ChevronDown,
  ChevronUp,
  Clock,
  ListOrdered,
  PenLine,
  Plus,
  Star,
  Upload,
  UserPen,
  Video,
  X,
  Sparkles,
  CalendarClock,
  Infinity,
  GripVertical,
  Layers,
  Shield,
  Zap,
  Award,
  TrendingUp,
  Globe,
  Lock,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  Play,
  FileVideo,
  BarChart3,
  Users,
  BookMarked,
  Flame,
  Crown,
  Timer,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Hash,
  Link2,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

/* ─────────────────────────── HELPERS ─────────────────────────── */
const formatDuration = (a, b) => {
  let hours = 0,
    minutes = 0;
  if (typeof a === "object" && a !== null) {
    hours = Number(a.hours) || 0;
    minutes = Number(a.minutes) || 0;
  } else {
    hours = Number(a) || 0;
    minutes = Number(b) || 0;
  }
  const totalMinutes = Math.max(0, Math.floor(hours * 60 + minutes));
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
};

const computeCourseTotals = (lectures = []) => {
  const cloned = (Array.isArray(lectures) ? lectures : []).map((lecture) => {
    const lec = {
      ...lecture,
      duration: {
        hours: Number(lecture?.duration?.hours) || 0,
        minutes: Number(lecture?.duration?.minutes) || 0,
      },
      chapters: Array.isArray(lecture?.chapters) ? [...lecture.chapters] : [],
    };
    let chaptersMinutes = 0;
    lec.chapters = lec.chapters.map((ch) => {
      const chHours = Number(ch?.duration?.hours) || 0;
      const chMins = Number(ch?.duration?.minutes) || 0;
      const chTotal = Math.max(0, chHours * 60 + chMins);
      chaptersMinutes += chTotal;
      return {
        ...ch,
        duration: { hours: chHours, minutes: chMins },
        totalMinutes: chTotal,
      };
    });
    let lectureTotalMinutes =
      lec.chapters.length > 0
        ? chaptersMinutes
        : Math.max(0, lec.duration.hours * 60 + lec.duration.minutes);
    return {
      ...lec,
      totalMinutes: lectureTotalMinutes,
      duration: {
        hours: Math.floor(lectureTotalMinutes / 60),
        minutes: lectureTotalMinutes % 60,
      },
    };
  });
  const courseTotalMinutes = cloned.reduce(
    (s, l) => s + (Number(l.totalMinutes) || 0),
    0,
  );
  return {
    lectures: cloned,
    totalLectures: cloned.length,
    totalDuration: {
      hours: Math.floor(courseTotalMinutes / 60),
      minutes: courseTotalMinutes % 60,
    },
  };
};

/* ─────────────────────────── DESIGN TOKENS ─────────────────────────── */
const inp =
  "h-11 w-full rounded-xl border border-[#1e2d40] bg-[#0a1628]/80 px-4 text-[13px] text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-[#00d4ff]/40 focus:bg-[#00d4ff]/[0.04] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.08)]";
const inpLg = inp + " h-12 text-[14px]";
const textarea =
  "w-full rounded-xl border border-[#1e2d40] bg-[#0a1628]/80 p-4 text-[13px] text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-[#00d4ff]/40 focus:bg-[#00d4ff]/[0.04] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.08)] resize-none";
const sel =
  "h-11 w-full rounded-xl border border-[#1e2d40] bg-[#060f1e] px-4 text-[13px] text-slate-100 outline-none transition focus:border-[#00d4ff]/40 appearance-none cursor-pointer";
const lbl =
  "mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-slate-500";

/* ─────────────────────────── COMPONENTS ─────────────────────────── */
const Panel = ({ children, className = "", glow }) => (
  <div
    className={`relative overflow-hidden rounded-2xl border border-[#1a2840] bg-gradient-to-b from-[#0d1b2e] to-[#080f1e] ${className}`}
  >
    {glow && (
      <div
        className={`absolute -top-20 -right-20 h-48 w-48 rounded-full blur-[80px] opacity-20 ${glow}`}
      />
    )}
    <div className="relative">{children}</div>
  </div>
);

const PanelHeader = ({
  icon: Icon,
  title,
  subtitle,
  badge,
  color = "cyan",
}) => {
  const colors = {
    cyan: {
      bg: "bg-[#00d4ff]/10",
      text: "text-[#00d4ff]",
      border: "border-[#00d4ff]/20",
    },
    violet: {
      bg: "bg-violet-500/10",
      text: "text-violet-400",
      border: "border-violet-500/20",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
    },
    rose: {
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/20",
    },
    indigo: {
      bg: "bg-indigo-500/10",
      text: "text-indigo-400",
      border: "border-indigo-500/20",
    },
    orange: {
      bg: "bg-orange-500/10",
      text: "text-orange-400",
      border: "border-orange-500/20",
    },
  };
  const c = colors[color] || colors.cyan;
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-[#1a2840]">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${c.border} ${c.bg} ${c.text}`}
        >
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[12px] text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {badge && (
        <span
          className={`text-[11px] font-bold px-3 py-1 rounded-full border ${c.border} ${c.bg} ${c.text}`}
        >
          {badge}
        </span>
      )}
    </div>
  );
};

/* Upload Zone */
const UploadZone = ({ file, onChange, uploading }) => {
  const ref = useRef();
  const [drag, setDrag] = useState(false);
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDrag(false);
      const f = e.dataTransfer.files?.[0];
      if (f && f.type.startsWith("image/"))
        onChange({ target: { files: [f] } });
    },
    [onChange],
  );
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => ref.current?.click()}
      className={`group relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ${
        drag
          ? "border-[#00d4ff]/60 bg-[#00d4ff]/10 scale-[1.01]"
          : file
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-[#1e2d40] bg-[#0a1628]/60 hover:border-[#00d4ff]/30 hover:bg-[#00d4ff]/[0.03]"
      }`}
      style={{ minHeight: 200 }}
    >
      <input
        ref={ref}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />
      {file ? (
        <div className="relative h-52">
          <img
            src={file.preview}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <p className="text-[12px] font-semibold text-white truncate max-w-[200px]">
                {file.file.name}
              </p>
              <p className="text-[11px] text-slate-400">
                {(file.file.size / 1024).toFixed(0)} KB ·{" "}
                {file.file.type.split("/")[1].toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              <CheckCircle2 size={12} /> Uploaded
            </div>
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
            <div className="rounded-lg bg-black/60 backdrop-blur border border-white/10 px-2.5 py-1 text-[11px] text-slate-300">
              Click to change
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors ${
              drag
                ? "border-[#00d4ff]/40 bg-[#00d4ff]/10 text-[#00d4ff]"
                : "border-[#1e2d40] bg-[#0d1b2e] text-slate-500 group-hover:border-[#00d4ff]/30 group-hover:text-[#00d4ff]/60"
            }`}
          >
            {uploading ? (
              <div className="h-6 w-6 rounded-full border-2 border-[#00d4ff]/40 border-t-[#00d4ff] animate-spin" />
            ) : (
              <Upload size={22} />
            )}
          </div>
          <p className="text-[14px] font-semibold text-slate-300 mb-1">
            {drag
              ? "Drop image here"
              : uploading
                ? "Processing..."
                : "Upload Thumbnail"}
          </p>
          <p className="text-[12px] text-slate-600">
            Drag & drop or click · PNG, JPG, WEBP · Max 10MB
          </p>
          <p className="mt-2 text-[11px] text-slate-700">
            Recommended: 1280×720px (16:9)
          </p>
        </div>
      )}
    </div>
  );
};

/* ── PRO PUBLISH TOGGLE ── */
const PublishToggle = ({ isPublished, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!isPublished)}
    className={`group relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-all duration-500 ${
      isPublished
        ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 to-teal-500/5 shadow-lg shadow-emerald-500/10"
        : "border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/5 hover:border-orange-500/40"
    }`}
  >
    <div
      className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl transition-all duration-700 ${
        isPublished ? "bg-emerald-400/25" : "bg-orange-400/15"
      }`}
    />
    <div className="relative flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div
          className={`relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
            isPublished
              ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
              : "border-orange-500/30 bg-orange-500/15 text-orange-300"
          }`}
        >
          {isPublished ? <Globe size={20} /> : <Lock size={20} />}
          {isPublished && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#0d1b2e] animate-pulse" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p
              className={`text-[15px] font-bold transition-colors ${isPublished ? "text-emerald-300" : "text-orange-300"}`}
            >
              {isPublished ? "Course is Live" : "Saved as Draft"}
            </p>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
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
          </div>
          <p className="text-[12px] text-slate-500 leading-relaxed">
            {isPublished
              ? "Visible to all students · Searchable · Enrollable"
              : "Hidden from students · Only admins can see this course"}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {isPublished ? (
              <>
                <span className="flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  <Users size={9} /> Students
                </span>
                <span className="flex items-center gap-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
                  <Globe size={9} /> Public
                </span>
                <span className="flex items-center gap-1 rounded-lg bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                  <Zap size={9} /> Enrollable
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1 rounded-lg bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-orange-400">
                  <EyeOff size={9} /> Hidden
                </span>
                <span className="flex items-center gap-1 rounded-lg bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                  <Shield size={9} /> Admin only
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <div
          className={`relative h-8 w-14 rounded-full border transition-all duration-400 ${
            isPublished
              ? "border-emerald-500/50 bg-emerald-500/30"
              : "border-orange-500/30 bg-orange-500/10"
          }`}
        >
          <div
            className={`absolute top-1 h-6 w-6 rounded-full shadow-lg transition-all duration-300 ${
              isPublished
                ? "left-[calc(100%-1.75rem)] bg-emerald-400 shadow-emerald-400/40"
                : "left-1 bg-orange-400 shadow-orange-400/30"
            }`}
          />
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider ${isPublished ? "text-emerald-400" : "text-orange-400"}`}
        >
          {isPublished ? "ON" : "OFF"}
        </span>
      </div>
    </div>
  </button>
);

/* Step indicator */
const StepBadge = ({ n, label, active, done, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2.5 transition-all cursor-pointer ${
      active
        ? "opacity-100"
        : done
          ? "opacity-60 hover:opacity-80"
          : "opacity-30 cursor-not-allowed"
    }`}
    disabled={!active && !done}
  >
    <div
      className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold transition-colors ${
        done
          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          : active
            ? "bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30"
            : "bg-[#1a2840] text-slate-600 border border-[#1a2840]"
      }`}
    >
      {done ? <CheckCircle2 size={14} /> : n}
    </div>
    <span
      className={`text-[12px] font-semibold hidden sm:block ${
        active ? "text-white" : done ? "text-slate-400" : "text-slate-700"
      }`}
    >
      {label}
    </span>
  </button>
);

/* Modal */
const Modal = ({ children, title, icon: Icon, color = "cyan", onClose }) => {
  const c = {
    cyan: "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  }[color];
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#1a2840] bg-[#060f1e] shadow-2xl shadow-black/60 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1a2840]">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl border ${c}`}
            >
              <Icon size={16} />
            </div>
            <h3 className="text-[15px] font-bold text-white">{title}</h3>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#1a2840] bg-[#0d1b2e] p-1.5 text-slate-500 hover:text-white transition"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

/* ─────────────────────────── STEP VALIDATION ─────────────────────────── */
const validateStep = (step, formData) => {
  switch (step) {
    case 1:
      if (!formData.name?.trim()) {
        toast.error("Course title required");
        return false;
      }
      if (!formData.teacher?.trim()) {
        toast.error("Instructor name required");
        return false;
      }
      if (!formData.overview?.trim()) {
        toast.error("Course overview required");
        return false;
      }
      if (!formData.image?.file) {
        toast.error("Thumbnail required");
        return false;
      }
      return true;
    case 2:
      if (formData.lectures.length === 0) {
        toast.error("Add at least one lecture");
        return false;
      }
      return true;
    case 3:
      if (formData.pricingType === "paid") {
        if (!formData.subscriptionType) {
          toast.error("Select subscription type");
          return false;
        }
        if (
          !formData.price.original ||
          parseFloat(formData.price.original) <= 0
        ) {
          toast.error("Enter original price");
          return false;
        }
        if (!formData.price.sale || parseFloat(formData.price.sale) <= 0) {
          toast.error("Enter sale price");
          return false;
        }
        if (
          parseFloat(formData.price.sale) >= parseFloat(formData.price.original)
        ) {
          toast.error("Sale price must be lower than original");
          return false;
        }
      }
      return true;
    default:
      return true;
  }
};

/* ─────────────────────────── SUBSCRIPTION OPTIONS ─────────────────────────── */
const SUBSCRIPTION_OPTIONS = [
  {
    value: "1year",
    label: "1 Year",
    desc: "1 saal access",
    icon: Clock,
    badgeText: null,
    badgeClass: null,
  },
  {
    value: "2year",
    label: "2 Year",
    desc: "2 saal access",
    icon: CalendarClock,
    badgeText: "POPULAR",
    badgeClass: "bg-blue-500/20 border-blue-500/30 text-blue-400",
  },
  {
    value: "lifetime",
    label: "Lifetime",
    desc: "Hamesha access",
    icon: Infinity,
    badgeText: "BEST VALUE",
    badgeClass: "bg-amber-500/20 border-amber-500/30 text-amber-400",
  },
];

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */
const AddPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    teacher: "",
    image: null,
    pricingType: "free",
    subscriptionType: "1year",
    price: { original: "", sale: "" },
    overview: "",
    totalDuration: { hours: "", minutes: "" },
    totalLectures: "",
    lectures: [],
    courseType: "regular",
    isPublished: false,
    level: "beginner",
    language: "English",
    tags: [],
  });

  const [currentLecture, setCurrentLecture] = useState({
    title: "",
    duration: { hours: "", minutes: "" },
    chapters: [],
  });
  const [currentChapter, setCurrentChapter] = useState({
    name: "",
    topic: "",
    duration: { hours: "", minutes: "" },
    videoUrl: "",
    isFree: false,
  });
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [expandedLectures, setExpandedLectures] = useState([]);
  const [selectedLectureIndex, setSelectedLectureIndex] = useState(null);
  const [tagInput, setTagInput] = useState("");

  const steps = [
    { n: 1, label: "Basics" },
    { n: 2, label: "Curriculum" },
    { n: 3, label: "Pricing" },
    { n: 4, label: "Publish" },
  ];

  const goToStep = (step) => {
    if (step < activeStep) {
      setActiveStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    for (let s = activeStep; s < step; s++) {
      if (!validateStep(s, formData)) return;
    }
    setActiveStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    if (!validateStep(activeStep, formData)) return;
    setActiveStep((s) => Math.min(s + 1, 4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setActiveStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const set = (key, val) => setFormData((p) => ({ ...p, [key]: val }));
  const handleInput = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((p) => ({
        ...p,
        [parent]: { ...p[parent], [child]: value },
      }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) =>
      setFormData((p) => ({
        ...p,
        image: { file, preview: ev.target.result },
      }));
    reader.readAsDataURL(file);
  };

  const addTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(",", "");
      if (!formData.tags.includes(tag) && formData.tags.length < 10)
        setFormData((p) => ({ ...p, tags: [...p.tags, tag] }));
      setTagInput("");
    }
  };
  const removeTag = (t) =>
    setFormData((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));
  const toggleLecture = (i) =>
    setExpandedLectures((p) =>
      p.includes(i) ? p.filter((x) => x !== i) : [...p, i],
    );

  const addLecture = () => {
    if (!currentLecture.title?.trim()) {
      toast.error("Enter lecture title");
      return;
    }
    const hasChapters = currentLecture.chapters.length > 0;
    if (
      !hasChapters &&
      !currentLecture.duration.hours &&
      !currentLecture.duration.minutes
    ) {
      toast.error("Enter duration or add chapters");
      return;
    }
    const lecture = {
      id: `lec-${Date.now()}`,
      title: currentLecture.title.trim(),
      duration: {
        hours: Number(currentLecture.duration.hours) || 0,
        minutes: Number(currentLecture.duration.minutes) || 0,
      },
      chapters: [...currentLecture.chapters],
    };
    const newLectures = [...formData.lectures, lecture];
    const computed = computeCourseTotals(newLectures);
    setFormData((p) => ({
      ...p,
      lectures: computed.lectures,
      totalDuration: computed.totalDuration,
      totalLectures: computed.totalLectures,
    }));
    setCurrentLecture({
      title: "",
      duration: { hours: "", minutes: "" },
      chapters: [],
    });
    setShowLectureModal(false);
    setExpandedLectures((p) => [...p, formData.lectures.length]);
    toast.success("Lecture added!");
  };

  const addChapter = () => {
    if (!currentChapter.name?.trim()) {
      toast.error("Enter chapter name");
      return;
    }
    if (!currentChapter.topic?.trim()) {
      toast.error("Enter topic");
      return;
    }
    if (!currentChapter.duration.hours && !currentChapter.duration.minutes) {
      toast.error("Enter duration");
      return;
    }
    if (!currentChapter.videoUrl?.trim()) {
      toast.error("Enter video URL");
      return;
    }
    const chapter = {
      id: `ch-${Date.now()}`,
      name: currentChapter.name.trim(),
      topic: currentChapter.topic.trim(),
      duration: {
        hours: Number(currentChapter.duration.hours) || 0,
        minutes: Number(currentChapter.duration.minutes) || 0,
      },
      totalMinutes:
        (Number(currentChapter.duration.hours) || 0) * 60 +
        (Number(currentChapter.duration.minutes) || 0),
      videoUrl: currentChapter.videoUrl.trim(),
      isFree: currentChapter.isFree,
    };
    if (selectedLectureIndex !== null) {
      const updated = [...formData.lectures];
      updated[selectedLectureIndex] = {
        ...updated[selectedLectureIndex],
        chapters: [...(updated[selectedLectureIndex].chapters || []), chapter],
      };
      const computed = computeCourseTotals(updated);
      setFormData((p) => ({
        ...p,
        lectures: computed.lectures,
        totalDuration: computed.totalDuration,
        totalLectures: computed.totalLectures,
      }));
      toast.success("Chapter added!");
    } else {
      setCurrentLecture((p) => ({ ...p, chapters: [...p.chapters, chapter] }));
      toast.success("Chapter added to draft!");
    }
    setCurrentChapter({
      name: "",
      topic: "",
      duration: { hours: "", minutes: "" },
      videoUrl: "",
      isFree: false,
    });
    setShowChapterModal(false);
    setSelectedLectureIndex(null);
  };

  const removeLecture = (i) => {
    const updated = formData.lectures.filter((_, idx) => idx !== i);
    const computed = computeCourseTotals(updated);
    setFormData((p) => ({
      ...p,
      lectures: computed.lectures,
      totalDuration: computed.totalDuration,
      totalLectures: computed.totalLectures,
    }));
    setExpandedLectures((p) =>
      p.filter((x) => x !== i).map((x) => (x > i ? x - 1 : x)),
    );
    toast.success("Lecture removed");
  };

  const removeChapter = (li, ci) => {
    const updated = formData.lectures.map((lec, l) =>
      l !== li
        ? lec
        : { ...lec, chapters: lec.chapters.filter((_, c) => c !== ci) },
    );
    const computed = computeCourseTotals(updated);
    setFormData((p) => ({
      ...p,
      lectures: computed.lectures,
      totalDuration: computed.totalDuration,
      totalLectures: computed.totalLectures,
    }));
  };

  const validate = () => {
    for (let s = 1; s <= 3; s++) {
      if (!validateStep(s, formData)) return false;
    }
    if (!formData.totalLectures || Number(formData.totalLectures) <= 0) {
      toast.error("Set total lectures");
      return false;
    }
    if (!formData.totalDuration.hours && !formData.totalDuration.minutes) {
      toast.error("Set total duration");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const computed = computeCourseTotals(formData.lectures);
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("teacher", formData.teacher);
      fd.append("pricingType", formData.pricingType);
      fd.append(
        "subscriptionType",
        formData.pricingType === "paid" ? formData.subscriptionType : "",
      );
      fd.append("overview", formData.overview);
      fd.append(
        "totalLectures",
        String(formData.totalLectures || computed.totalLectures || 0),
      );
      fd.append("courseType", formData.courseType);
      fd.append("level", formData.level);
      fd.append("language", formData.language);
      fd.append("tags", JSON.stringify(formData.tags));
      fd.append("price", JSON.stringify(formData.price));
      fd.append("totalDuration", JSON.stringify(computed.totalDuration));
      fd.append("lectures", JSON.stringify(computed.lectures));
      if (formData.image?.file) fd.append("image", formData.image.file);
      fd.append("isPublished", String(formData.isPublished));
      const res = await fetch(`${API_BASE}/api/course`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.message || "Failed to create course");
        return;
      }
      toast.success(
        formData.isPublished
          ? "Course published successfully! 🎉"
          : "Course saved as draft!",
      );
      setTimeout(() => navigate("/listcourse"), 1200);
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const stats = computeCourseTotals(formData.lectures);
  const totalChapters = formData.lectures.reduce(
    (s, l) => s + (l.chapters?.length || 0),
    0,
  );

  const checklistItems = [
    { label: "Course title", done: !!formData.name.trim() },
    { label: "Instructor name", done: !!formData.teacher.trim() },
    { label: "Course thumbnail", done: !!formData.image },
    { label: "Course overview", done: !!formData.overview.trim() },
    {
      label: "Total duration set",
      done: !!(formData.totalDuration.hours || formData.totalDuration.minutes),
    },
    { label: "At least one lecture", done: formData.lectures.length > 0 },
    {
      label: "Pricing configured",
      done:
        formData.pricingType === "free" ||
        !!(formData.price.sale && formData.price.original),
    },
  ];
  const completionPct = Math.round(
    (checklistItems.filter((x) => x.done).length / checklistItems.length) * 100,
  );

  /* helper for discount badge */
  const discountPct =
    formData.price.original &&
    formData.price.sale &&
    parseFloat(formData.price.sale) < parseFloat(formData.price.original)
      ? Math.round(
          (1 -
            parseFloat(formData.price.sale) /
              parseFloat(formData.price.original)) *
            100,
        )
      : null;

  /* ── Step Content ── */
  const renderStepContent = () => {
    switch (activeStep) {
      /* ────── STEP 1: BASICS ────── */
      case 1:
        return (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
            <div className="space-y-5">
              <Panel glow="bg-[#00d4ff]">
                <PanelHeader
                  icon={BookOpenText}
                  title="Course Identity"
                  subtitle="The first impression of your course"
                  color="cyan"
                />
                <div className="p-6 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={lbl}>
                      <Hash size={11} /> Course Title
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInput}
                      className={inpLg + " text-base font-semibold"}
                      placeholder="e.g., Complete React Developer Bootcamp 2025"
                    />
                    <p className="mt-1.5 text-[11px] text-slate-600">
                      {formData.name.length}/100 characters · Be specific and
                      use keywords
                    </p>
                  </div>
                  <div>
                    <label className={lbl}>
                      <UserPen size={11} /> Instructor
                    </label>
                    <input
                      type="text"
                      name="teacher"
                      value={formData.teacher}
                      onChange={handleInput}
                      className={inp}
                      placeholder="Full name or brand name"
                    />
                  </div>
                  <div>
                    <label className={lbl}>
                      <Globe size={11} /> Language
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInput}
                      className={sel}
                    >
                      {["English", "Hindi"].map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>
                      <BarChart3 size={11} /> Level
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInput}
                      className={sel}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="all">All Levels</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>
                      <Crown size={11} /> Course Type
                    </label>
                    <select
                      name="courseType"
                      value={formData.courseType}
                      onChange={handleInput}
                      className={sel}
                    >
                      <option value="regular">Regular</option>
                      <option value="top">⭐ Top Course</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>
                      <Hash size={11} /> Tags{" "}
                      <span className="text-slate-700 normal-case tracking-normal font-normal">
                        ({formData.tags.length}/10)
                      </span>
                    </label>
                    <div className="rounded-xl border border-[#1e2d40] bg-[#0a1628]/80 px-3 py-2 flex flex-wrap gap-2 min-h-11">
                      {formData.tags.map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-1 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-2.5 py-1 text-[11px] font-semibold text-[#00d4ff]"
                        >
                          {t}
                          <button
                            type="button"
                            onClick={() => removeTag(t)}
                            className="text-[#00d4ff]/60 hover:text-[#00d4ff] transition"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                      <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={addTag}
                        placeholder={
                          formData.tags.length === 0
                            ? "Type a tag and press Enter…"
                            : "Add more…"
                        }
                        className="flex-1 min-w-[100px] bg-transparent text-[13px] text-slate-300 outline-none placeholder:text-slate-700"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={lbl}>
                      <BookOpenText size={11} /> Course Overview
                    </label>
                    <textarea
                      name="overview"
                      value={formData.overview}
                      onChange={handleInput}
                      rows={4}
                      className={textarea}
                      placeholder="What will students achieve? Describe the learning outcomes…"
                    />
                  </div>
                </div>
              </Panel>
              <Panel glow="bg-violet-500">
                <PanelHeader
                  icon={ImageIcon}
                  title="Course Thumbnail"
                  subtitle="First impression — make it count"
                  color="violet"
                />
                <div className="p-6">
                  <UploadZone
                    file={formData.image}
                    onChange={handleImage}
                    uploading={false}
                  />
                  <p className="mt-3 text-[11px] text-slate-600">
                    💡 Courses with professional thumbnails get{" "}
                    <strong className="text-slate-500">
                      3x more enrollments
                    </strong>
                    .
                  </p>
                </div>
              </Panel>
            </div>
            {/* SIDEBAR */}
            <div className="space-y-5">
              <Panel>
                <PanelHeader
                  icon={Shield}
                  title="Publish Checklist"
                  color="cyan"
                />
                <div className="p-5 space-y-2.5">
                  {checklistItems.map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <div
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-colors ${done ? "bg-emerald-500/20 text-emerald-400" : "bg-[#1a2840] text-slate-700"}`}
                      >
                        <CheckCircle2 size={12} />
                      </div>
                      <span
                        className={`text-[12px] ${done ? "text-slate-300" : "text-slate-600"}`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                  <div className="mt-4 pt-3 border-t border-[#1a2840]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-slate-600">
                        Completion
                      </span>
                      <span className="text-[11px] font-bold text-[#00d4ff]">
                        {completionPct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#1a2840] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#00d4ff] to-blue-500 transition-all duration-500"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        );

      /* ────── STEP 2: CURRICULUM ────── */
      case 2:
        return (
          <div className="space-y-5">
            <Panel glow="bg-indigo-500">
              <div className="px-6 py-5 border-b border-[#1a2840] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-white">
                      Curriculum
                    </h2>
                    {formData.lectures.length > 0 ? (
                      <p className="text-[12px] text-slate-500 mt-0.5">
                        {stats.totalLectures} lectures · {totalChapters}{" "}
                        chapters · {formatDuration(stats.totalDuration)}
                      </p>
                    ) : (
                      <p className="text-[12px] text-slate-600 mt-0.5">
                        No content yet
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLectureModal(true)}
                  className="flex items-center gap-2 rounded-xl border border-[#00d4ff]/20 bg-[#00d4ff]/10 px-4 py-2 text-[12px] font-bold text-[#00d4ff] hover:bg-[#00d4ff]/20 transition"
                >
                  <Plus size={14} /> Add Section
                </button>
              </div>
              <div className="p-4 space-y-3">
                {formData.lectures.map((lec, li) => (
                  <div
                    key={lec.id}
                    className="rounded-xl border border-[#1a2840] bg-[#060f1e] overflow-hidden"
                  >
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => toggleLecture(li)}
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-[#1a2840] bg-[#0d1b2e] text-slate-500 hover:text-white transition"
                      >
                        {expandedLectures.includes(li) ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-indigo-400 font-bold">
                            SECTION {li + 1}
                          </span>
                        </div>
                        <h3 className="text-[14px] font-semibold text-white truncate">
                          {lec.title}
                        </h3>
                        <p className="text-[11px] text-slate-600 flex items-center gap-2 mt-0.5">
                          <Clock size={10} className="text-slate-700" />
                          {formatDuration(lec.duration)}
                          {lec.chapters?.length > 0 && (
                            <>
                              <span className="text-slate-700">·</span>
                              {lec.chapters.length} lesson
                              {lec.chapters.length !== 1 ? "s" : ""}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLectureIndex(li);
                            setShowChapterModal(true);
                          }}
                          className="flex items-center gap-1 rounded-lg border border-[#1a2840] bg-[#0d1b2e] px-2.5 py-1.5 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/10 transition"
                        >
                          <Plus size={12} /> Lesson
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLecture(li)}
                          className="rounded-lg border border-[#1a2840] bg-[#0d1b2e] p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    {expandedLectures.includes(li) &&
                      lec.chapters?.length > 0 && (
                        <div className="border-t border-[#1a2840] px-4 py-3 space-y-2">
                          {lec.chapters.map((ch, ci) => (
                            <div
                              key={ch.id}
                              className="flex items-center gap-3 rounded-lg border border-[#1a2840]/60 bg-[#0a1628]/60 px-3 py-2.5"
                            >
                              <div
                                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${ch.isFree ? "bg-emerald-500/10 text-emerald-400" : "bg-[#1a2840] text-slate-600"}`}
                              >
                                <Play size={11} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-slate-200 truncate">
                                  {ch.name}
                                </p>
                                <p className="text-[11px] text-slate-600 truncate">
                                  {ch.topic} · {formatDuration(ch.duration)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {ch.isFree && (
                                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                                    FREE
                                  </span>
                                )}
                                <a
                                  href={ch.videoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-slate-600 hover:text-[#00d4ff] transition"
                                >
                                  <Link2 size={12} />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => removeChapter(li, ci)}
                                  className="text-slate-700 hover:text-rose-400 transition"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
                {formData.lectures.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setShowLectureModal(true)}
                    className="w-full flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1a2840] py-12 hover:border-[#00d4ff]/20 hover:bg-[#00d4ff]/[0.02] transition group"
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[#1a2840] bg-[#0d1b2e] text-slate-600 group-hover:border-[#00d4ff]/20 group-hover:text-[#00d4ff]/40 transition">
                      <FileVideo size={22} />
                    </div>
                    <p className="text-[13px] font-semibold text-slate-500">
                      No sections yet
                    </p>
                    <p className="text-[11px] text-slate-700 mt-1">
                      Click to add your first section
                    </p>
                  </button>
                )}
              </div>
            </Panel>
            <Panel>
              <PanelHeader
                icon={Timer}
                title="Duration & Stats"
                subtitle="Auto-calculated from curriculum"
                color="indigo"
              />
              <div className="p-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={lbl}>
                    <ListOrdered size={11} /> Total Lectures
                  </label>
                  <input
                    type="number"
                    name="totalLectures"
                    value={formData.totalLectures}
                    onChange={handleInput}
                    min="1"
                    className={inp}
                    placeholder="Total lecture count"
                  />
                </div>
              </div>
              {formData.lectures.length > 0 && (
                <div className="mx-6 mb-6 rounded-xl border border-[#1a2840] bg-[#060f1e] p-4">
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-3">
                    Auto-calculated from curriculum
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "Sections",
                        value: stats.totalLectures,
                        icon: Layers,
                      },
                      { label: "Lessons", value: totalChapters, icon: Play },
                      {
                        label: "Duration",
                        value: formatDuration(stats.totalDuration),
                        icon: Clock,
                      },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-center gap-2">
                        <Icon size={13} className="text-slate-600" />
                        <div>
                          <p className="text-[15px] font-bold text-white">
                            {value || "—"}
                          </p>
                          <p className="text-[10px] text-slate-600">{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Panel>
          </div>
        );

      /* ────── STEP 3: PRICING ────── */
      case 3:
        return (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
            <div className="space-y-5">
              <Panel>
                <PanelHeader
                  icon={BadgeIndianRupee}
                  title="Pricing"
                  color="emerald"
                />
                <div className="p-6 space-y-5">
                  {/* Free / Paid toggle */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        value: "free",
                        label: "🎁 Free",
                        desc: "Anyone can enroll at no cost",
                      },
                      {
                        value: "paid",
                        label: "💳 Paid",
                        desc: "Set your own price",
                      },
                    ].map(({ value, label, desc }) => (
                      <label
                        key={value}
                        className={`flex cursor-pointer flex-col gap-1.5 rounded-xl border p-4 transition-all ${
                          formData.pricingType === value
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                            : "border-[#1a2840] text-slate-500 hover:border-emerald-500/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="pricingType"
                          value={value}
                          checked={formData.pricingType === value}
                          onChange={handleInput}
                          className="hidden"
                        />
                        <span className="text-[14px] font-bold">{label}</span>
                        <span className="text-[11px] opacity-60">{desc}</span>
                      </label>
                    ))}
                  </div>

                  {formData.pricingType === "paid" && (
                    <div className="space-y-5">
                      {/* ── Subscription Type ── */}
                      <div>
                        <label className={lbl}>
                          <CalendarClock size={11} /> Subscription Type
                        </label>
                        <div className="grid grid-cols-3 gap-3 mt-3">
                          {SUBSCRIPTION_OPTIONS.map(
                            ({
                              value,
                              label,
                              desc,
                              icon: Icon,
                              badgeText,
                              badgeClass,
                            }) => (
                              <label
                                key={value}
                                className={`relative flex cursor-pointer flex-col gap-1.5 rounded-xl border p-4 pt-5 transition-all ${
                                  formData.subscriptionType === value
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                                    : "border-[#1a2840] text-slate-500 hover:border-emerald-500/20"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="subscriptionType"
                                  value={value}
                                  checked={formData.subscriptionType === value}
                                  onChange={handleInput}
                                  className="hidden"
                                />
                                {badgeText && (
                                  <span
                                    className={`absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border px-2 py-0.5 text-[9px] font-bold whitespace-nowrap ${badgeClass}`}
                                  >
                                    {badgeText}
                                  </span>
                                )}
                                <Icon
                                  size={18}
                                  className={`mb-1 ${formData.subscriptionType === value ? "text-emerald-400" : "text-slate-500"}`}
                                />
                                <span className="text-[14px] font-bold">
                                  {label}
                                </span>
                                <span className="text-[11px] opacity-60">
                                  {desc}
                                </span>
                              </label>
                            ),
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-[#1a2840]" />

                      {/* Original Price */}
                      <div>
                        <label className={lbl}>
                          <BadgeIndianRupee size={11} /> Original Price (₹)
                        </label>
                        <input
                          type="number"
                          name="price.original"
                          value={formData.price.original}
                          onChange={handleInput}
                          min="1"
                          step="0.01"
                          className={inpLg}
                          placeholder="e.g., 2999"
                        />
                      </div>

                      {/* Sale Price */}
                      <div>
                        <label className={lbl}>
                          <TrendingUp size={11} /> Sale Price (₹)
                        </label>
                        <input
                          type="number"
                          name="price.sale"
                          value={formData.price.sale}
                          onChange={handleInput}
                          min="1"
                          step="0.01"
                          className={inpLg}
                          placeholder="e.g., 999"
                        />
                      </div>

                      {/* Discount badge */}
                      {discountPct !== null && (
                        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                          <TrendingUp
                            size={16}
                            className="text-emerald-400 flex-shrink-0"
                          />
                          <div>
                            <p className="text-[13px] font-bold text-emerald-300">
                              {discountPct}% discount
                            </p>
                            <p className="text-[11px] text-emerald-500/60">
                              Students save ₹
                              {(
                                parseFloat(formData.price.original) -
                                parseFloat(formData.price.sale)
                              ).toFixed(0)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Panel>
            </div>

            {/* SIDEBAR */}
            <div className="space-y-5">
              <Panel>
                <PanelHeader icon={Crown} title="Course Type" color="amber" />
                <div className="p-5 grid grid-cols-2 gap-3">
                  {[
                    {
                      value: "top",
                      label: "⭐ Top Course",
                      desc: "Featured prominently",
                      color: "amber",
                    },
                    {
                      value: "regular",
                      label: "📘 Regular",
                      desc: "Standard listing",
                      color: "cyan",
                    },
                  ].map(({ value, label, desc, color }) => {
                    const active = formData.courseType === value;
                    const c = {
                      amber: active
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                        : "border-[#1a2840] text-slate-500 hover:border-amber-500/20",
                      cyan: active
                        ? "border-[#00d4ff]/40 bg-[#00d4ff]/10 text-[#00d4ff]"
                        : "border-[#1a2840] text-slate-500 hover:border-[#00d4ff]/20",
                    }[color];
                    return (
                      <label
                        key={value}
                        className={`flex cursor-pointer flex-col gap-1.5 rounded-xl border p-3.5 transition-all duration-200 ${c}`}
                      >
                        <input
                          type="radio"
                          name="courseType"
                          value={value}
                          checked={formData.courseType === value}
                          onChange={() => {
                            set("courseType", value);
                            toast.success(
                              `${value === "top" ? "Top" : "Regular"} course selected`,
                            );
                          }}
                          className="hidden"
                        />
                        <span className="text-[13px] font-bold">{label}</span>
                        <span className="text-[11px] opacity-60">{desc}</span>
                      </label>
                    );
                  })}
                </div>
              </Panel>

              {/* Price Summary sidebar card */}
              {formData.pricingType === "paid" &&
                formData.price.original &&
                formData.price.sale && (
                  <Panel>
                    <PanelHeader
                      icon={BarChart3}
                      title="Price Summary"
                      color="emerald"
                    />
                    <div className="p-5 space-y-3">
                      {/* Subscription type pill */}
                      <div className="flex justify-between items-center text-[13px]">
                        <span className="text-slate-500">Plan</span>
                        <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 capitalize">
                          {formData.subscriptionType === "1year"
                            ? "1 Year"
                            : formData.subscriptionType === "2year"
                              ? "2 Year"
                              : "Lifetime"}
                        </span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-slate-500">Original</span>
                        <span className="text-slate-300 line-through">
                          ₹
                          {parseFloat(formData.price.original).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-slate-500">Sale Price</span>
                        <span className="text-emerald-400 font-bold">
                          ₹{parseFloat(formData.price.sale).toLocaleString()}
                        </span>
                      </div>
                      {discountPct !== null && (
                        <div className="flex justify-between text-[13px] pt-2 border-t border-[#1a2840]">
                          <span className="text-slate-500">Savings</span>
                          <span className="text-amber-400 font-bold">
                            {discountPct}% off
                          </span>
                        </div>
                      )}
                    </div>
                  </Panel>
                )}
            </div>
          </div>
        );

      /* ────── STEP 4: PUBLISH ────── */
      case 4:
        return (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
            <div className="space-y-5">
              {/* Preview Card */}
              <Panel glow="bg-[#00d4ff]">
                <PanelHeader
                  icon={Eye}
                  title="Course Preview"
                  subtitle="Review before publishing"
                  color="cyan"
                />
                <div className="p-6 space-y-5">
                  {formData.image && (
                    <div className="rounded-xl overflow-hidden border border-[#1a2840] h-48">
                      <img
                        src={formData.image.preview}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] text-slate-600 uppercase tracking-wider mb-1">
                        Course Title
                      </p>
                      <p className="text-[16px] font-bold text-white">
                        {formData.name || (
                          <span className="text-slate-600 italic">Not set</span>
                        )}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] text-slate-600 uppercase tracking-wider mb-1">
                          Instructor
                        </p>
                        <p className="text-[13px] text-slate-300">
                          {formData.teacher || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-600 uppercase tracking-wider mb-1">
                          Level
                        </p>
                        <p className="text-[13px] text-slate-300 capitalize">
                          {formData.level}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-600 uppercase tracking-wider mb-1">
                          Language
                        </p>
                        <p className="text-[13px] text-slate-300">
                          {formData.language}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-600 uppercase tracking-wider mb-1">
                          Pricing
                        </p>
                        <p className="text-[13px] text-slate-300 capitalize">
                          {formData.pricingType === "free"
                            ? "Free"
                            : `₹${formData.price.sale} (was ₹${formData.price.original}) · ${
                                formData.subscriptionType === "1year"
                                  ? "1 Year"
                                  : formData.subscriptionType === "2year"
                                    ? "2 Year"
                                    : "Lifetime"
                              }`}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-600 uppercase tracking-wider mb-1">
                          Sections
                        </p>
                        <p className="text-[13px] text-slate-300">
                          {stats.totalLectures} · {totalChapters} lessons
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-600 uppercase tracking-wider mb-1">
                          Duration
                        </p>
                        <p className="text-[13px] text-slate-300">
                          {formatDuration(stats.totalDuration) || "—"}
                        </p>
                      </div>
                    </div>
                    {formData.overview && (
                      <div>
                        <p className="text-[11px] text-slate-600 uppercase tracking-wider mb-1">
                          Overview
                        </p>
                        <p className="text-[13px] text-slate-400 leading-relaxed line-clamp-3">
                          {formData.overview}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Panel>

              {/* Publish Toggle */}
              <Panel>
                <PanelHeader
                  icon={Globe}
                  title="Visibility Settings"
                  subtitle="Choose when your course goes live"
                  color={formData.isPublished ? "emerald" : "orange"}
                />
                <div className="p-5 space-y-4">
                  <PublishToggle
                    isPublished={formData.isPublished}
                    onChange={(val) => {
                      set("isPublished", val);
                      toast.success(
                        val
                          ? "Course set to Publish 🌐"
                          : "Course set to Draft 🔒",
                      );
                    }}
                  />
                  <div
                    className={`rounded-xl border p-4 text-[12px] leading-relaxed transition-all duration-300 ${
                      formData.isPublished
                        ? "border-emerald-500/15 bg-emerald-500/5 text-emerald-300/70"
                        : "border-orange-500/15 bg-orange-500/5 text-orange-300/70"
                    }`}
                  >
                    {formData.isPublished
                      ? "✅ After submitting, your course will be immediately visible to students on the platform. You can unpublish anytime from the course list."
                      : "📝 Your course will be saved but hidden from students. You can publish it later from the Course Catalog → Edit → Visibility tab."}
                  </div>
                </div>
              </Panel>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-2xl px-6 py-5 text-[15px] font-black transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: formData.isPublished
                    ? "linear-gradient(135deg, #10b981, #06b6d4)"
                    : "linear-gradient(135deg, #f97316, #f59e0b)",
                }}
              >
                <div className="absolute inset-0 -skew-x-12 -translate-x-full bg-white/20 group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2 text-[#04080f]">
                  {loading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-[#04080f]/30 border-t-[#04080f] animate-spin" />{" "}
                      {formData.isPublished ? "Publishing…" : "Saving…"}
                    </>
                  ) : formData.isPublished ? (
                    <>
                      <Globe size={18} /> Publish Course Now
                    </>
                  ) : (
                    <>
                      <Lock size={18} /> Save as Draft
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* SIDEBAR — step 4 */}
            <div className="space-y-5">
              <Panel>
                <PanelHeader
                  icon={Shield}
                  title="Publish Checklist"
                  color="cyan"
                />
                <div className="p-5 space-y-2.5">
                  {checklistItems.map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <div
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-colors ${done ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/10 text-rose-500"}`}
                      >
                        {done ? <CheckCircle2 size={12} /> : <X size={12} />}
                      </div>
                      <span
                        className={`text-[12px] ${done ? "text-slate-300" : "text-rose-400"}`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                  <div className="mt-4 pt-3 border-t border-[#1a2840]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-slate-600">
                        Completion
                      </span>
                      <span
                        className={`text-[11px] font-bold ${completionPct === 100 ? "text-emerald-400" : "text-[#00d4ff]"}`}
                      >
                        {completionPct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#1a2840] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${completionPct === 100 ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-[#00d4ff] to-blue-500"}`}
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                    {completionPct < 100 && (
                      <p className="mt-2 text-[11px] text-rose-400">
                        Complete all items before publishing
                      </p>
                    )}
                  </div>
                </div>
              </Panel>
              <Panel>
                <div className="p-5">
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-3">
                    Quick Status
                  </p>
                  <div
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                      formData.isPublished
                        ? "border-emerald-500/25 bg-emerald-500/8"
                        : "border-orange-500/20 bg-orange-500/5"
                    }`}
                  >
                    <div
                      className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                        formData.isPublished
                          ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse"
                          : "bg-orange-400"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-[13px] font-bold ${formData.isPublished ? "text-emerald-300" : "text-orange-300"}`}
                      >
                        {formData.isPublished
                          ? "Will go Live"
                          : "Will save as Draft"}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {formData.isPublished
                          ? "Students can enroll after submit"
                          : "Change in Visibility Settings"}
                      </p>
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#04080f] text-white font-['Inter',sans-serif]">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#0d1b2e",
            color: "#e2e8f0",
            border: "1px solid #1a2840",
            borderRadius: "12px",
            fontSize: "13px",
          },
        }}
      />

      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-96 w-96 bg-[#00d4ff]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 h-96 w-96 bg-violet-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-0 h-64 w-64 bg-emerald-500/3 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#1a2840] bg-[#04080f]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#00d4ff] to-blue-600 shadow-lg shadow-[#00d4ff]/20">
              <Sparkles size={15} className="text-white" />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[13px] text-slate-500">Dashboard</span>
              <ChevronRight size={14} className="text-slate-700" />
              <span className="text-[13px] font-semibold text-white">
                New Course
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-4">
            {steps.map((s, i) => (
              <React.Fragment key={s.n}>
                <StepBadge
                  n={s.n}
                  label={s.label}
                  active={activeStep === s.n}
                  done={activeStep > s.n}
                  onClick={() => goToStep(s.n)}
                />
                {i < steps.length - 1 && (
                  <div
                    className={`hidden sm:block h-px w-8 transition-colors ${activeStep > s.n ? "bg-emerald-500/40" : "bg-[#1a2840]"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={activeStep === 4 ? handleSubmit : handleNext}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-blue-500 px-5 py-2 text-[13px] font-bold text-[#04080f] transition hover:opacity-90 shadow-lg shadow-[#00d4ff]/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-[#04080f]/30 border-t-[#04080f] animate-spin" />{" "}
                Publishing...
              </>
            ) : activeStep === 4 ? (
              <>
                <Zap size={14} />{" "}
                {formData.isPublished ? "Publish" : "Save Draft"}
              </>
            ) : (
              <>
                Next <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="mx-auto max-w-6xl px-6 py-8">
          {renderStepContent()}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={activeStep === 1}
              className="flex items-center gap-2 rounded-xl border border-[#1a2840] bg-[#0d1b2e] px-5 py-2.5 text-[13px] font-semibold text-slate-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} /> Back
            </button>
            <div className="flex items-center gap-2">
              {steps.map((s) => (
                <div
                  key={s.n}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeStep === s.n
                      ? "w-6 bg-[#00d4ff]"
                      : activeStep > s.n
                        ? "w-1.5 bg-emerald-500/60"
                        : "w-1.5 bg-[#1a2840]"
                  }`}
                />
              ))}
            </div>
            {activeStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-blue-500 px-5 py-2.5 text-[13px] font-bold text-[#04080f] hover:opacity-90 transition"
              >
                Continue <ChevronRight size={15} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold text-[#04080f] hover:opacity-90 transition disabled:opacity-50"
                style={{
                  background: formData.isPublished
                    ? "linear-gradient(135deg,#10b981,#06b6d4)"
                    : "linear-gradient(135deg,#f97316,#f59e0b)",
                }}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-[#04080f]/30 border-t-[#04080f] animate-spin" />{" "}
                    {formData.isPublished ? "Publishing…" : "Saving…"}
                  </>
                ) : formData.isPublished ? (
                  <>
                    <Globe size={15} /> Publish Course
                  </>
                ) : (
                  <>
                    <Lock size={15} /> Save Draft
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* SECTION MODAL */}
      {showLectureModal && (
        <Modal
          title="Add New Section"
          icon={Layers}
          color="cyan"
          onClose={() => setShowLectureModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className={lbl}>Section Title *</label>
              <input
                type="text"
                value={currentLecture.title}
                onChange={(e) =>
                  setCurrentLecture((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g., Getting Started"
                className={inpLg}
                autoFocus
              />
            </div>
            <div>
              <label className={lbl}>Duration (if no lessons yet)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    value={currentLecture.duration.hours}
                    min="0"
                    onChange={(e) =>
                      setCurrentLecture((p) => ({
                        ...p,
                        duration: { ...p.duration, hours: e.target.value },
                      }))
                    }
                    placeholder="0"
                    className={inp}
                  />
                  <p className="mt-1 text-[11px] text-slate-700 pl-1">Hours</p>
                </div>
                <div>
                  <input
                    type="number"
                    value={currentLecture.duration.minutes}
                    min="0"
                    max="59"
                    onChange={(e) =>
                      setCurrentLecture((p) => ({
                        ...p,
                        duration: { ...p.duration, minutes: e.target.value },
                      }))
                    }
                    placeholder="0"
                    className={inp}
                  />
                  <p className="mt-1 text-[11px] text-slate-700 pl-1">
                    Minutes
                  </p>
                </div>
              </div>
            </div>
            {currentLecture.chapters.length > 0 && (
              <div className="rounded-xl border border-[#1a2840] bg-[#060f1e] p-4">
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-3">
                  {currentLecture.chapters.length} lesson
                  {currentLecture.chapters.length !== 1 ? "s" : ""} in draft
                </p>
                <div className="space-y-2">
                  {currentLecture.chapters.map((ch) => (
                    <div
                      key={ch.id}
                      className="flex items-center gap-2 text-[12px] text-slate-400"
                    >
                      <Play size={11} className="text-slate-600" /> {ch.name} ·{" "}
                      {formatDuration(ch.duration)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedLectureIndex(null);
                setShowChapterModal(true);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-2.5 text-[12px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
            >
              <Plus size={14} /> Add Lesson to this Section
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={addLecture}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#00d4ff] to-blue-500 py-3 text-[13px] font-bold text-[#04080f] hover:opacity-90 transition"
              >
                Add Section
              </button>
              <button
                type="button"
                onClick={() => setShowLectureModal(false)}
                className="flex-1 rounded-xl border border-[#1a2840] bg-[#0d1b2e] py-3 text-[13px] font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* LESSON MODAL */}
      {showChapterModal && (
        <Modal
          title={
            selectedLectureIndex !== null
              ? "Add Lesson to Section"
              : "Add Lesson to Draft"
          }
          icon={Play}
          color="emerald"
          onClose={() => {
            setShowChapterModal(false);
            setSelectedLectureIndex(null);
          }}
        >
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Lesson Title *</label>
                <input
                  type="text"
                  value={currentChapter.name}
                  onChange={(e) =>
                    setCurrentChapter((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g., Setting Up Environment"
                  className={inp}
                  autoFocus
                />
              </div>
              <div>
                <label className={lbl}>Topic / Description *</label>
                <input
                  type="text"
                  value={currentChapter.topic}
                  onChange={(e) =>
                    setCurrentChapter((p) => ({ ...p, topic: e.target.value }))
                  }
                  placeholder="Brief topic description"
                  className={inp}
                />
              </div>
            </div>
            <div>
              <label className={lbl}>
                <Clock size={11} /> Duration *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    value={currentChapter.duration.hours}
                    min="0"
                    onChange={(e) =>
                      setCurrentChapter((p) => ({
                        ...p,
                        duration: { ...p.duration, hours: e.target.value },
                      }))
                    }
                    placeholder="0"
                    className={inp}
                  />
                  <p className="mt-1 text-[11px] text-slate-700 pl-1">Hours</p>
                </div>
                <div>
                  <input
                    type="number"
                    value={currentChapter.duration.minutes}
                    min="0"
                    max="59"
                    onChange={(e) =>
                      setCurrentChapter((p) => ({
                        ...p,
                        duration: { ...p.duration, minutes: e.target.value },
                      }))
                    }
                    placeholder="0"
                    className={inp}
                  />
                  <p className="mt-1 text-[11px] text-slate-700 pl-1">
                    Minutes
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label className={lbl}>
                <Link2 size={11} /> Video URL *
              </label>
              <input
                type="url"
                value={currentChapter.videoUrl}
                onChange={(e) =>
                  setCurrentChapter((p) => ({ ...p, videoUrl: e.target.value }))
                }
                placeholder="https://youtube.com/watch?v=… or HLS URL"
                className={inp}
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-[#1a2840] bg-[#0a1628]/60 px-4 py-3 hover:border-emerald-500/20 transition">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                  currentChapter.isFree
                    ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                    : "border-[#1e2d40] bg-transparent text-transparent"
                }`}
              >
                <CheckCircle2 size={12} />
              </div>
              <input
                type="checkbox"
                checked={currentChapter.isFree}
                onChange={(e) =>
                  setCurrentChapter((p) => ({ ...p, isFree: e.target.checked }))
                }
                className="hidden"
              />
              <div>
                <p className="text-[13px] font-semibold text-slate-300">
                  Free Preview
                </p>
                <p className="text-[11px] text-slate-600">
                  Students can watch this before enrolling
                </p>
              </div>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={addChapter}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-[13px] font-bold text-white hover:opacity-90 transition"
              >
                Add Lesson
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowChapterModal(false);
                  setSelectedLectureIndex(null);
                }}
                className="flex-1 rounded-xl border border-[#1a2840] bg-[#0d1b2e] py-3 text-[13px] font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AddPage;
