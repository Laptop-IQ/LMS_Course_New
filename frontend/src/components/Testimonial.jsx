import React, { useRef, useEffect, useCallback, memo } from "react";
import testimonials from "../assets/dummyTestimonial";

import {
  MessageSquareQuote,
  BadgeCheck,
  CalendarDays,
  GraduationCap,
  Star,
  TrendingUp,
  Sparkles,
} from "lucide-react";

/* ------------------------------------------------ */
/* CARD */
/* ------------------------------------------------ */

const TestimonialCard = memo(
  ({ t, i, cardsRef, handleMouseMove, handleMouseLeave }) => {
    return (
      <article
        ref={(el) => (cardsRef.current[i] = el)}
        data-index={i}
        onMouseMove={(e) => handleMouseMove(e, cardsRef.current[i])}
        onMouseLeave={() => handleMouseLeave(cardsRef.current[i])}
        className="
          group relative overflow-hidden rounded-[0.5rem]
          border border-white/10
          bg-white/[0.04]
          p-7 backdrop-blur-2xl

          opacity-0 translate-y-10
          transition-all duration-700

          hover:border-cyan-400/40
          hover:bg-white/[0.06]
          hover:shadow-2xl hover:shadow-cyan-500/10

          will-change-transform
        "
      >
        {/* TOP GLOW */}
        <div
          className="
            absolute inset-x-0 top-0 h-[2px]
            bg-gradient-to-r
            from-transparent
            via-cyan-400
            to-transparent
            opacity-0 transition-opacity duration-500
            group-hover:opacity-100
          "
        />

        {/* BOTTOM LINE */}
        <div
          className="
            absolute inset-x-0 bottom-0 h-[2px]
            bg-gradient-to-r
            from-cyan-400 via-blue-500 to-indigo-500
          "
        />

        {/* BACKGROUND GLOW */}
        <div
          className="
            absolute -right-10 -top-10 h-40 w-40
            rounded-full bg-cyan-500/10
            blur-3xl
          "
        />

        {/* QUOTE ICON */}
        <MessageSquareQuote
          size={75}
          className="
            absolute right-5 top-5
            text-cyan-400/10
          "
        />

        {/* COURSE TAG */}
        <div
          className="
            mb-6 inline-flex items-center gap-2
            rounded-full border border-cyan-400/20
            bg-cyan-400/10 px-4 py-1.5
            text-xs font-medium text-cyan-300
          "
        >
          <TrendingUp size={14} />
          {t.course}
        </div>

        {/* USER */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={t.avatar}
              alt={t.name}
              loading="lazy"
              decoding="async"
              className="
                h-16 w-16 rounded-2xl object-cover
                ring-2 ring-cyan-400/20
              "
            />

            {/* online dot */}
            <span
              className="
                absolute -bottom-1 -right-1
                h-4 w-4 rounded-full
                border-2 border-[#030712]
                bg-emerald-400
              "
            />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">{t.name}</h3>

            <p className="text-sm text-slate-400">{t.role}</p>

            {/* STARS */}
            <div className="mt-1 flex gap-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  size={14}
                  className={
                    idx < t.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-600"
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {/* MESSAGE */}
        <p
          className="
            mt-6 leading-relaxed
            text-slate-300
          "
        >
          “{t.message}”
        </p>

        {/* FOOTER */}
        <div
          className="
            mt-7 flex items-center justify-between
            border-t border-white/10
            pt-4 text-xs
          "
        >
          <div className="flex items-center gap-1 text-emerald-400">
            <BadgeCheck size={14} />
            Verified Student
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <CalendarDays size={14} />
            2026
          </div>
        </div>
      </article>
    );
  },
);

/* ------------------------------------------------ */
/* MAIN COMPONENT */
/* ------------------------------------------------ */

const Testimonial = () => {
  const cardsRef = useRef([]);
  const rafRef = useRef(null);

  /* POINTER CHECK */

  const isPointerDevice = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(pointer:fine)").matches;

  /* PREMIUM 3D TILT */

  const handleMouseMove = useCallback((e, el) => {
    if (!el || !isPointerDevice()) return;

    const rect = el.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotateX = (0.5 - y) * 10;
    const rotateY = (x - 0.5) * 10;

    cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      el.style.transform = `
        perspective(1200px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-8px)
        scale(1.02)
      `;
    });
  }, []);

  /* RESET */

  const handleMouseLeave = useCallback((el) => {
    if (!el) return;

    el.style.transition = "transform 450ms ease";

    el.style.transform = `
      perspective(1200px)
      rotateX(0deg)
      rotateY(0deg)
      translateY(0px)
      scale(1)
    `;

    setTimeout(() => {
      if (el) el.style.transition = "";
    }, 450);
  }, []);

  /* SCROLL REVEAL */

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index);

            setTimeout(() => {
              entry.target.classList.add("opacity-100", "translate-y-0");
            }, index * 120);

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
      },
    );

    cardsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      className="
        relative overflow-hidden
        bg-[#030712]
        py-24 text-white
      "
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <div
          className="
            absolute left-0 top-0
            h-[28rem] w-[28rem]
            rounded-full
            bg-cyan-500/10
            blur-3xl
          "
        />

        <div
          className="
            absolute bottom-0 right-0
            h-[28rem] w-[28rem]
            rounded-full
            bg-indigo-500/10
            blur-3xl
          "
        />
      </div>

      {/* GRID PATTERN */}
      <div
        className="
          absolute inset-0
          bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]
          bg-[size:70px_70px]
          [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)]
        "
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* HEADER */}
        <div className="mx-auto mb-20 max-w-3xl text-center">
          {/* BADGE */}
          <div
            className="
              mb-6 inline-flex items-center gap-2
              rounded-full border border-cyan-400/20
              bg-cyan-400/10
              px-5 py-2
              text-sm font-medium text-cyan-300
              backdrop-blur-md
            "
          >
            <GraduationCap size={16} />
            Trusted by 25,000+ Learners Worldwide
          </div>

          {/* TITLE */}
          <h2
            className="
              text-4xl font-black leading-tight
              md:text-5xl
            "
          >
            Student{" "}
            <span
              className="
                bg-gradient-to-r
                from-cyan-400 via-blue-500 to-indigo-500
                bg-clip-text text-transparent
              "
            >
              Success Stories
            </span>
          </h2>

          {/* DESCRIPTION */}
          <p
            className="
              mx-auto mt-6 max-w-xl
              text-lg leading-relaxed
              text-slate-400
            "
          >
            Thousands of learners are transforming their careers through our
            premium LMS experience, real-world projects, and industry-focused
            mentorship.
          </p>

          {/* STATS */}
          <div
            className="
              mt-10 flex flex-wrap
              items-center justify-center gap-8
            "
          >
            <div>
              <h3 className="text-3xl font-black text-white">25K+</h3>

              <p className="text-sm text-slate-400">Active Students</p>
            </div>

            <div className="h-10 w-px bg-white/10" />

            <div>
              <h3 className="text-3xl font-black text-white">4.9★</h3>

              <p className="text-sm text-slate-400">Average Rating</p>
            </div>

            <div className="h-10 w-px bg-white/10" />

            <div>
              <h3 className="text-3xl font-black text-white">120+</h3>

              <p className="text-sm text-slate-400">Premium Courses</p>
            </div>
          </div>
        </div>

        {/* TESTIMONIAL GRID */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((t, i) => (
            <TestimonialCard
              key={t.id}
              t={t}
              i={i}
              cardsRef={cardsRef}
              handleMouseMove={handleMouseMove}
              handleMouseLeave={handleMouseLeave}
            />
          ))}
        </div>

        {/* CTA SECTION */}
        <div
          className="
            relative mt-20 overflow-hidden
            rounded-[0.5rem]
            border border-cyan-400/20

            bg-gradient-to-br
            from-cyan-500/10
            via-slate-900
            to-blue-500/10

            p-8 md:p-12
            backdrop-blur-xl
          "
        >
          {/* Glow */}
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-cyan-800/20 blur-3xl"></div>

          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-800/20 blur-3xl"></div>

          <div
            className="
              relative z-10
              flex flex-col items-center justify-between
              gap-8 lg:flex-row
            "
          >
            {/* LEFT */}
            <div className="max-w-2xl">
              <div
                className="
                  mb-4 inline-flex items-center gap-2
                  rounded-full border border-cyan-400/20
                  bg-cyan-400/10
                  px-4 py-1.5
                  text-sm text-cyan-300
                "
              >
                <Sparkles size={14} />
                Join The Next Generation of Learners
              </div>

              <h3
                className="
                  text-2xl font-black leading-tight
                  md:text-4xl
                "
              >
                Start Building Your{" "}
                <span
                  className="
                    bg-gradient-to-r
                    from-cyan-400 to-blue-500
                    bg-clip-text text-transparent
                  "
                >
                  Future Today
                </span>
              </h3>

              <p
                className="
                  mt-5 max-w-xl
                  text-lg leading-relaxed
                  text-slate-400
                "
              >
                Access world-class courses, mentorship, certifications, and
                practical projects designed to accelerate your career growth.
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-4">
              <button
                className="
                  group relative overflow-hidden
                  rounded-xl
                  bg-gradient-to-r
                  from-cyan-500 to-blue-600

                  px-8 py-4
                  font-semibold text-white

                  shadow-lg shadow-cyan-500/20

                  transition-all duration-300
                  hover:scale-105
                  hover:shadow-cyan-500/40
                  active:scale-95
                "
              >
                <span className="relative z-10">Start Learning</span>

                <div
                  className="
                    absolute inset-0
                    translate-x-[-100%]
                    bg-white/20
                    transition-transform duration-700
                    group-hover:translate-x-[100%]
                  "
                />
              </button>

              <button
                className="
                  rounded-xl
                  border border-white/10
                  bg-white/[0.05]

                  px-8 py-4
                  font-semibold text-white

                  backdrop-blur-md

                  transition-all duration-300
                  hover:border-cyan-400/40
                  hover:bg-white/[0.08]
                  hover:scale-105
                  active:scale-95
                "
              >
                Explore Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
