import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

import {
  MailCheck,
  Mail,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Inbox,
  ExternalLink,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;
const RESEND_COOLDOWN = 60;

/* ─────────────────────────────────────────────
   ANIMATED ENVELOPE
───────────────────────────────────────────── */
const EnvelopeIcon = ({ sent }) => (
  <div className="ve-envelope-wrap">
    <motion.div
      className="ve-envelope"
      animate={sent ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="ve-envelope-body">
        <div className="ve-envelope-flap" />
        <div className="ve-envelope-letter">
          <div className="ve-letter-line" />
          <div className="ve-letter-line short" />
          <div className="ve-letter-line" />
        </div>
      </div>
      <div className="ve-envelope-glow" />
    </motion.div>

    {/* FLOATING DOTS */}
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="ve-dot"
        animate={{ y: [-8, -20, -8], opacity: [0, 1, 0] }}
        transition={{
          duration: 1.8,
          delay: i * 0.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ left: `${30 + i * 20}%` }}
      />
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const VerifyEmail = () => {
  const location = useLocation();
  const email = location.state?.email || "";

  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resentSuccess, setResentSuccess] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  /* ── COOLDOWN TIMER ── */
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    if (resendCount >= 3) {
      toast.error("Maximum resend attempts reached. Please contact support.");
      return;
    }
    if (!email) {
      toast.error("Email address not found. Please sign up again.");
      return;
    }

    setResending(true);
    setResentSuccess(false);
    try {
      const res = await axios.post(`${API_BASE}/api/users/resend-verification`, {
        email,
      });
      if (res.data?.success || res.status < 300) {
        setResentSuccess(true);
        setResendCount((c) => c + 1);
        setCooldown(RESEND_COOLDOWN);
        toast.success("Verification email sent! Check your inbox.");
        setTimeout(() => setResentSuccess(false), 4000);
      } else {
        toast.error(res.data?.message || "Failed to resend. Please try again.");
      }
    } catch (err) {
      const status = err?.response?.status;
      let msg = "Failed to resend email. Please try again.";
      if (status === 404) msg = "No account found with this email.";
      else if (status === 429)
        msg = "Too many requests. Please wait before retrying.";
      else if (status === 400) msg = err?.response?.data?.message || msg;
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(
        /(.{2})(.*)(@.*)/,
        (_, a, b, c) => a + "*".repeat(Math.min(b.length, 5)) + c,
      )
    : "your email";

  const openMailClient = () => {
    const domain = email.split("@")[1] || "";
    const urls = {
      "gmail.com": "https://mail.google.com",
      "outlook.com": "https://outlook.live.com",
      "hotmail.com": "https://outlook.live.com",
      "yahoo.com": "https://mail.yahoo.com",
      "icloud.com": "https://www.icloud.com/mail",
    };
    const url = urls[domain] || `https://mail.${domain}`;
    window.open(url, "_blank", "noopener");
  };

  return (
    <>
      <style>{STYLES}</style>

      <div className="ve-root">
        {/* BG */}
        <div className="ve-bg-mesh" />
        <div className="ve-bg-grid" />
        <div className="ve-orb ve-orb-1" />
        <div className="ve-orb ve-orb-2" />
        <div className="ve-orb ve-orb-3" />

        <motion.div
          className="ve-card-outer"
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="ve-card">
            {/* BACK */}
            <Link to="/login" className="ve-back-btn">
              <ArrowLeft size={15} />
              <span>Back to Login</span>
            </Link>

            {/* BADGE */}
            <motion.div
              className="ve-badge"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles size={12} />
              <span>Almost there!</span>
            </motion.div>

            {/* ENVELOPE */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.25,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <EnvelopeIcon sent={resentSuccess} />
            </motion.div>

            {/* TITLE */}
            <motion.div
              className="ve-text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="ve-title">Check your inbox</h1>
              <p className="ve-subtitle">We've sent a verification link to</p>
              {email && (
                <div className="ve-email-chip">
                  <Mail size={13} />
                  <span>{maskedEmail}</span>
                </div>
              )}
              <p className="ve-body-text">
                Click the link in the email to activate your account and start
                learning.
              </p>
            </motion.div>

            {/* OPEN MAIL BTN */}
            {email && (
              <motion.button
                className="ve-open-mail-btn"
                onClick={openMailClient}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Inbox size={17} />
                <span>Open Email App</span>
                <ExternalLink size={13} className="ve-ext-icon" />
              </motion.button>
            )}

            {/* INFO CARDS */}
            <motion.div
              className="ve-info-grid"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
            >
              <div className="ve-info-card">
                <div className="ve-info-icon" style={{ "--ic": "#10b981" }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="ve-info-title">Secure Verification</p>
                  <p className="ve-info-body">
                    Your link expires in 24 hours for security
                  </p>
                </div>
              </div>
              <div className="ve-info-card">
                <div className="ve-info-icon" style={{ "--ic": "#f59e0b" }}>
                  <Mail size={16} />
                </div>
                <div>
                  <p className="ve-info-title">Not in inbox?</p>
                  <p className="ve-info-body">
                    Check spam or promotions folder
                  </p>
                </div>
              </div>
            </motion.div>

            {/* RESENT SUCCESS BANNER */}
            <AnimatePresence>
              {resentSuccess && (
                <motion.div
                  className="ve-resent-banner"
                  initial={{ opacity: 0, scale: 0.96, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.22 }}
                >
                  <CheckCircle2 size={16} />
                  <div>
                    <p className="ve-resent-title">Email sent successfully!</p>
                    <p className="ve-resent-sub">
                      A new verification link is on its way.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* RESEND SECTION */}
            <motion.div
              className="ve-resend-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="ve-resend-label">Didn't receive the email?</p>

              <button
                className={`ve-resend-btn ${cooldown > 0 ? "cooling" : ""} ${resending ? "sending" : ""}`}
                onClick={handleResend}
                disabled={cooldown > 0 || resending || resendCount >= 3}
              >
                {resending ? (
                  <>
                    <RefreshCw size={15} className="ve-spin" />
                    <span>Sending…</span>
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <Clock size={15} />
                    <span>Resend in {cooldown}s</span>
                  </>
                ) : resendCount >= 3 ? (
                  <>
                    <AlertCircle size={15} />
                    <span>Max attempts reached</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={15} />
                    <span>Resend verification email</span>
                  </>
                )}
              </button>

              {/* COOLDOWN BAR */}
              <AnimatePresence>
                {cooldown > 0 && (
                  <motion.div
                    className="ve-cooldown-wrap"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="ve-cooldown-track">
                      <motion.div
                        className="ve-cooldown-fill"
                        initial={{ width: "100%" }}
                        animate={{
                          width: `${(cooldown / RESEND_COOLDOWN) * 100}%`,
                        }}
                        transition={{ duration: 1, ease: "linear" }}
                      />
                    </div>
                    <span className="ve-cooldown-txt">
                      Wait {cooldown}s before resending
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {resendCount > 0 && resendCount < 3 && (
                <p className="ve-attempts-left">
                  {3 - resendCount} resend attempt
                  {3 - resendCount !== 1 ? "s" : ""} remaining
                </p>
              )}
            </motion.div>

            {/* FOOTER */}
            <motion.p
              className="ve-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.58 }}
            >
              Wrong email?{" "}
              <Link to="/signup" className="ve-footer-link">
                Go back and sign up again
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.ve-root {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: #060c18; padding: 24px; position: relative; overflow: hidden;
  font-family: 'DM Sans', sans-serif;
}

/* BG */
.ve-bg-mesh {
  position: fixed; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 60% 50% at 20% 20%, rgba(16,185,129,.11) 0%, transparent 60%),
    radial-gradient(ellipse 50% 45% at 80% 80%, rgba(14,165,233,.09) 0%, transparent 60%),
    radial-gradient(ellipse 40% 35% at 55% 45%, rgba(99,102,241,.07) 0%, transparent 55%);
}
.ve-bg-grid {
  position: fixed; inset: 0; pointer-events: none; opacity: .02;
  background-image: linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px);
  background-size: 44px 44px;
}
.ve-orb {
  position: fixed; border-radius: 50%; pointer-events: none; filter: blur(80px);
  animation: ve-float 9s ease-in-out infinite;
}
.ve-orb-1 { width: 380px; height: 380px; background: rgba(16,185,129,.09); top: -100px; left: -80px; }
.ve-orb-2 { width: 300px; height: 300px; background: rgba(14,165,233,.07); bottom: -80px; right: -60px; animation-delay: -4s; }
.ve-orb-3 { width: 220px; height: 220px; background: rgba(99,102,241,.06); top: 35%; right: 20%; animation-delay: -7s; }

@keyframes ve-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-16px) scale(1.03); }
}

/* OUTER CARD */
.ve-card-outer { width: 100%; max-width: 460px; position: relative; }
.ve-card-outer::before {
  content: ''; position: absolute; inset: -1px; border-radius: 29px;
  background: linear-gradient(135deg, rgba(16,185,129,.3), rgba(14,165,233,.2), rgba(99,102,241,.15));
  z-index: 0; pointer-events: none;
}

/* CARD */
.ve-card {
  position: relative; z-index: 1;
  border-radius: 28px; overflow: hidden;
  background: #0b1220;
  box-shadow: 0 32px 100px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.05);
  padding: 36px 40px;
  display: flex; flex-direction: column; gap: 22px;
}
@media(max-width: 480px) { .ve-card { padding: 28px 22px; } }

/* BACK */
.ve-back-btn {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 600; color: #475569; text-decoration: none;
  transition: color .15s; width: fit-content;
}
.ve-back-btn:hover { color: #10b981; }

/* BADGE */
.ve-badge {
  display: inline-flex; align-items: center; gap: 6px; width: fit-content;
  background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.22);
  color: #6ee7b7; padding: 5px 12px; border-radius: 99px; font-size: 12px; font-weight: 600;
}

/* ENVELOPE */
.ve-envelope-wrap {
  display: flex; justify-content: center; align-items: flex-end;
  height: 110px; position: relative; margin: 4px 0;
}
.ve-envelope {
  position: relative; width: 88px; height: 68px;
  filter: drop-shadow(0 12px 32px rgba(16,185,129,.25));
}
.ve-envelope-body {
  width: 100%; height: 100%; border-radius: 10px;
  background: linear-gradient(145deg, #134e3a, #0d3a2c);
  border: 1.5px solid rgba(16,185,129,.35);
  position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.ve-envelope-flap {
  position: absolute; top: 0; left: 0; right: 0; height: 40%;
  background: linear-gradient(145deg, #0f4532, #0a3326);
  border-bottom: 1px solid rgba(16,185,129,.2);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}
.ve-envelope-letter {
  width: 52px; height: 38px; background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.08); border-radius: 5px;
  padding: 7px 8px; display: flex; flex-direction: column; gap: 5px;
  margin-top: 8px;
}
.ve-letter-line { height: 3px; background: rgba(16,185,129,.4); border-radius: 99px; }
.ve-letter-line.short { width: 60%; }
.ve-envelope-glow {
  position: absolute; inset: -20px; border-radius: 50%;
  background: radial-gradient(circle, rgba(16,185,129,.15), transparent 65%);
  pointer-events: none;
}
.ve-dot {
  position: absolute; bottom: 60px; width: 6px; height: 6px;
  border-radius: 50%; background: #10b981; opacity: 0;
}

/* TEXT */
.ve-text-center { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.ve-title {
  font-family: 'Bricolage Grotesque', sans-serif; font-size: 26px; font-weight: 800;
  color: #f0f9ff;
}
.ve-subtitle { font-size: 14px; color: #475569; }
.ve-email-chip {
  display: inline-flex; align-items: center; gap: 7px;
  background: rgba(16,185,129,.08); border: 1px solid rgba(16,185,129,.2);
  color: #6ee7b7; padding: 6px 14px; border-radius: 99px; font-size: 13px; font-weight: 600;
}
.ve-body-text { font-size: 13px; color: #475569; line-height: 1.6; max-width: 320px; }

/* OPEN MAIL BTN */
.ve-open-mail-btn {
  width: 100%; height: 50px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white; font-size: 15px; font-weight: 700; font-family: inherit;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 9px;
  box-shadow: 0 8px 28px rgba(16,185,129,.28);
  position: relative; overflow: hidden; transition: box-shadow .2s;
}
.ve-open-mail-btn::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.12), transparent);
  opacity: 0; transition: opacity .2s;
}
.ve-open-mail-btn:hover::before { opacity: 1; }
.ve-open-mail-btn:hover { box-shadow: 0 12px 36px rgba(16,185,129,.38); }
.ve-ext-icon { opacity: .7; margin-left: 2px; }

/* INFO GRID */
.ve-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
@media(max-width: 380px) { .ve-info-grid { grid-template-columns: 1fr; } }
.ve-info-card {
  display: flex; align-items: flex-start; gap: 10px;
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
  border-radius: 14px; padding: 13px;
}
.ve-info-icon {
  width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
  background: rgba(from var(--ic) r g b / .12); color: var(--ic);
  display: flex; align-items: center; justify-content: center;
}
.ve-info-title { font-size: 12px; font-weight: 700; color: #94a3b8; margin-bottom: 3px; }
.ve-info-body { font-size: 11px; color: #475569; line-height: 1.4; }

/* RESENT BANNER */
.ve-resent-banner {
  display: flex; align-items: flex-start; gap: 12px;
  background: rgba(16,185,129,.08); border: 1px solid rgba(16,185,129,.25);
  border-radius: 14px; padding: 13px 15px; color: #6ee7b7;
}
.ve-resent-title { font-size: 13px; font-weight: 700; margin-bottom: 2px; }
.ve-resent-sub { font-size: 12px; color: #10b981; }

/* RESEND SECTION */
.ve-resend-section { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.ve-resend-label { font-size: 13px; color: #475569; }

.ve-resend-btn {
  display: inline-flex; align-items: center; gap: 7px;
  background: rgba(255,255,255,.04); border: 1.5px solid rgba(255,255,255,.1);
  color: #94a3b8; padding: 10px 20px; border-radius: 12px;
  font-size: 13px; font-weight: 600; font-family: inherit;
  cursor: pointer; transition: all .2s;
}
.ve-resend-btn:hover:not(:disabled) {
  background: rgba(16,185,129,.08); border-color: rgba(16,185,129,.3);
  color: #6ee7b7;
}
.ve-resend-btn.cooling { color: #64748b; cursor: not-allowed; border-color: rgba(255,255,255,.06); }
.ve-resend-btn:disabled { opacity: .6; cursor: not-allowed; }

.ve-cooldown-wrap { width: 100%; display: flex; flex-direction: column; gap: 5px; align-items: center; overflow: hidden; }
.ve-cooldown-track { width: 100%; height: 3px; background: rgba(255,255,255,.07); border-radius: 99px; overflow: hidden; }
.ve-cooldown-fill { height: 100%; background: linear-gradient(90deg, #10b981, #06b6d4); border-radius: 99px; }
.ve-cooldown-txt { font-size: 11px; color: #334155; }

.ve-attempts-left { font-size: 11px; color: #475569; }

.ve-spin { animation: ve-spin .75s linear infinite; }
@keyframes ve-spin { to { transform: rotate(360deg); } }

/* FOOTER */
.ve-footer { text-align: center; font-size: 13px; color: #334155; }
.ve-footer-link { color: #10b981; font-weight: 700; text-decoration: none; transition: color .15s; }
.ve-footer-link:hover { color: #6ee7b7; }
`;

export default VerifyEmail;
