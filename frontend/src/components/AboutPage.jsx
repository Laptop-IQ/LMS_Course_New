import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import AboutBanner from "../assets/AboutBannerImage.png";

import {
  counterTargets,
  statsMeta,
  missionVisionValues,
  values,
} from "../assets/dummyAbout";

import {
  BadgeCheck,
  ShieldUser,
  MessageCircleCode,
  GraduationCap,
  Globe,
  ArrowRight,
  BookOpen,
  Target,
  Lightbulb,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

// ─── Inline SVG Animations (replaces DotLottieReact) ────────────────────────

/** Mission: open book + rising knowledge */
function MissionSVG() {
  return (
    <svg
      viewBox="0 0 320 260"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="mg1" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.13" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="160" cy="160" rx="120" ry="90" fill="url(#mg1)" />

      {/* Animated dots orbiting */}
      <circle cx="80" cy="90" r="3" fill="#22d3ee" opacity="0.6">
        <animate
          attributeName="cy"
          values="90;76;90"
          dur="2.8s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.6;0.15;0.6"
          dur="2.8s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="255" cy="110" r="2.5" fill="#a78bfa" opacity="0.5">
        <animate
          attributeName="cy"
          values="110;96;110"
          dur="3.2s"
          begin="0.7s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.5;0.1;0.5"
          dur="3.2s"
          begin="0.7s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="70" cy="185" r="2" fill="#34d399" opacity="0.45">
        <animate
          attributeName="cy"
          values="185;172;185"
          dur="3.8s"
          begin="1.4s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Book group - floating */}
      <g style={{ animation: "floatAnim 3.4s ease-in-out infinite" }}>
        {/* book spine */}
        <rect x="134" y="95" width="8" height="80" rx="3" fill="#0e7490" />
        {/* left page */}
        <rect
          x="89"
          y="98"
          width="48"
          height="74"
          rx="4 0 0 4"
          fill="#164e63"
          stroke="#22d3ee"
          strokeWidth="1.2"
        />
        {/* right page */}
        <rect
          x="142"
          y="98"
          width="48"
          height="74"
          rx="0 4 4 0"
          fill="#0f3d52"
          stroke="#22d3ee"
          strokeWidth="1.2"
        />
        {/* left page lines */}
        <line
          x1="100"
          y1="116"
          x2="130"
          y2="116"
          stroke="#22d3ee"
          strokeWidth="0.9"
          strokeOpacity="0.45"
        />
        <line
          x1="100"
          y1="126"
          x2="130"
          y2="126"
          stroke="#22d3ee"
          strokeWidth="0.9"
          strokeOpacity="0.45"
        />
        <line
          x1="100"
          y1="136"
          x2="130"
          y2="136"
          stroke="#22d3ee"
          strokeWidth="0.9"
          strokeOpacity="0.45"
        />
        <line
          x1="100"
          y1="146"
          x2="120"
          y2="146"
          stroke="#22d3ee"
          strokeWidth="0.9"
          strokeOpacity="0.3"
        />
        {/* right page lines */}
        <line
          x1="150"
          y1="116"
          x2="180"
          y2="116"
          stroke="#22d3ee"
          strokeWidth="0.9"
          strokeOpacity="0.45"
        />
        <line
          x1="150"
          y1="126"
          x2="180"
          y2="126"
          stroke="#22d3ee"
          strokeWidth="0.9"
          strokeOpacity="0.45"
        />
        <line
          x1="150"
          y1="136"
          x2="180"
          y2="136"
          stroke="#22d3ee"
          strokeWidth="0.9"
          strokeOpacity="0.45"
        />
        <line
          x1="150"
          y1="146"
          x2="168"
          y2="146"
          stroke="#22d3ee"
          strokeWidth="0.9"
          strokeOpacity="0.3"
        />
        {/* bookmark */}
        <polygon
          points="175,98 183,98 183,116 179,112 175,116"
          fill="#06b6d4"
          opacity="0.8"
        />
      </g>

      {/* Rising star burst above book */}
      <g opacity="0.9">
        <circle
          cx="160"
          cy="76"
          r="10"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 160 76"
            to="360 160 76"
            dur="8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="160" cy="76" r="4" fill="#22d3ee">
          <animate
            attributeName="r"
            values="4;5.5;4"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.9;0.5;0.9"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </g>

      {/* Label */}
      <text
        x="160"
        y="208"
        textAnchor="middle"
        fontSize="11"
        fill="#334155"
        fontFamily="Inter,sans-serif"
        letterSpacing="0.08em"
        fontWeight="500"
      >
        MISSION
      </text>
      <style>{`@keyframes floatAnim{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </svg>
  );
}

/** Vision: telescope / target crosshair */
function VisionSVG() {
  return (
    <svg
      viewBox="0 0 320 260"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="vg1" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.13" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="160" cy="150" rx="115" ry="85" fill="url(#vg1)" />

      {/* Crosshair rings */}
      <circle
        cx="160"
        cy="140"
        r="72"
        fill="none"
        stroke="#7c3aed"
        strokeWidth="0.8"
        strokeOpacity="0.25"
      />
      <circle
        cx="160"
        cy="140"
        r="52"
        fill="none"
        stroke="#a78bfa"
        strokeWidth="0.8"
        strokeOpacity="0.3"
      />
      <circle
        cx="160"
        cy="140"
        r="32"
        fill="none"
        stroke="#a78bfa"
        strokeWidth="1"
        strokeOpacity="0.45"
      />
      {/* Pulsing outer ring */}
      <circle
        cx="160"
        cy="140"
        r="20"
        fill="none"
        stroke="#a78bfa"
        strokeWidth="1.5"
        opacity="0"
      >
        <animate
          attributeName="r"
          from="20"
          to="80"
          dur="2.6s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          from="0.55"
          to="0"
          dur="2.6s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Crosshair lines */}
      <line
        x1="160"
        y1="68"
        x2="160"
        y2="110"
        stroke="#a78bfa"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      <line
        x1="160"
        y1="170"
        x2="160"
        y2="212"
        stroke="#a78bfa"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      <line
        x1="88"
        y1="140"
        x2="128"
        y2="140"
        stroke="#a78bfa"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      <line
        x1="192"
        y1="140"
        x2="232"
        y2="140"
        stroke="#a78bfa"
        strokeWidth="1"
        strokeOpacity="0.5"
      />

      {/* Center bull's-eye - floating */}
      <g style={{ animation: "floatV 3.6s ease-in-out infinite" }}>
        <circle
          cx="160"
          cy="140"
          r="16"
          fill="#1e1b4b"
          stroke="#7c3aed"
          strokeWidth="2"
        />
        <circle
          cx="160"
          cy="140"
          r="8"
          fill="#4c1d95"
          stroke="#a78bfa"
          strokeWidth="1.5"
        />
        <circle cx="160" cy="140" r="4" fill="#a78bfa" />
      </g>

      {/* Orbiting dots */}
      <circle cx="100" cy="88" r="2.5" fill="#a78bfa" opacity="0.55">
        <animate
          attributeName="cy"
          values="88;76;88"
          dur="3s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.55;0.1;0.55"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="248" cy="170" r="2" fill="#c4b5fd" opacity="0.45">
        <animate
          attributeName="cy"
          values="170;158;170"
          dur="3.4s"
          begin="0.9s"
          repeatCount="indefinite"
        />
      </circle>

      <text
        x="160"
        y="228"
        textAnchor="middle"
        fontSize="11"
        fill="#334155"
        fontFamily="Inter,sans-serif"
        letterSpacing="0.08em"
        fontWeight="500"
      >
        VISION
      </text>
      <style>{`@keyframes floatV{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </svg>
  );
}

/** Values: lightbulb / growth chart */
function ValuesSVG() {
  return (
    <svg
      viewBox="0 0 320 260"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="vvg1" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="160" cy="148" rx="118" ry="88" fill="url(#vvg1)" />

      {/* Chart bars growing */}
      <g>
        <rect
          x="86"
          y="180"
          width="22"
          height="0"
          fill="#0d9488"
          rx="3"
          opacity="0.8"
        >
          <animate
            attributeName="height"
            values="0;44;44"
            dur="1.5s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25 0.1 0.25 1"
          />
          <animate
            attributeName="y"
            values="180;136;136"
            dur="1.5s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25 0.1 0.25 1"
          />
        </rect>
        <rect
          x="118"
          y="180"
          width="22"
          height="0"
          fill="#0891b2"
          rx="3"
          opacity="0.8"
        >
          <animate
            attributeName="height"
            values="0;62;62"
            dur="1.5s"
            begin="0.2s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25 0.1 0.25 1"
          />
          <animate
            attributeName="y"
            values="180;118;118"
            dur="1.5s"
            begin="0.2s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25 0.1 0.25 1"
          />
        </rect>
        <rect
          x="150"
          y="180"
          width="22"
          height="0"
          fill="#7c3aed"
          rx="3"
          opacity="0.8"
        >
          <animate
            attributeName="height"
            values="0;80;80"
            dur="1.5s"
            begin="0.4s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25 0.1 0.25 1"
          />
          <animate
            attributeName="y"
            values="180;100;100"
            dur="1.5s"
            begin="0.4s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25 0.1 0.25 1"
          />
        </rect>
        <rect
          x="182"
          y="180"
          width="22"
          height="0"
          fill="#0891b2"
          rx="3"
          opacity="0.8"
        >
          <animate
            attributeName="height"
            values="0;56;56"
            dur="1.5s"
            begin="0.6s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25 0.1 0.25 1"
          />
          <animate
            attributeName="y"
            values="180;124;124"
            dur="1.5s"
            begin="0.6s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25 0.1 0.25 1"
          />
        </rect>
        <rect
          x="214"
          y="180"
          width="22"
          height="0"
          fill="#34d399"
          rx="3"
          opacity="0.8"
        >
          <animate
            attributeName="height"
            values="0;70;70"
            dur="1.5s"
            begin="0.8s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25 0.1 0.25 1"
          />
          <animate
            attributeName="y"
            values="180;110;110"
            dur="1.5s"
            begin="0.8s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25 0.1 0.25 1"
          />
        </rect>
        {/* Base line */}
        <line
          x1="80"
          y1="180"
          x2="244"
          y2="180"
          stroke="#1e3a4a"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* Trend line */}
      <polyline
        points="97,160 129,142 161,118 193,130 225,114"
        fill="none"
        stroke="#34d399"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="120"
        strokeDashoffset="120"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="120"
          to="0"
          dur="1.8s"
          begin="1s"
          fill="freeze"
        />
      </polyline>

      {/* Floating lightbulb above */}
      <g style={{ animation: "floatVV 3.2s ease-in-out infinite" }}>
        <ellipse
          cx="160"
          cy="68"
          rx="16"
          ry="19"
          fill="#0f172a"
          stroke="#34d399"
          strokeWidth="1.5"
        />
        <path
          d="M150 82 Q160 90 170 82"
          fill="none"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="155"
          y1="87"
          x2="165"
          y2="87"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="157"
          y1="91"
          x2="163"
          y2="91"
          stroke="#34d399"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.7"
        />
        <circle cx="160" cy="62" r="5" fill="#34d399" opacity="0.85">
          <animate
            attributeName="opacity"
            values="0.85;0.4;0.85"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        {/* glow spokes */}
        <line
          x1="160"
          y1="44"
          x2="160"
          y2="50"
          stroke="#34d399"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.5"
        >
          <animate
            attributeName="opacity"
            values="0.5;0.1;0.5"
            dur="2s"
            repeatCount="indefinite"
          />
        </line>
        <line
          x1="143"
          y1="50"
          x2="147"
          y2="54"
          stroke="#34d399"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.4"
        >
          <animate
            attributeName="opacity"
            values="0.4;0.08;0.4"
            dur="2s"
            begin="0.3s"
            repeatCount="indefinite"
          />
        </line>
        <line
          x1="177"
          y1="50"
          x2="173"
          y2="54"
          stroke="#34d399"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.4"
        >
          <animate
            attributeName="opacity"
            values="0.4;0.08;0.4"
            dur="2s"
            begin="0.6s"
            repeatCount="indefinite"
          />
        </line>
      </g>

      <text
        x="160"
        y="214"
        textAnchor="middle"
        fontSize="11"
        fill="#334155"
        fontFamily="Inter,sans-serif"
        letterSpacing="0.08em"
        fontWeight="500"
      >
        VALUES
      </text>
      <style>{`@keyframes floatVV{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </svg>
  );
}

// Map section type → illustration
const SECTION_SVG = {
  mission: MissionSVG,
  vision: VisionSVG,
  values: ValuesSVG,
};

// Fallback icon map for missionVisionValues if section.icon is a string
const SECTION_ICONS = {
  mission: BookOpen,
  vision: Target,
  values: Lightbulb,
};

// ─── Intersection Observer hook ───────────────────────────────────────────────
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, ...options },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

// ─── Animated counter section ─────────────────────────────────────────────────
function StatsSection({ statsMeta, counterValues }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsMeta.slice(0, 4).map((stat, i) => (
        <div
          key={i}
          className="
            rounded-xl border border-white/10 bg-white/5
            p-6 backdrop-blur-xl
            transition-all duration-500
            hover:-translate-y-1 hover:border-cyan-400/25
          "
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s, border-color 0.3s, box-shadow 0.3s`,
          }}
        >
          <h3 className="mb-1 text-3xl font-black tabular-nums text-cyan-400 leading-none">
            {stat.key === "successRate"
              ? `${counterValues.successRate}%`
              : stat.key === "support"
                ? "24/7"
                : `${counterValues[stat.key]?.toLocaleString()}+`}
          </h3>
          <p className="mt-2 text-sm text-slate-400 leading-snug">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Value card ───────────────────────────────────────────────────────────────
function ValueCard({ value, index }) {
  const [ref, inView] = useInView();
  const accentColors = [
    "from-cyan-500 to-blue-600",
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
  ];
  return (
    <div
      ref={ref}
      className="
        group relative overflow-hidden rounded-xl
        border border-white/10 bg-white/5 p-6
        backdrop-blur-xl transition-all duration-500
        hover:-translate-y-2 hover:border-white/20
        hover:shadow-xl hover:shadow-black/30
      "
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.55s ease ${index * 0.12}s, transform 0.55s ease ${index * 0.12}s`,
      }}
    >
      {/* Bottom accent bar */}
      <div
        className={`absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r ${accentColors[index % accentColors.length]} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />

      <h3 className="mb-3 text-xl font-bold leading-tight">{value.title}</h3>
      <p className="mb-5 text-sm leading-7 text-slate-400">
        {value.description}
      </p>

      <ul className="space-y-2.5">
        {value.features.map((feature, idx) => (
          <li
            key={idx}
            className="flex items-center gap-3 text-sm text-slate-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AboutPage = () => {
  const [counterValues, setCounterValues] = useState({
    students: 0,
    courses: 0,
    successRate: 0,
    countries: 0,
    certificates: 0,
    support: 0,
  });

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    const timers = [];

    Object.keys(counterTargets).forEach((key) => {
      let current = 0;
      const target = counterTargets[key];
      const increment = target / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setCounterValues((prev) => ({ ...prev, [key]: Math.floor(current) }));
      }, stepDuration);

      timers.push(timer);
    });

    return () => timers.forEach((t) => clearInterval(t));
  }, []);

  return (
    <>
      <Navbar />

      <div className="overflow-hidden bg-[#030712] text-white">
        {/* ══════════════════════════════════════════════════ */}
        {/* HERO */}
        {/* ══════════════════════════════════════════════════ */}
        <section className="relative min-h-screen overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src={AboutBanner}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#0b1020]/85 to-[#030712]" />
            <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[130px]" />
            <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-indigo-500/15 blur-[130px]" />
            {/* Dot grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(148,163,184,0.8) 1px,transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24">
            {/* Badge */}
            <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/8 px-5 py-2.5 text-[13px] font-semibold text-cyan-200 backdrop-blur-sm">
              <GraduationCap size={15} />
              Trusted by 50,000+ learners worldwide
            </div>

            {/* Heading */}
            <h1 className="max-w-3xl text-[clamp(2.4rem,6vw,4rem)] font-black leading-[1.06] tracking-[-0.03em]">
              About{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                  LearnHub LMS
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-cyan-500/50 to-blue-500/30" />
              </span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-2xl text-[17px] leading-8 text-slate-300">
              Empowering learners through modern education, expert mentorship,
              and industry-ready experiences designed for real career success.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="/courses"
                className="
                  flex items-center gap-2 rounded-xl
                  bg-gradient-to-r from-cyan-500 to-blue-600
                  px-7 py-3.5 text-[15px] font-semibold
                  shadow-lg shadow-cyan-500/20
                  transition-all duration-300
                  hover:scale-[1.03] hover:shadow-xl hover:shadow-cyan-500/30
                  active:scale-[0.99]
                "
              >
                Explore Courses
                <ArrowRight size={16} />
              </a>
              <a
                href="/contact"
                className="
                  flex items-center gap-2 rounded-xl
                  border border-white/12 bg-white/6
                  px-7 py-3.5 text-[15px] font-semibold
                  backdrop-blur-sm transition-all duration-300
                  hover:border-cyan-400/35 hover:bg-cyan-500/10
                "
              >
                Contact Us
                <ChevronRight size={16} className="text-slate-400" />
              </a>
            </div>

            {/* Stats */}
            <StatsSection statsMeta={statsMeta} counterValues={counterValues} />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════ */}
        {/* MISSION / VISION / VALUES (missionVisionValues) */}
        {/* ══════════════════════════════════════════════════ */}
        {missionVisionValues.map((section, index) => {
          const IllustrationComponent = SECTION_SVG[section.type] || MissionSVG;
          const IconComponent =
            typeof section.icon === "function"
              ? section.icon
              : SECTION_ICONS[section.type] || BookOpen;

          const [ref, inView] = [useRef(null), true]; // sections always visible

          return (
            <section key={section.type} className="relative py-24">
              {/* subtle section glow */}
              <div
                className={`pointer-events-none absolute inset-0 ${
                  index % 2 === 0
                    ? "bg-gradient-to-r from-cyan-500/3 via-transparent to-transparent"
                    : "bg-gradient-to-l from-violet-500/3 via-transparent to-transparent"
                }`}
              />

              <div className="relative z-10 mx-auto max-w-6xl px-6">
                <div
                  className={`grid items-center gap-14 lg:grid-cols-2 ${
                    index % 2 === 1 ? "lg:grid-flow-dense" : ""
                  }`}
                >
                  {/* Illustration */}
                  <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-500 hover:border-cyan-400/20 hover:bg-white/[0.05]">
                      {/* Corner glow */}
                      <div className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-cyan-500/8 blur-3xl" />
                      <div className="h-[280px] sm:h-[320px]">
                        <IllustrationComponent />
                      </div>
                    </div>
                  </div>

                  {/* Text content */}
                  <div className={index % 2 === 1 ? "lg:col-start-1" : ""}>
                    {/* Eyebrow badge */}
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-[13px] font-medium text-cyan-300">
                      <IconComponent size={15} />
                      {section.subtitle}
                    </div>

                    <h2 className="mb-5 text-[clamp(1.8rem,4vw,2.8rem)] font-black leading-[1.1] tracking-[-0.02em]">
                      {section.title}
                    </h2>

                    <p className="mb-8 text-[16px] leading-8 text-slate-400">
                      {section.description}
                    </p>

                    {/* Feature list */}
                    <div className="space-y-3.5">
                      {section.features.map((feature, fi) => (
                        <div key={fi} className="flex items-start gap-3.5">
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/12">
                            <BadgeCheck size={14} className="text-cyan-400" />
                          </div>
                          <span className="text-[15px] leading-relaxed text-slate-300">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        {/* ══════════════════════════════════════════════════ */}
        {/* CORE VALUES */}
        {/* ══════════════════════════════════════════════════ */}
        <section className="relative py-24">
          {/* Section background accent */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.018] to-transparent" />

          <div className="relative z-10 mx-auto max-w-6xl px-6">
            {/* Header */}
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-5 py-2.5 text-[13px] font-semibold text-cyan-300">
                <ShieldUser size={15} />
                Our Core Values
              </div>
              <h2 className="mb-4 text-[clamp(1.9rem,4vw,2.8rem)] font-black leading-tight tracking-[-0.02em]">
                Principles That Drive Us
              </h2>
              <p className="text-[16px] leading-8 text-slate-400">
                Everything we build at LearnHub is guided by these values.
              </p>
            </div>

            {/* Cards */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {values.map((value, i) => (
                <ValueCard key={i} value={value} index={i} />
              ))}
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════ */}
        {/* CTA */}
        {/* ══════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden py-28">
          {/* Glows */}
          <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/12 blur-[130px]" />
          <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-indigo-500/12 blur-[130px]" />

          <div className="relative z-10 mx-auto max-w-6xl px-6">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/8 via-blue-500/6 to-indigo-500/8 p-10 text-center backdrop-blur-xl md:p-14">
              {/* Top separator */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-5 py-2.5 text-[13px] font-semibold text-cyan-300">
                <Globe size={15} />
                Start Your Learning Journey
              </div>

              <h2 className="mb-5 text-[clamp(2rem,5vw,3.5rem)] font-black leading-[1.08] tracking-[-0.03em]">
                Ready to Transform
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {" "}
                  Your Future?
                </span>
              </h2>

              <p className="mx-auto mb-10 max-w-2xl text-[16px] leading-8 text-slate-300">
                Join millions of learners worldwide and gain industry-ready
                skills with LearnHub LMS.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="/contact"
                  className="
                    flex items-center gap-2 rounded-xl
                    bg-gradient-to-r from-cyan-500 to-blue-600
                    px-7 py-3.5 text-[15px] font-semibold
                    shadow-lg shadow-cyan-500/20
                    transition-all duration-300
                    hover:scale-[1.03] hover:shadow-xl hover:shadow-cyan-500/30
                    active:scale-[0.99]
                  "
                >
                  <MessageCircleCode size={17} />
                  Talk to Advisor
                </a>
                <a
                  href="/courses"
                  className="
                    flex items-center gap-2 rounded-xl
                    border border-white/12 bg-white/6
                    px-7 py-3.5 text-[15px] font-semibold
                    backdrop-blur-sm transition-all duration-300
                    hover:border-cyan-400/35 hover:bg-cyan-500/10
                  "
                >
                  Browse Courses
                  <ArrowRight size={16} className="text-slate-400" />
                </a>
              </div>

              {/* Trust line */}
              <p className="mt-8 text-[13px] text-slate-600">
                No credit card required · Cancel anytime · 30-day money-back
                guarantee
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
