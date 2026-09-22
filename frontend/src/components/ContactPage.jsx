import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Mail,
  User,
  MessageSquare,
  AlignLeft,
  Send,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Loader2,
  Sparkles,
} from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE;

const SUBJECTS = [
  "General Inquiry",
  "Course Guidance",
  "Technical Support",
  "Feedback",
];

const INFO_CARDS = [
  {
    icon: Clock3,
    bg: "bg-cyan-500/10",
    color: "text-cyan-400",
    border: "border-cyan-500/10",
    title: "Quick Support",
    desc: "Dedicated support team ready to help you",
  },
  {
    icon: ShieldCheck,
    bg: "bg-violet-500/10",
    color: "text-violet-400",
    border: "border-violet-500/10",
    title: "Secure Contact",
    desc: "Your data is private & fully encrypted",
  },
  {
    icon: CheckCircle2,
    bg: "bg-emerald-500/10",
    color: "text-emerald-400",
    border: "border-emerald-500/10",
    title: "Fast Response",
    desc: "We reply within a few hours",
  },
];

// ─── Validation ───────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: "", email: "", subject: "", message: "" };

const validators = {
  name: (v) => v.trim().length >= 2,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  subject: (v) => v !== "",
  message: (v) => v.trim().length >= 10,
};

const errorMessages = {
  name: "Full name must be at least 2 characters.",
  email: "Enter a valid email address.",
  subject: "Please select a subject.",
  message: "Message must be at least 10 characters.",
};

