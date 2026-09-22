import React, { useState, useRef, useEffect, memo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CircleCheckBig, Sparkle, X, BookOpen, Star } from "lucide-react";
import bannerImg from "../assets/Bannerimage.jpg";
import About from "./AboutPage";
import { useNavigate } from "react-router-dom";


const features = [
  { text: "Modern UI Components", color: "cyan" },
  { text: "Fully Responsive", color: "emerald" },
  { text: "Fast Performance", color: "indigo" },
];

const colorMap = {
  cyan: "text-cyan-400",
  emerald: "text-emerald-400",
  indigo: "text-indigo-400",
};

/* ---------------- COUNT UP HOOK ---------------- */
const useCountUp = (end, duration = 1200) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);

    const interval = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(interval);
      }
      setValue(start);
    }, 16);

    return () => clearInterval(interval);
  }, [end, duration]);

  return value;
};

/* ---------------- STATS CARD ---------------- */
const StatCard = memo(({ val, suffix, label, color, growth }) => {
  const count = useCountUp(val);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-md">
      <h3 className={`text-3xl font-black ${colorMap[color]}`}>
        {label === "Rating" ? count.toFixed(1) : Math.floor(count)}
        {suffix}
      </h3>
      <p className="text-xs text-slate-300">{label}</p>
      <p className="text-[11px] text-green-400">{growth}</p>
    </div>
  );
});

/* ---------------- MAIN COMPONENT ---------------- */
const Banner = () => {
  const heroRef = useRef(null);
  const navigate = useNavigate();

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 40]);
  const y2 = useTransform(scrollY, [0, 500], [0, -40]);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-[#030712] text-white -mb-6"
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-[20rem] w-[20rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[20rem] w-[20rem] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-5">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* LEFT */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-sm text-cyan-300">
              <Sparkle size={16} />
              AI-Powered LMS Platform
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              Build Amazing
              <span className="block bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Digital Learning
              </span>
            </h1>

            <p className="mt-5 text-slate-400 max-w-xl">
              Modern AI-powered LMS platform built for fast learning experience.
            </p>

            {/* FEATURES */}
            <div className="mt-8 space-y-3">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <CircleCheckBig className={colorMap[f.color]} />
                  <span>{f.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 flex gap-4">
              <a
                href="/courses"
                className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 font-semibold"
              >
                Browse Courses
              </a>

              <button
                onClick={() => navigate("/about")}
                className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white cursor-pointer transition-all duration-300
    hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:border-transparent
    hover:shadow-lg
hover:shadow-cyan-500/20
  "
              >
                About Us
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <motion.div style={{ y: y2 }} className="relative">
            <img
              src={bannerImg}
              loading="lazy"
              decoding="async"
              className="rounded-2xl w-full"
              alt="banner"
            />

            {/* ⭐ STATIC STAR BADGE (NO ANIMATION) */}
            <div className="absolute right-2 top-2 cursor-default">
              <div className="absolute -inset-2 rounded-3xl bg-yellow-400/25 blur-2xl opacity-70" />

              <div className="relative flex items-center gap-3 rounded-3xl border border-yellow-400/30 bg-black/60 px-5 py-3 backdrop-blur-xl shadow-[0_0_30px_rgba(250,204,21,0.15)]">
                <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center shadow-[0_0_25px_rgba(250,204,21,0.9)]">
                  <Star className="w-7 h-7 text-black fill-black" />
                </div>

                <div className="leading-tight">
                  <p className="text-white font-bold text-lg tracking-wide">
                    4.9
                  </p>
                  <p className="text-yellow-300 text-sm font-medium">
                    ★ Top Rated LMS
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Click to explore ratings
                  </p>
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <StatCard
                val={25000}
                suffix="+"
                label="Students"
                color="cyan"
                growth="+12%"
              />
              <StatCard
                val={120}
                suffix="+"
                label="Courses"
                color="indigo"
                growth="+8%"
              />
              <StatCard
                val={4.9}
                suffix=""
                label="Rating"
                color="emerald"
                growth="+2%"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
