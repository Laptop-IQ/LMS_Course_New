import React from "react";
import {
  HelpCircle,
  ShieldCheck,
  FileText,
  Sparkles,
  Mail,
  BookOpen,
  GraduationCap,
  ArrowUpRight,
  Globe,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Support",
    links: [
      { name: "Contact", href: "/contact", icon: Mail },
      { name: "FAQs", href: "/faqs", icon: HelpCircle },
    ],
  },
  {
    title: "Legal",
    links: [
      {
        name: "Privacy Policy",
        href: "/privacy-policy",
        icon: ShieldCheck,
      },
      {
        name: "Terms of Service",
        href: "/terms",
        icon: FileText,
      },
    ],
  },
];

const socials = [
  {
    icon: Github,
    href: "#",
  },
  {
    icon: Linkedin,
    href: "#",
  },
  {
    icon: Twitter,
    href: "#",
  },
];

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#030712] text-white">
      {/* BACKGROUND EFFECTS */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* GRID */}
      <div
        className="
          absolute inset-0 opacity-[0.03]
          [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
          [background-size:40px_40px]
        "
      />

      <div className="relative mx-auto max-w-7xl px-6 py-20">
        {/* TOP SECTION */}
        <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr]">
          {/* BRAND */}
          <div>
            {/* LOGO */}
            <div className="flex items-center gap-4">
              <div
                className="
                  relative flex h-14 w-14 items-center justify-center
                  rounded-2xl
                  bg-gradient-to-br from-cyan-500 to-blue-600
                  shadow-[0_0_30px_rgba(34,211,238,0.35)]
                "
              >
                <GraduationCap size={28} />

                <div className="absolute inset-0 rounded-2xl border border-white/20" />
              </div>

              <div>
                <h2 className="flex items-center gap-2 text-3xl font-black tracking-tight">
                  SkillForge
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    LMS
                  </span>
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                </h2>

                <p className="mt-1 text-sm text-cyan-300">
                  Future of Digital Learning
                </p>
              </div>
            </div>

            {/* DESCRIPTION */}
            <p className="mt-7 max-w-xl text-sm leading-8 text-slate-400 md:text-base">
              Empowering learners with industry-ready skills, immersive
              educational experiences, and modern technology-driven learning
              systems built for the next generation.
            </p>

            {/* STATS */}
            <div className="mt-10 flex flex-wrap gap-4">
              {/* COURSES */}
              <div
                className="
                  group rounded-2xl
                  border border-white/10
                  bg-white/[0.04]
                  px-5 py-4
                  backdrop-blur-xl
                  transition-all duration-300
                  hover:border-cyan-400/20
                  hover:bg-cyan-500/[0.05]
                "
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
                    <BookOpen size={18} />
                  </div>

                  <div>
                    <p className="text-lg font-bold">100+</p>
                    <p className="text-xs text-slate-500">Premium Courses</p>
                  </div>
                </div>
              </div>

              {/* STUDENTS */}
              <div
                className="
                  group rounded-2xl
                  border border-white/10
                  bg-white/[0.04]
                  px-5 py-4
                  backdrop-blur-xl
                  transition-all duration-300
                  hover:border-emerald-400/20
                  hover:bg-emerald-500/[0.05]
                "
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
                    <GraduationCap size={18} />
                  </div>

                  <div>
                    <p className="text-lg font-bold">10k+</p>
                    <p className="text-xs text-slate-500">Active Students</p>
                  </div>
                </div>
              </div>

              {/* GLOBAL */}
              <div
                className="
                  group rounded-2xl
                  border border-white/10
                  bg-white/[0.04]
                  px-5 py-4
                  backdrop-blur-xl
                  transition-all duration-300
                  hover:border-blue-400/20
                  hover:bg-blue-500/[0.05]
                "
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
                    <Globe size={18} />
                  </div>

                  <div>
                    <p className="text-lg font-bold">24/7</p>
                    <p className="text-xs text-slate-500">Global Access</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LINKS SECTION */}
          <div className="grid grid-cols-2 gap-10">
            {footerLinks.map((section) => (
              <div key={section.title}>
                {/* TITLE */}
                <h3 className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
                  {section.title}
                </h3>

                {/* LINKS */}
                <div className="space-y-3">
                  {section.links.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="
                          group flex items-center justify-between
                          rounded-2xl
                          border border-transparent
                          bg-transparent
                          px-4 py-3
                          text-sm text-slate-400
                          transition-all duration-300

                          hover:border-white/10
                          hover:bg-white/[0.04]
                          hover:text-cyan-300
                        "
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="
                              rounded-xl
                              bg-white/[0.04]
                              p-2
                              text-slate-500
                              transition-all duration-300
                              group-hover:bg-cyan-500/10
                              group-hover:text-cyan-400
                            "
                          >
                            <Icon size={16} />
                          </div>

                          <span>{item.name}</span>
                        </div>

                        <ArrowUpRight
                          size={15}
                          className="
                            opacity-0 transition-all duration-300
                            group-hover:translate-x-1
                            group-hover:opacity-100
                          "
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* BOTTOM */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* COPYRIGHT */}
          <div>
            <p className="text-sm text-slate-500">
              © 2026 SkillForge LMS. All rights reserved.
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Built for modern education systems and future-ready learning.
            </p>
          </div>

          {/* SOCIALS */}
          <div className="flex items-center gap-3">
            {socials.map((social, index) => {
              const Icon = social.icon;

              return (
                <a
                  key={index}
                  href={social.href}
                  className="
                    group flex h-11 w-11 items-center justify-center
                    rounded-2xl
                    border border-white/10
                    bg-white/[0.04]
                    text-slate-500
                    backdrop-blur-xl
                    transition-all duration-300

                    hover:-translate-y-1
                    hover:border-cyan-400/20
                    hover:bg-cyan-500/10
                    hover:text-cyan-300
                  "
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
