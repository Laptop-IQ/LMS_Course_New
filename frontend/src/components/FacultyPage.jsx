import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

import {
  Star,
  Mail,
  Linkedin,
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  Github,
  Globe,
  GraduationCap,
  BadgeCheck,
  Loader2,
  Users,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

/* ─────────────────────────────────────────────────────────
   Social link config — same order as AdminProfilePage
   Each entry: key matches DB field, icon, hover colours
───────────────────────────────────────────────────────── */
const SOCIAL_CONFIG = [
  {
    key: "email",
    icon: Mail,
    title: (m) => m.email,
    href: (m) => `mailto:${m.email}`,
    hover: "hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-400",
  },
  {
    key: "linkedin",
    icon: Linkedin,
    title: () => "LinkedIn",
    href: (m) => m.linkedin,
    hover:
      "hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]",
  },
  {
    key: "github",
    icon: Github,
    title: () => "GitHub",
    href: (m) => m.github,
    hover:
      "hover:border-slate-400/40 hover:bg-slate-500/10 hover:text-slate-300",
  },
  {
    key: "twitter",
    icon: Twitter,
    title: () => "X (Twitter)",
    href: (m) => m.twitter,
    hover:
      "hover:border-[#1DA1F2]/40 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]",
  },
  {
    key: "youtube",
    icon: Youtube,
    title: () => "YouTube",
    href: (m) => m.youtube,
    hover: "hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-400",
  },
  {
    key: "instagram",
    icon: Instagram,
    title: () => "Instagram",
    href: (m) => m.instagram,
    hover: "hover:border-pink-400/30 hover:bg-pink-500/10 hover:text-pink-400",
  },
  {
    key: "facebook",
    icon: Facebook,
    title: () => "Facebook",
    href: (m) => m.facebook,
    hover:
      "hover:border-[#1877F2]/40 hover:bg-[#1877F2]/10 hover:text-[#1877F2]",
  },
  {
    key: "website",
    icon: Globe,
    title: () => "Website",
    href: (m) => m.website,
    hover:
      "hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-400",
  },
];

/* ─────────────────── helpers ─────────────────── */
const getAvatar = (member) =>
  member.avatar ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    member.username || "Admin",
  )}&background=06b6d4&color=fff&size=300`;

/* ─────────────────── skeleton card ─────────────────── */
const SkeletonCard = () => (
  <div className="rounded-lg border border-white/10 bg-white/5 p-5 animate-pulse">
    <div className="mb-5 h-[180px] w-full rounded-lg bg-white/10" />
    <div className="mb-3 h-5 w-2/3 rounded bg-white/10" />
    <div className="mb-2 h-4 w-1/2 rounded bg-white/10" />
    <div className="mb-5 h-12 w-full rounded bg-white/10" />
    <div className="mb-5 h-14 w-full rounded-xl bg-white/10" />
    <div className="flex gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-9 w-9 rounded-xl bg-white/10" />
      ))}
    </div>
  </div>
);

/* ─────────────────── main component ─────────────────── */
const FacultyPage = () => {
  const cardsRef = useRef([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* fetch real data */
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${API_BASE}/api/admin/profile/faculty`,
        );
        if (data.success) {
          setFaculty(data.faculty);
        } else {
          setError("Could not load faculty data.");
        }
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to fetch faculty data.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  /* intersection observer for stagger animation */
  useEffect(() => {
    if (loading || faculty.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("opacity-100", "translate-y-0");
            }, index * 100);
          }
        });
      },
      { threshold: 0.15 },
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, [loading, faculty]);

  return (
    <section className="relative overflow-hidden bg-[#030712] py-5 text-white">
      {/* ── BACKGROUND ── */}
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── CONTENT ── */}
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* ── HEADER ── */}
        <div className="mx-auto mb-5 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-sm font-medium text-cyan-300">
            <GraduationCap size={16} />
            World-Class LMS Educators
          </div>

          <h1 className="mb-5 text-3xl font-black leading-tight md:text-4xl">
            Meet Our
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              {" "}
              Expert Faculty
            </span>
          </h1>

          <p className="text-base leading-7 text-slate-400">
            Learn from experienced mentors, industry professionals, and
            certified educators dedicated to helping you succeed.
          </p>
        </div>

        {/* ── ERROR STATE ── */}
        {error && !loading && (
          <div className="mx-auto mb-8 max-w-md rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && !error && faculty.length === 0 && (
          <div className="mx-auto mb-8 max-w-sm rounded-xl border border-white/10 bg-white/5 px-6 py-10 text-center">
            <Users size={40} className="mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400 text-sm">
              No faculty profiles found yet.
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Admins can fill their profile to appear here.
            </p>
          </div>
        )}

        {/* ── FACULTY GRID ── */}
        <div className="mx-auto grid max-w-5xl gap-6 mb-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* skeleton while loading */}
          {loading && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}

          {/* real cards */}
          {!loading &&
            faculty.map((member, index) => {
              // Build the active social links for this member
              const activeSocials = SOCIAL_CONFIG.filter(({ key, href }) => {
                const val = href(member);
                return val && val.trim() !== "";
              });

              return (
                <div
                  key={member._id}
                  ref={(el) => (cardsRef.current[index] = el)}
                  className="
                    group relative overflow-hidden rounded-lg
                    border border-white/10 bg-white/5
                    p-5 backdrop-blur-xl
                    opacity-0 translate-y-10
                    transition-all duration-700
                    hover:-translate-y-2
                    hover:border-cyan-400/30
                    hover:bg-white/[0.07]
                  "
                >
                  {/* HOVER GLOW */}
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-indigo-500/10" />
                  </div>

                  <div className="relative z-10">
                    {/* ── PHOTO ── */}
                    <div className="relative mb-5">
                      <div className="overflow-hidden rounded-lg bg-slate-900">
                        <div className="absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[#0d1117]/80 to-transparent" />
                        <img
                          src={getAvatar(member)}
                          alt={member.username}
                          className="h-[180px] w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>

                      {/* Experience badge */}
                      {member.experience && (
                        <div className="absolute bottom-3 left-3 z-20 rounded-xl border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-md">
                          <div className="flex items-center gap-2">
                            <BadgeCheck className="h-3.5 w-3.5 text-cyan-400" />
                            <span className="text-xs font-semibold">
                              {member.experience} Exp
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── INFO ── */}
                    <div className="mb-5">
                      <h3 className="mb-1 text-lg font-bold">
                        {member.username}
                      </h3>

                      {member.education && (
                        <p className="mb-3 text-sm font-medium text-cyan-400">
                          {member.education}
                        </p>
                      )}

                      {member.specialization && (
                        <p className="text-sm leading-6 text-slate-400">
                          {member.specialization}
                        </p>
                      )}

                      {/* bio fallback if no specialization */}
                      {!member.specialization && member.bio && (
                        <p className="text-sm leading-6 text-slate-400 line-clamp-3">
                          {member.bio}
                        </p>
                      )}
                    </div>

                    {/* ── RATING ── */}
                    <div className="mb-5 flex items-center justify-between rounded-xl border border-white/10 bg-[#131a2f] px-4 py-3">
                      <div>
                        <p className="text-xs text-slate-400">Student Rating</p>
                        <h4 className="text-lg font-bold">
                          {Number(member.rating || 0).toFixed(1)}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < Math.round(member.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-600"
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {/* ── SOCIAL ICONS — dynamic, only filled links show ── */}
                    {activeSocials.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {activeSocials.map(
                          ({ key, icon: Icon, title, href, hover }) => (
                            <a
                              key={key}
                              href={href(member)}
                              target={key === "email" ? "_self" : "_blank"}
                              rel="noopener noreferrer"
                              title={title(member)}
                              className={`
                              group/social rounded-xl border border-white/10 bg-white/5
                              p-2.5 text-slate-400
                              transition-all duration-300
                              hover:-translate-y-1 ${hover}
                            `}
                            >
                              <Icon className="h-4 w-4 transition-transform group-hover/social:scale-110" />
                            </a>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  {/* bottom gradient bar */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default FacultyPage;
