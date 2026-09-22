import React, { useState } from "react";
import { HelpCircle, ChevronDown, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const faqs = [
  {
    q: "What is SkillForge LMS?",
    a: "SkillForge LMS is an online learning platform where you can learn modern skills through courses, projects, and guided learning paths.",
  },
  {
    q: "Are the courses free or paid?",
    a: "Both free and paid courses may be available depending on the specific course and instructor.",
  },
  {
    q: "Can I access the platform on mobile?",
    a: "Yes, SkillForge LMS is fully responsive and works smoothly on mobile, tablet, and desktop devices.",
  },
  {
    q: "Do I get a certificate after completing a course?",
    a: "If the course includes certification, you will receive a certificate after successful completion.",
  },
  {
    q: "How can I contact support?",
    a: "You can contact our support team through the contact section available on the website.",
  },
];

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const navigate = useNavigate();

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-hidden relative">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 left-0 h-[400px] w-[400px] bg-cyan-500/10 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[350px] w-[350px] bg-blue-500/10 blur-[120px]" />

      {/* SIDEBAR BACK BUTTON */}
      <div className="fixed left-5 top-5 z-50">
        <button
          onClick={() => navigate(-1)}
          className="
            group flex items-center gap-3
            rounded-lg
            border border-white/10
            bg-white/[0.04]
            px-4 py-3
            text-sm font-medium text-slate-300
            backdrop-blur-2xl
            shadow-[0_0_20px_rgba(0,255,255,0.05)]
            transition-all duration-300
            hover:border-cyan-400/30
            hover:bg-cyan-500/10
            hover:text-cyan-300
            hover:shadow-cyan-500/20
          "
        >
          <div
            className="
              flex h-9 w-9 items-center justify-center
              rounded-lg
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
        <div className="mx-auto max-w-6xl px-6 py-2">
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
              Support & Help Center
            </div>

            {/* TITLE */}
            <h1
              className="
                mt-6
                text-4xl font-black tracking-tight
                md:text-5xl
              "
            >
              Frequently Asked
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {" "}
                Questions
              </span>
            </h1>

            {/* SUBTITLE */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
              Find quick answers about courses, certifications, mobile access,
              payments, and everything related to SkillForge LMS.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="relative mx-auto max-w-4xl px-6 py-20">
        <div className="space-y-5">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`
                  group overflow-hidden rounded-3xl
                  border transition-all duration-500
                  backdrop-blur-xl
                  ${
                    isOpen
                      ? "border-cyan-400/30 bg-cyan-500/[0.08] shadow-[0_0_30px_rgba(34,211,238,0.08)]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }
                `}
              >
                <button
                  onClick={() => toggle(index)}
                  className="
                    flex w-full items-center justify-between
                    px-7 py-6 text-left
                  "
                >
                  <div className="flex items-start gap-4">
                    {/* ICON */}
                    <div
                      className={`
                        mt-1 flex h-10 w-10 items-center justify-center rounded-2xl
                        transition-all duration-300
                        ${
                          isOpen
                            ? "bg-cyan-500/20 text-cyan-300"
                            : "bg-white/5 text-slate-400 group-hover:bg-white/10"
                        }
                      `}
                    >
                      <HelpCircle size={18} />
                    </div>

                    {/* QUESTION */}
                    <div>
                      <h3
                        className={`
                          text-base font-semibold transition-colors duration-300
                          ${
                            isOpen
                              ? "text-cyan-200"
                              : "text-slate-200 group-hover:text-white"
                          }
                        `}
                      >
                        {item.q}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Click to expand answer
                      </p>
                    </div>
                  </div>

                  {/* ARROW */}
                  <div
                    className={`
                      flex h-10 w-10 items-center justify-center rounded-xl
                      transition-all duration-300
                      ${
                        isOpen
                          ? "bg-cyan-500/20 text-cyan-300 rotate-180"
                          : "bg-white/5 text-slate-400"
                      }
                    `}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                {/* ANSWER */}
                <div
                  className={`
                    grid transition-all duration-500 ease-in-out
                    ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }
                  `}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-white/5 px-7 pb-7 pt-5">
                      <p className="text-sm leading-8 text-slate-400 md:text-base">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default FAQs;