// ─── Animated SVG Illustration ────────────────────────────────────────────────
function ContactIllustration() {
  return (
    <svg
      viewBox="0 0 400 300"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="violetGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="envGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f2744" />
          <stop offset="100%" stopColor="#0a1628" />
        </linearGradient>
      </defs>

      <ellipse cx="200" cy="150" rx="130" ry="100" fill="url(#bgGlow)" />
      <ellipse cx="220" cy="160" rx="80" ry="60" fill="url(#violetGlow)" />
      <ellipse
        cx="200"
        cy="148"
        rx="82"
        ry="60"
        fill="none"
        stroke="#1e3a4a"
        strokeWidth="1"
        strokeDasharray="5 7"
      />

      {/* Ripple rings */}
      <circle
        cx="200"
        cy="148"
        r="20"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="1.5"
        opacity="0"
      >
        <animate
          attributeName="r"
          from="20"
          to="88"
          dur="2.4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          from="0.55"
          to="0"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx="200"
        cy="148"
        r="20"
        fill="none"
        stroke="#a78bfa"
        strokeWidth="1"
        opacity="0"
      >
        <animate
          attributeName="r"
          from="20"
          to="88"
          dur="2.4s"
          begin="1.2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          from="0.4"
          to="0"
          dur="2.4s"
          begin="1.2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Floating envelope */}
      <g style={{ animation: "float 3.2s ease-in-out infinite" }}>
        <rect
          x="154"
          y="112"
          width="92"
          height="66"
          rx="8"
          fill="url(#envGrad)"
          stroke="#22d3ee"
          strokeWidth="1.8"
        />
        <polyline
          points="154,112 200,150 246,112"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <line
          x1="154"
          y1="178"
          x2="182"
          y2="152"
          stroke="#22d3ee"
          strokeWidth="0.9"
          strokeOpacity="0.4"
        />
        <line
          x1="246"
          y1="178"
          x2="218"
          y2="152"
          stroke="#22d3ee"
          strokeWidth="0.9"
          strokeOpacity="0.4"
        />
        <circle cx="200" cy="148" r="5" fill="#22d3ee" opacity="0.9" />
        <circle cx="200" cy="148" r="2.5" fill="#ffffff" />
      </g>

      {/* Orbiting envelope icon */}
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 200 148"
          to="360 200 148"
          dur="12s"
          repeatCount="indefinite"
        />
        <rect
          x="272"
          y="141"
          width="16"
          height="13"
          rx="2.5"
          fill="#0f172a"
          stroke="#22d3ee"
          strokeWidth="1.2"
        />
        <line
          x1="280"
          y1="141"
          x2="280"
          y2="154"
          stroke="#22d3ee"
          strokeWidth="0.8"
        />
        <line
          x1="272"
          y1="145"
          x2="279"
          y2="145"
          stroke="#22d3ee"
          strokeWidth="0.6"
          opacity="0.6"
        />
        <line
          x1="272"
          y1="149"
          x2="279"
          y2="149"
          stroke="#22d3ee"
          strokeWidth="0.6"
          opacity="0.6"
        />
      </g>

      {/* Orbiting location pin */}
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="180 200 148"
          to="540 200 148"
          dur="12s"
          repeatCount="indefinite"
        />
        <polygon
          points="118,142 127,137 136,142 127,147"
          fill="#a78bfa"
          opacity="0.85"
        />
        <line
          x1="127"
          y1="147"
          x2="127"
          y2="154"
          stroke="#a78bfa"
          strokeWidth="1.2"
          opacity="0.75"
        />
        <line
          x1="127"
          y1="154"
          x2="131"
          y2="158"
          stroke="#a78bfa"
          strokeWidth="1"
          opacity="0.6"
        />
      </g>

      {/* Floating dots */}
      {[
        {
          cx: 108,
          cy: 95,
          r: 3.5,
          fill: "#a78bfa",
          op: 0.7,
          vals: " 95; 82; 95",
          dur: "2.8s",
        },
        {
          cx: 304,
          cy: 110,
          r: 2.5,
          fill: "#22d3ee",
          op: 0.6,
          vals: "110; 96;110",
          dur: "3.2s",
          begin: "0.6s",
        },
        {
          cx: 92,
          cy: 195,
          r: 3,
          fill: "#34d399",
          op: 0.5,
          vals: "195;180;195",
          dur: "3.8s",
          begin: "1.2s",
        },
        {
          cx: 320,
          cy: 190,
          r: 2.5,
          fill: "#f472b6",
          op: 0.5,
          vals: "190;177;190",
          dur: "3s",
          begin: "0.4s",
        },
        {
          cx: 160,
          cy: 82,
          r: 2,
          fill: "#fbbf24",
          op: 0.45,
          vals: " 82; 70; 82",
          dur: "4s",
          begin: "0.9s",
        },
        {
          cx: 248,
          cy: 218,
          r: 2,
          fill: "#22d3ee",
          op: 0.35,
          vals: "218;206;218",
          dur: "3.5s",
          begin: "1.6s",
        },
      ].map(({ cx, cy, r, fill, op, vals, dur, begin }, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={fill} opacity={op}>
          <animate
            attributeName="cy"
            values={vals}
            dur={dur}
            begin={begin}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values={`${op};${op * 0.2};${op}`}
            dur={dur}
            begin={begin}
            repeatCount="indefinite"
          />
        </circle>
      ))}

      {/* Brand text */}
      <text
        x="200"
        y="262"
        textAnchor="middle"
        fontSize="11"
        fill="#334155"
        fontFamily="Inter, sans-serif"
        letterSpacing="0.08em"
        fontWeight="500"
      >
        LEARNHUB LMS
      </text>
      <line
        x1="140"
        y1="255"
        x2="178"
        y2="255"
        stroke="#1e293b"
        strokeWidth="0.8"
      />
      <line
        x1="222"
        y1="255"
        x2="260"
        y2="255"
        stroke="#1e293b"
        strokeWidth="0.8"
      />

      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }`}</style>
    </svg>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, icon: Icon, iconColor, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
        <Icon size={13} aria-hidden="true" className={iconColor} />
        <span className="text-slate-400">{label}</span>
      </label>
      {children}
      <div className="min-h-[16px]">
        {error && (
          <p
            role="alert"
            className="flex items-center gap-1.5 text-xs text-red-400 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <AlertCircle size={11} className="shrink-0" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Styled inputs ─────────────────────────────────────────────────────────────
const focusStyles = {
  cyan: "focus:border-cyan-500   focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)]",
  violet:
    "focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]",
  emerald:
    "focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.1)]",
};

const baseInput =
  "w-full rounded-xl border bg-slate-900/80 px-4 text-sm text-white placeholder:text-slate-600 " +
  "outline-none transition-all duration-200 ring-0 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed";

function StyledInput({
  focusColor = "cyan",
  hasError,
  className = "",
  ...props
}) {
  const focus = focusStyles[focusColor] ?? focusStyles.cyan;
  const border = hasError
    ? "border-red-500/70 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
    : "border-slate-700/60";
  return (
    <input
      {...props}
      className={`${baseInput} h-11 ${border} ${!hasError ? focus : ""} ${className}`}
    />
  );
}

function StyledTextarea({ hasError, className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`${baseInput} py-3 resize-none ${
        hasError
          ? "border-red-500/70 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
          : "border-slate-700/60 focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]"
      } ${className}`}
    />
  );
}

function StyledSelect({ hasError, className = "", ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`${baseInput} h-11 appearance-none pr-10 cursor-pointer ${
          hasError
            ? "border-red-500/70 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
            : "border-slate-700/60 focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)]"
        } ${className}`}
      />
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500"
        aria-hidden="true"
      />
    </div>
  );
}

function CharCount({ value, min = 10, max = 500 }) {
  const len = value.length;
  const color =
    len < min
      ? "text-slate-600"
      : len > max
        ? "text-red-400"
        : "text-emerald-500";
  return (
    <span className={`text-[11px] tabular-nums ml-auto ${color}`}>
      {len}/{max}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ContactPage() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [serverMessage, setServerMessage] = useState("");
  const successRef = useRef(null);

  const getError = useCallback(
    (field) =>
      touched[field] && !validators[field](formData[field])
        ? errorMessages[field]
        : "",
    [formData, touched],
  );

  const isFormValid = Object.keys(validators).every((k) =>
    validators[k](formData[k]),
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  // ── API Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });
    if (!isFormValid) return;

    setStatus("sending");
    setServerMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setServerMessage(data.message || "Message sent successfully!");
        setFormData(EMPTY_FORM);
        setTouched({});
        setTimeout(() => setStatus("idle"), 7000);
      } else {
        setStatus("error");
        setServerMessage(
          data.message || "Something went wrong. Please try again.",
        );
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch {
      setStatus("error");
      setServerMessage(
        "Cannot connect to server. Check your internet or try again later.",
      );
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  useEffect(() => {
    if (status === "success" && successRef.current) {
      successRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [status]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <section className="relative min-h-screen overflow-x-hidden bg-[#030b18] py-10 text-white selection:bg-cyan-500/30">
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-cyan-600/6 blur-[140px]" />
        <div className="absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full bg-violet-600/6 blur-[140px]" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-sky-600/4 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.028]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(148,163,184,0.8) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      </div>

      {/* Container */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <header className="mx-auto mb-16 max-w-2xl text-center">
          <h1 className="mb-5 text-[clamp(1.5rem,3vw,1.9rem)] font-extrabold leading-[1.08] tracking-[-0.03em]">
            Got a Question?{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                We're Right Here.
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-cyan-500/50 via-sky-400/50 to-violet-500/50" />
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles
              size={13}
              className="text-cyan-400/70"
              aria-hidden="true"
            />
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-cyan-400/70">
              Courses · Mentorship · Career · Tech
            </p>
            <Sparkles
              size={13}
              className="text-cyan-400/70"
              aria-hidden="true"
            />
          </div>
          <p className="text-[15px] leading-relaxed text-slate-400">
            Drop us a message and our team will get back to you{" "}
            <span className="font-medium text-slate-300">
              within a few hours
            </span>
            .
          </p>
        </header>

        {/* ── Two-column grid ───────────────────────────────────────────────── */}
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr] xl:gap-12">
          {/* ── Left panel ──────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Illustration */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 backdrop-blur-xl transition-all duration-500 hover:border-cyan-500/20 hover:bg-white/[0.035]">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/3 via-transparent to-violet-500/3 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative h-[320px] md:h-[360px]">
                <ContactIllustration />
              </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {INFO_CARDS.map(
                ({ icon: Icon, bg, color, border, title, desc }) => (
                  <div
                    key={title}
                    className={`group relative overflow-hidden rounded-xl border ${border} bg-white/[0.025] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.04] hover:shadow-lg hover:shadow-black/20`}
                  >
                    <div
                      className={`mb-3 inline-flex rounded-lg p-2.5 ${bg} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
                    </div>
                    <h4 className="mb-1 text-[13px] font-semibold leading-tight text-white">
                      {title}
                    </h4>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      {desc}
                    </p>
                  </div>
                ),
              )}
            </div>

            {/* Email strip */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-5 py-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
                  <Mail
                    size={15}
                    className="text-cyan-400"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    Support email
                  </p>
                  <a
                    href="mailto:sk9414681@gmail.com"
                    className="text-[13px] font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
                  >
                    sk9414681@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── Form panel ──────────────────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] p-7 backdrop-blur-xl sm:p-9">
            <div
              className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-cyan-500/6 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-violet-500/6 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative z-10">
              {/* Panel header */}
              <div className="mb-7 border-b border-white/[0.06] pb-6">
                <h2 className="mb-1.5 text-[1.6rem] font-bold leading-tight tracking-tight">
                  Send Us a Message
                </h2>
                <p className="text-[13px] text-slate-500">
                  Fill in the form — your message lands directly in our inbox.
                </p>
              </div>

              {/* ── Status banners ── */}
              {status === "success" && (
                <div
                  ref={successRef}
                  role="status"
                  aria-live="polite"
                  className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/6 px-4 py-3.5 text-[13px] text-emerald-300 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <CheckCircle2
                    size={15}
                    className="mt-px shrink-0 text-emerald-400"
                  />
                  <span>
                    <strong className="font-semibold">Message sent!</strong>{" "}
                    {serverMessage ||
                      "We'll get back to you within a few hours."}
                  </span>
                </div>
              )}

              {status === "error" && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/6 px-4 py-3.5 text-[13px] text-red-300 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <AlertCircle
                    size={15}
                    className="mt-px shrink-0 text-red-400"
                  />
                  <span>
                    {serverMessage || "Something went wrong. Please try again."}
                  </span>
                </div>
              )}

              {/* ── Form ── */}
              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-4"
                aria-label="Contact form"
              >
                {/* Name + Email */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Full Name"
                    icon={User}
                    iconColor="text-cyan-400"
                    error={getError("name")}
                  >
                    <StyledInput
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Arjun Sharma"
                      autoComplete="name"
                      focusColor="cyan"
                      hasError={!!getError("name")}
                      required
                      aria-required="true"
                      aria-invalid={!!getError("name")}
                    />
                  </Field>

                  <Field
                    label="Email Address"
                    icon={Mail}
                    iconColor="text-violet-400"
                    error={getError("email")}
                  >
                    <StyledInput
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="you@example.com"
                      autoComplete="email"
                      focusColor="violet"
                      hasError={!!getError("email")}
                      required
                      aria-required="true"
                      aria-invalid={!!getError("email")}
                    />
                  </Field>
                </div>

                {/* Subject */}
                <Field
                  label="Subject"
                  icon={MessageSquare}
                  iconColor="text-cyan-400"
                  error={getError("subject")}
                >
                  <StyledSelect
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    aria-required="true"
                    aria-invalid={!!getError("subject")}
                    hasError={!!getError("subject")}
                    style={{
                      color: formData.subject === "" ? "#475569" : "white",
                    }}
                  >
                    <option
                      value=""
                      disabled
                      style={{ color: "#475569", background: "#0f172a" }}
                    >
                      Select a subject…
                    </option>
                    {SUBJECTS.map((s) => (
                      <option
                        key={s}
                        value={s}
                        style={{ color: "white", background: "#0f172a" }}
                      >
                        {s}
                      </option>
                    ))}
                  </StyledSelect>
                </Field>

                {/* Message */}
                <Field
                  label="Message"
                  icon={AlignLeft}
                  iconColor="text-violet-400"
                  error={getError("message")}
                >
                  <div className="relative">
                    <StyledTextarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows={5}
                      required
                      placeholder="Tell us about your query…"
                      hasError={!!getError("message")}
                      aria-required="true"
                      aria-invalid={!!getError("message")}
                      maxLength={500}
                    />
                    <div className="flex items-center justify-end px-1 pt-1">
                      <CharCount value={formData.message} />
                    </div>
                  </div>
                </Field>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  aria-disabled={!isFormValid || status === "sending"}
                  className={[
                    "relative mt-1 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl",
                    "text-[14px] font-semibold tracking-wide text-white",
                    "transition-all duration-300 overflow-hidden",
                    isFormValid && status !== "sending"
                      ? "cursor-pointer bg-gradient-to-r from-cyan-500 to-violet-600 shadow-lg shadow-cyan-600/10 hover:scale-[1.015] hover:shadow-xl hover:shadow-cyan-600/20 active:scale-[0.99]"
                      : "cursor-not-allowed bg-slate-800 text-slate-500",
                  ].join(" ")}
                >
                  {isFormValid && status !== "sending" && (
                    <span
                      className="absolute inset-0 -skew-x-12 translate-x-[-200%] bg-white/10 transition-transform duration-700 hover:translate-x-[200%]"
                      aria-hidden="true"
                    />
                  )}
                  {status === "sending" ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                      <span>Sending your message…</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} aria-hidden="true" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>

              {/* Footer note */}
              <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-cyan-400/10 bg-cyan-400/4 px-4 py-3 text-[12px] leading-relaxed text-slate-400">
                <CheckCircle2
                  size={13}
                  className="mt-0.5 shrink-0 text-cyan-400"
                  aria-hidden="true"
                />
                Your message is delivered directly to our inbox — no email app
                needed. We'll also send you a confirmation at your email
                address.
              </p>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-14 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-6">
          {[
            { icon: ShieldCheck, label: "SSL encrypted" },
            { icon: Clock3, label: "Response within hours" },
            { icon: CheckCircle2, label: "No spam, ever" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-[12px] text-slate-600"
            >
              <Icon size={13} className="text-slate-700" aria-hidden="true" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
