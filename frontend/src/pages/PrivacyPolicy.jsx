import React from "react";
import {
  ShieldCheck,
  Lock,
  Database,
  Cookie,
  Globe,
  UserCheck,
  RefreshCcw,
  Mail,
  Phone,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    icon: <Database size={20} />,
    title: "1. Information We Collect",
    content:
      "We may collect personal information including your name, email address, profile information, enrolled courses, payment details, and learning activity while using SkillForge LMS.",
  },
  {
    icon: <UserCheck size={20} />,
    title: "2. How We Use Your Information",
    content:
      "Your information is used to provide access to courses, improve user experience, personalize learning content, process payments, and communicate important updates related to your account or courses.",
  },
  {
    icon: <Cookie size={20} />,
    title: "3. Cookies & Analytics",
    content:
      "We may use cookies and analytics tools to understand user behavior, improve platform performance, and enhance the overall learning experience.",
  },
  {
    icon: <Lock size={20} />,
    title: "4. Data Protection",
    content:
      "We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, or misuse.",
  },
  {
    icon: <Globe size={20} />,
    title: "5. Third-Party Services",
    content:
      "SkillForge LMS may integrate with trusted third-party services such as payment gateways, analytics tools, and authentication providers to improve functionality.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "6. User Rights",
    content:
      "Users may request access, correction, or deletion of their personal data by contacting our support team.",
  },
  {
    icon: <RefreshCcw size={20} />,
    title: "7. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. Continued use of the platform after changes means you accept the updated policy.",
  },
];

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-[#030712] text-white relative">
      {/* BACKGROUND GLOW */}
      <div className="absolute left-0 top-0 h-[350px] w-[350px] bg-cyan-500/10 blur-[120px]" />
      <div className="absolute right-0 bottom-0 h-[350px] w-[350px] bg-blue-500/10 blur-[120px]" />

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

      {/* HERO */}
      <section className="relative border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="text-center">
            {/* BADGE */}
            <div
              className="
                inline-flex items-center gap-2
                rounded-full
                border border-cyan-500/20
                bg-cyan-500/10
                px-5 py-2
                text-sm font-medium text-cyan-300
                backdrop-blur-xl
              "
            >
              <Sparkles size={16} />
              Legal & Security
            </div>

            {/* TITLE */}
            <h1 className="mt-6 text-4xl font-black tracking-tight md:text-5xl">
              Privacy
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {" "}
                Policy
              </span>
            </h1>

            {/* SUBTITLE */}
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-400 md:text-lg">
              This Privacy Policy explains how SkillForge LMS collects, uses,
              stores, and protects your information while using our platform and
              services.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
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

                {/* CONTENT */}
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
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300">
                  <Mail size={22} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold">Contact Us</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Need help regarding our privacy practices?
                  </p>
                </div>
              </div>

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

export default PrivacyPolicy;
