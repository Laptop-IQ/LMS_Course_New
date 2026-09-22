import React from "react";
import {
  FileText,
  Shield,
  CreditCard,
  User,
  Ban,
  Gavel,
  RefreshCcw,
  Mail,
  Phone,
  ArrowLeft,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    icon: <BookOpen size={20} />,
    title: "1. Use of Platform",
    content:
      "SkillForge LMS provides educational content, courses, and learning tools. You agree to use the platform only for lawful educational purposes.",
  },
  {
    icon: <User size={20} />,
    title: "2. User Accounts",
    content:
      "You are responsible for maintaining the confidentiality of your account and all activities under your account.",
  },
  {
    icon: <CreditCard size={20} />,
    title: "3. Payments & Subscriptions",
    content:
      "Some courses or features may require payment. All fees are non-refundable unless stated otherwise.",
  },
  {
    icon: <Shield size={20} />,
    title: "4. Content Ownership",
    content:
      "All course materials, videos, and content are owned by SkillForge LMS or its instructors and are protected by copyright laws.",
  },
  {
    icon: <Ban size={20} />,
    title: "5. Prohibited Activities",
    content:
      "You may not copy, distribute, resell, or misuse any content. Any abusive or illegal activity will lead to account termination.",
  },
  {
    icon: <Gavel size={20} />,
    title: "6. Termination",
    content:
      "We reserve the right to suspend or terminate your access if you violate these terms or misuse the platform.",
  },
  {
    icon: <RefreshCcw size={20} />,
    title: "7. Changes to Terms",
    content:
      "We may update these Terms of Service at any time. Continued use of the platform means you accept the updated terms.",
  },
];

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
      {/* BACKGROUND GLOW */}
      <div className="absolute left-0 top-0 h-[350px] w-[350px] bg-cyan-500/10 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[350px] w-[350px] bg-blue-500/10 blur-[120px]" />

      {/* FLOATING BACK BUTTON */}
      <div className="fixed left-5 top-5 z-50">
        <button
          onClick={() => navigate(-1)}
          className="
            group flex items-center gap-3
            rounded-2xl
            border border-white/10
            bg-white/[0.05]
            px-4 py-3
            text-sm font-medium text-slate-300
            backdrop-blur-2xl
            shadow-[0_0_25px_rgba(0,255,255,0.05)]
            transition-all duration-300
            hover:border-cyan-400/30
            hover:bg-cyan-500/10
            hover:text-cyan-300
          "
        >
          <div
            className="
              flex h-9 w-9 items-center justify-center
              rounded-xl
              bg-white/5
              transition-all duration-300
              group-hover:bg-cyan-500/20
            "
          >
            <ArrowLeft
              size={18}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
          </div>

          <div className="hidden sm:block text-left">
            <p className="text-xs text-slate-500">Go Back</p>
            <p className="text-sm font-semibold">Previous Page</p>
          </div>
        </button>
      </div>

      {/* HERO SECTION */}
      <section className="relative border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="text-center">
            {/* BADGE */}
            <div
              className="
                inline-flex items-center gap-2
                rounded-lg
                border border-cyan-500/20
                bg-cyan-500/10
                px-5 py-2
                text-sm font-medium text-cyan-300
                backdrop-blur-xl
              "
            >
              <Sparkles size={16} />
              Legal Agreement
            </div>

            {/* TITLE */}
            <h1 className="mt-6 text-4xl font-black tracking-tight md:text-5xl">
              Terms of
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {" "}
                Service
              </span>
            </h1>

            {/* SUBTITLE */}
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-400 md:text-lg">
              These Terms of Service govern your use of SkillForge LMS. By
              accessing or using our platform, you agree to comply with these
              terms and conditions.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="relative mx-auto max-w-5xl px-6 py-20">
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className="
                group rounded-3xl
                border border-white/10
                bg-white/[0.03]
                p-7
                backdrop-blur-xl
                transition-all duration-300
                hover:border-cyan-400/20
                hover:bg-cyan-500/[0.04]
                hover:shadow-[0_0_35px_rgba(34,211,238,0.06)]
              "
            >
              <div className="flex items-start gap-5">
                {/* ICON */}
                <div
                  className="
                    flex h-12 w-12 shrink-0 items-center justify-center
                    rounded-2xl
                    bg-cyan-500/10
                    text-cyan-300
                    transition-all duration-300
                    group-hover:bg-cyan-500/20
                  "
                >
                  {section.icon}
                </div>

                {/* TEXT */}
                <div>
                  <h2 className="text-xl font-semibold md:text-2xl">
                    {section.title}
                  </h2>

                  <p className="mt-4 text-sm leading-8 text-slate-400 md:text-base">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* CONTACT CARD */}
          <div
            className="
              relative overflow-hidden rounded-3xl
              border border-cyan-500/20
              bg-gradient-to-br from-cyan-500/10 to-blue-500/10
              p-8
              backdrop-blur-2xl
            "
          >
            {/* GLOW */}
            <div className="absolute right-0 top-0 h-40 w-40 bg-cyan-400/10 blur-[80px]" />

            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300">
                  <FileText size={24} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold">Need Assistance?</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Contact our legal or support team regarding these terms.
                  </p>
                </div>
              </div>

              {/* CONTACT INFO */}
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {/* EMAIL */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-cyan-300" />

                    <div>
                      <p className="text-xs text-slate-500">Email Support</p>
                      <p className="mt-1 text-sm font-medium text-slate-200">
                        support@skillforge.com
                      </p>
                    </div>
                  </div>
                </div>

                {/* PHONE */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-cyan-300" />

                    <div>
                      <p className="text-xs text-slate-500">Phone Number</p>
                      <p className="mt-1 text-sm font-medium text-slate-200">
                        +91 98765 43210
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
