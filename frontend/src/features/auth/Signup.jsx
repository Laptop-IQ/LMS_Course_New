import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  LockKeyhole,
  User,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Trophy,
  UserCheck,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

/* ─────────────────────────────────────────────
   VALIDATORS
───────────────────────────────────────────── */
const validators = {
  username: (v) => {
    if (!v) return "Full name is required";
    if (v.trim().length < 2) return "Name must be at least 2 characters";
    if (v.trim().length > 50) return "Name is too long";
    if (!/^[a-zA-Z\s'-]+$/.test(v))
      return "Name can only contain letters, spaces, hyphens";
    return null;
  },
  email: (v) => {
    if (!v) return "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
      return "Enter a valid email address";
    return null;
  },
  password: (v) => {
    if (!v) return "Password is required";
    if (v.length < 6) return "Password must be at least 6 characters";
    if (v.length > 72) return "Password is too long";
    return null;
  },
};

/* ─────────────────────────────────────────────
   PASSWORD STRENGTH
───────────────────────────────────────────── */
const getStrength = (v) => {
  let score = 0;
  if (v.length >= 6) score++;
  if (v.length >= 10) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^a-zA-Z0-9]/.test(v)) score++;
  return score;
};

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
const STRENGTH_COLORS = [
  "",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
];

const PasswordStrength = ({ value }) => {
  const score = getStrength(value);
  const checks = [
    { label: "6+ characters", pass: value.length >= 6 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(value) },
    { label: "Number included", pass: /[0-9]/.test(value) },
    { label: "Special character", pass: /[^a-zA-Z0-9]/.test(value) },
  ];

  return (
    <div className="su-pw-strength">
      <div className="su-pw-row">
        <div className="su-pw-bars">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="su-pw-bar"
              style={{
                background:
                  i <= score
                    ? STRENGTH_COLORS[score]
                    : "rgba(255,255,255,0.07)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
        {value && (
          <span
            className="su-pw-label"
            style={{ color: STRENGTH_COLORS[score] }}
          >
            {STRENGTH_LABELS[score]}
          </span>
        )}
      </div>
      <div className="su-pw-checks">
        {checks.map((c, i) => (
          <span key={i} className={`su-pw-check ${c.pass ? "pass" : ""}`}>
            <CheckCircle2 size={10} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   FIELD COMPONENT
───────────────────────────────────────────── */
const Field = ({
  label,
  icon: Icon,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  isPassword,
  showPassword,
  togglePassword,
  autoComplete,
  hint,
}) => {
  const hasError = touched && error;
  const hasSuccess = touched && !error && value;

  return (
    <div className="su-field-wrap">
      <div className="su-field-label-row">
        <label className="su-field-label">{label}</label>
        {hint && !hasError && <span className="su-field-hint">{hint}</span>}
      </div>
      <div
        className={`su-field-box ${hasError ? "err" : ""} ${hasSuccess ? "ok" : ""}`}
      >
        <Icon size={16} className="su-field-icon" />
        <input
          name={name}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete || "off"}
          className="su-input"
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
        {isPassword && (
          <button
            type="button"
            className="su-eye-btn"
            onClick={togglePassword}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
        {!isPassword && hasSuccess && (
          <CheckCircle2 size={15} className="su-field-check" />
        )}
        {hasError && !isPassword && (
          <AlertCircle size={15} className="su-field-err-icon" />
        )}
      </div>

      <AnimatePresence mode="wait">
        {hasError ? (
          <motion.div
            key="err"
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.16 }}
            className="su-field-msg su-field-msg--err"
          >
            <AlertCircle size={12} />
            <span>{error}</span>
          </motion.div>
        ) : hasSuccess && !isPassword ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.16 }}
            className="su-field-msg su-field-msg--ok"
          >
            <CheckCircle2 size={12} />
            <span>Looks good!</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────────── */
const StepDots = ({ fields, formData, errors }) => {
  const filled = fields.filter((f) => formData[f] && !errors[f]).length;
  const pct = Math.round((filled / fields.length) * 100);
  return (
    <div className="su-step-wrap">
      <div className="su-step-bar-track">
        <motion.div
          className="su-step-bar-fill"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <span className="su-step-label">
        {filled}/{fields.length} fields complete
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN SIGNUP COMPONENT
───────────────────────────────────────────── */
const Signup = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [agree, setAgree] = useState(false);
  const [agreeError, setAgreeError] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    username: null,
    email: null,
    password: null,
  });
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
  });

  const validate = (name, value) => {
    const err = validators[name]?.(value) || null;
    setErrors((prev) => ({ ...prev, [name]: err }));
    return err;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError("");
    if (touched[name]) validate(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validate(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setTouched({ username: true, email: true, password: true });
    const errs = {
      username: validators.username(formData.username),
      email: validators.email(formData.email),
      password: validators.password(formData.password),
    };
    setErrors(errs);

    if (!agree) {
      setAgreeError(true);
      return;
    }
    if (errs.username || errs.email || errs.password) return;

    setServerError("");
    try {
      setIsLoading(true);
      const res = await axios.post(`${API_BASE}/api/users/register`, {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (res.status >= 200 && res.status < 300) {
        setSignupSuccess(true);
        toast.success("Account created! Check your email to verify.");
        setTimeout(
          () => navigate("/verify", { state: { email: formData.email } }),
          1000,
        );
      }
    } catch (err) {
      const status = err?.response?.status;
      let msg = "Something went wrong. Please try again.";
      if (status === 409) msg = "An account with this email already exists.";
      else if (status === 400)
        msg =
          err?.response?.data?.message ||
          "Invalid details. Please check and try again.";
      else if (status === 429) msg = "Too many attempts. Please wait a moment.";
      else if (status === 500) msg = "Server error. Please try again later.";
      else msg = err?.response?.data?.message || msg;
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>

      <div className="su-root">
        {/* absolute (not fixed) → no scroll repaint */}
        <div className="su-bg-mesh" />
        <div className="su-bg-grid" />
        <div className="su-orb su-orb-1" />
        <div className="su-orb su-orb-2" />
        <div className="su-orb su-orb-3" />

        <motion.div
          className="su-card-outer"
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="su-card">
            {/* ── LEFT PANEL ── */}
            <div className="su-left">
              <div className="su-left-inner">
                <div className="su-logo">
                  <div className="su-logo-icon">
                    <GraduationCap size={28} />
                  </div>
                  <span className="su-logo-text">LearnFlow</span>
                </div>

                <div>
                  <h1 className="su-left-title">
                    Start your
                    <br />
                    <span className="su-left-accent">growth journey</span>
                  </h1>
                  <p className="su-left-sub">
                    Join thousands of learners building real skills every day.
                  </p>
                </div>

                <div className="su-steps">
                  <p className="su-steps-label">Get started in 3 easy steps</p>
                  {[
                    { num: "01", text: "Create your free account" },
                    { num: "02", text: "Verify your email address" },
                    { num: "03", text: "Pick a course & start learning" },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      className="su-step-row"
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                    >
                      <div className="su-step-num">{s.num}</div>
                      <span>{s.text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="su-features">
                  {[
                    {
                      icon: <ShieldCheck size={13} />,
                      text: "No credit card required",
                    },
                    {
                      icon: <BookOpen size={13} />,
                      text: "Free courses available",
                    },
                    {
                      icon: <Trophy size={13} />,
                      text: "Earn verified certificates",
                    },
                  ].map((f, i) => (
                    <div key={i} className="su-feature-chip">
                      {f.icon}
                      <span>{f.text}</span>
                    </div>
                  ))}
                </div>

                <div className="su-social-proof">
                  <div className="su-avatars">
                    {["R", "P", "A", "S"].map((l, i) => (
                      <div
                        key={l}
                        className="su-avatar"
                        style={{ marginLeft: i ? -10 : 0 }}
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                  <span>
                    <strong>12,000+</strong> learners joined
                  </span>
                </div>
              </div>

              <div className="su-shape su-shape-1" />
              <div className="su-shape su-shape-2" />
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="su-right">
              <div className="su-form-wrap">
                <motion.div
                  className="su-form-header"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                >
                  <div className="su-badge">
                    <Sparkles size={12} />
                    <span>It's free forever</span>
                  </div>
                  <h2 className="su-form-title">Create your account</h2>
                  <p className="su-form-sub">
                    Fill in the details below to get started
                  </p>
                </motion.div>

                <StepDots
                  fields={["username", "email", "password"]}
                  formData={formData}
                  errors={errors}
                  touched={touched}
                />

                <AnimatePresence>
                  {serverError && (
                    <motion.div
                      className="su-server-error"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                    >
                      <AlertCircle size={16} className="su-server-error-icon" />
                      <div>
                        <p className="su-server-error-title">
                          Registration failed
                        </p>
                        <p className="su-server-error-msg">{serverError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {signupSuccess && (
                    <motion.div
                      className="su-success-banner"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <CheckCircle2 size={18} />
                      <div>
                        <p className="su-success-title">Account created!</p>
                        <p className="su-success-sub">
                          Redirecting to email verification…
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.form
                  onSubmit={handleSubmit}
                  className="su-form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                  noValidate
                >
                  <Field
                    label="Full Name"
                    icon={User}
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.username}
                    touched={touched.username}
                    autoComplete="name"
                    hint="As it will appear on certificates"
                  />
                  <Field
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.email}
                    touched={touched.email}
                    autoComplete="email"
                    hint="We'll send a verification link"
                  />
                  <div>
                    <Field
                      label="Password"
                      icon={LockKeyhole}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.password}
                      touched={touched.password}
                      isPassword
                      showPassword={showPassword}
                      togglePassword={() => setShowPassword((p) => !p)}
                      autoComplete="new-password"
                    />
                    {formData.password && (
                      <PasswordStrength value={formData.password} />
                    )}
                  </div>

                  {/* TERMS */}
                  <div className="su-terms-row">
                    <button
                      type="button"
                      className={`su-checkbox ${agree ? "checked" : ""} ${agreeError ? "err" : ""}`}
                      onClick={() => {
                        setAgree((p) => !p);
                        setAgreeError(false);
                      }}
                      aria-checked={agree}
                      role="checkbox"
                    >
                      {agree && <CheckCircle2 size={13} />}
                    </button>
                    <span className="su-terms-text">
                      I agree to the{" "}
                      <Link to="/terms" className="su-terms-link">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="su-terms-link">
                        Privacy Policy
                      </Link>
                    </span>
                  </div>
                  <AnimatePresence>
                    {agreeError && (
                      <motion.div
                        className="su-field-msg su-field-msg--err"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ marginTop: -10 }}
                      >
                        <AlertCircle size={12} />
                        <span>Please accept the terms to continue</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    className={`su-submit-btn ${isLoading ? "loading" : ""} ${signupSuccess ? "success" : ""}`}
                    disabled={isLoading || signupSuccess}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={17} className="su-spin" />
                        <span>Creating account…</span>
                      </>
                    ) : signupSuccess ? (
                      <>
                        <CheckCircle2 size={17} />
                        <span>Account created!</span>
                      </>
                    ) : (
                      <>
                        <UserCheck size={17} />
                        <span>Create Free Account</span>
                        <ArrowRight size={17} className="su-arrow" />
                      </>
                    )}
                  </button>

                  <p className="su-footer-text">
                    Already have an account?{" "}
                    <Link to="/login" className="su-footer-link">
                      Sign in instead
                    </Link>
                  </p>
                </motion.form>
              </div>
            </div>
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

.su-root {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: #060c18; padding: 24px; position: relative; overflow: hidden;
  font-family: 'DM Sans', sans-serif;
}

/* absolute (not fixed) → no repaint on scroll */
.su-bg-mesh {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 65% 50% at 15% 10%, rgba(99,102,241,.12) 0%, transparent 60%),
    radial-gradient(ellipse 55% 45% at 85% 90%, rgba(14,165,233,.1) 0%, transparent 60%),
    radial-gradient(ellipse 40% 35% at 55% 55%, rgba(16,185,129,.06) 0%, transparent 55%);
}
.su-bg-grid {
  position: absolute; inset: 0; pointer-events: none; opacity: .02;
  background-image: linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px);
  background-size: 44px 44px;
}

/* GPU-composited orbs */
.su-orb {
  position: absolute; border-radius: 50%; pointer-events: none;
  will-change: transform;
  animation: su-float 9s ease-in-out infinite;
}
.su-orb-1 { width: 360px; height: 360px; background: rgba(99,102,241,.08); top: -100px; right: -80px; filter: blur(72px); animation-delay: 0s; }
.su-orb-2 { width: 300px; height: 300px; background: rgba(14,165,233,.07); bottom: -80px; left: -60px; filter: blur(72px); animation-delay: -3.5s; }
.su-orb-3 { width: 220px; height: 220px; background: rgba(16,185,129,.05); top: 40%; left: 25%; filter: blur(72px); animation-delay: -6s; }

@keyframes su-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-18px); }
}

.su-card-outer { width: 100%; max-width: 940px; position: relative; }
.su-card-outer::before {
  content: ''; position: absolute; inset: -1px; border-radius: 29px;
  background: linear-gradient(135deg, rgba(99,102,241,.3), rgba(14,165,233,.2), rgba(16,185,129,.15));
  z-index: 0; pointer-events: none;
}

.su-card {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: 1fr 1fr;
  border-radius: 28px; overflow: hidden;
  background: #0b1220;
  box-shadow: 0 32px 100px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.05);
}
@media(max-width: 700px) { .su-card { grid-template-columns: 1fr; } }

.su-left {
  background: linear-gradient(145deg, #0d1e36 0%, #0a1830 50%, #081325 100%);
  padding: 40px 36px; display: flex; flex-direction: column; justify-content: space-between;
  position: relative; overflow: hidden;
  border-right: 1px solid rgba(255,255,255,.06);
}
@media(max-width: 700px) { .su-left { display: none; } }
.su-left-inner { display: flex; flex-direction: column; gap: 28px; position: relative; z-index: 2; }

.su-logo { display: flex; align-items: center; gap: 11px; }
.su-logo-icon {
  width: 46px; height: 46px; border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #0ea5e9);
  display: flex; align-items: center; justify-content: center; color: white;
  box-shadow: 0 8px 24px rgba(99,102,241,.35);
}
.su-logo-text { font-family: 'Bricolage Grotesque', sans-serif; font-size: 22px; font-weight: 800; color: #f0f9ff; }

.su-left-title {
  font-family: 'Bricolage Grotesque', sans-serif; font-size: 30px; font-weight: 800;
  line-height: 1.15; color: #e0f2fe;
}
.su-left-accent { background: linear-gradient(135deg, #a5b4fc, #38bdf8, #6ee7b7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.su-left-sub { font-size: 13px; color: #475569; line-height: 1.6; margin-top: 8px; }

.su-steps-label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 10px; }
.su-step-row { display: flex; align-items: center; gap: 12px; font-size: 13px; color: #94a3b8; font-weight: 500; padding: 4px 0; }
.su-step-num {
  width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
  background: rgba(99,102,241,.15); border: 1px solid rgba(99,102,241,.3);
  color: #a5b4fc; font-size: 10px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Bricolage Grotesque', sans-serif;
}

.su-features { display: flex; flex-direction: column; gap: 8px; }
.su-feature-chip {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
  padding: 8px 12px; border-radius: 10px; font-size: 12px; color: #64748b; font-weight: 500;
}
.su-feature-chip svg { color: #6366f1; flex-shrink: 0; }

.su-social-proof { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #475569; }
.su-social-proof strong { color: #94a3b8; }
.su-avatars { display: flex; }
.su-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #0ea5e9);
  border: 2px solid #0b1220; display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; color: white;
}

.su-shape { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(48px); opacity: .4; }
.su-shape-1 { width: 180px; height: 180px; background: rgba(99,102,241,.12); bottom: -50px; right: -50px; }
.su-shape-2 { width: 130px; height: 130px; background: rgba(14,165,233,.1); top: 25%; left: -40px; }

.su-right {
  padding: 36px 40px; display: flex; align-items: center; justify-content: center;
  overflow-y: auto; max-height: 100vh;
}
@media(max-width: 480px) { .su-right { padding: 28px 20px; } }
.su-form-wrap { width: 100%; max-width: 360px; }

.su-form-header { margin-bottom: 18px; }
.su-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(99,102,241,.1); border: 1px solid rgba(99,102,241,.22);
  color: #a5b4fc; padding: 5px 12px; border-radius: 99px; font-size: 12px; font-weight: 600;
  margin-bottom: 12px;
}
.su-form-title {
  font-family: 'Bricolage Grotesque', sans-serif; font-size: 24px; font-weight: 800;
  color: #f0f9ff; line-height: 1.2; margin-bottom: 5px;
}
.su-form-sub { font-size: 13px; color: #475569; }

.su-step-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.su-step-bar-track { flex: 1; height: 4px; background: rgba(255,255,255,.07); border-radius: 99px; overflow: hidden; }
.su-step-bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #0ea5e9); border-radius: 99px; }
.su-step-label { font-size: 11px; color: #475569; white-space: nowrap; font-weight: 600; }

.su-server-error {
  display: flex; align-items: flex-start; gap: 12px;
  background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.25);
  border-radius: 14px; padding: 13px 15px; margin-bottom: 16px;
}
.su-server-error-icon { color: #f87171; flex-shrink: 0; margin-top: 2px; }
.su-server-error-title { font-size: 13px; font-weight: 700; color: #fca5a5; margin-bottom: 2px; }
.su-server-error-msg { font-size: 13px; color: #f87171; line-height: 1.4; }

.su-success-banner {
  display: flex; align-items: center; gap: 12px;
  background: rgba(16,185,129,.08); border: 1px solid rgba(16,185,129,.25);
  border-radius: 14px; padding: 13px 15px; margin-bottom: 16px; color: #6ee7b7;
}
.su-success-title { font-size: 14px; font-weight: 700; }
.su-success-sub { font-size: 12px; color: #10b981; }

.su-form { display: flex; flex-direction: column; gap: 14px; }

.su-field-wrap { display: flex; flex-direction: column; gap: 5px; }
.su-field-label-row { display: flex; align-items: center; justify-content: space-between; }
.su-field-label { font-size: 12px; font-weight: 600; color: #94a3b8; }
.su-field-hint { font-size: 11px; color: #334155; }

.su-field-box {
  display: flex; align-items: center;
  background: rgba(255,255,255,.04); border: 1.5px solid rgba(255,255,255,.09);
  border-radius: 13px; padding: 0 14px; height: 46px;
  transition: border-color .2s, background .2s, box-shadow .2s;
}
.su-field-box:focus-within {
  border-color: #6366f1; background: rgba(99,102,241,.05);
  box-shadow: 0 0 0 3px rgba(99,102,241,.12);
}
.su-field-box.err { border-color: rgba(239,68,68,.5); background: rgba(239,68,68,.04); }
.su-field-box.err:focus-within { box-shadow: 0 0 0 3px rgba(239,68,68,.1); }
.su-field-box.ok { border-color: rgba(16,185,129,.4); }
.su-field-box.ok:focus-within { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,.1); }

.su-field-icon { color: #475569; flex-shrink: 0; margin-right: 10px; transition: color .2s; }
.su-field-box:focus-within .su-field-icon { color: #6366f1; }
.su-field-box.err .su-field-icon { color: #f87171; }
.su-field-box.ok .su-field-icon { color: #10b981; }

.su-input {
  flex: 1; background: none; border: none; outline: none;
  font-size: 14px; color: #f0f9ff; font-family: inherit; font-weight: 500;
}
.su-input::placeholder { color: #1e2d40; }

.su-eye-btn {
  background: none; border: none; color: #475569; cursor: pointer; padding: 2px;
  display: flex; align-items: center; transition: color .15s; margin-left: 8px;
}
.su-eye-btn:hover { color: #6366f1; }
.su-field-check { color: #10b981; margin-left: 8px; }
.su-field-err-icon { color: #f87171; margin-left: 8px; }

.su-field-msg {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 500; padding: 0 2px; overflow: hidden;
}
.su-field-msg--err { color: #f87171; }
.su-field-msg--ok { color: #6ee7b7; }

.su-pw-strength { padding: 4px 0; }
.su-pw-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.su-pw-bars { display: flex; gap: 4px; flex: 1; }
.su-pw-bar { flex: 1; height: 3px; border-radius: 99px; }
.su-pw-label { font-size: 11px; font-weight: 700; flex-shrink: 0; }
.su-pw-checks { display: flex; flex-wrap: wrap; gap: 6px; }
.su-pw-check {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; color: #334155; font-weight: 500; transition: color .2s;
}
.su-pw-check.pass { color: #6ee7b7; }
.su-pw-check svg { flex-shrink: 0; }

.su-terms-row { display: flex; align-items: flex-start; gap: 10px; }
.su-checkbox {
  width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0; margin-top: 1px;
  background: rgba(255,255,255,.04); border: 1.5px solid rgba(255,255,255,.12);
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: all .15s; color: white;
}
.su-checkbox.checked { background: #6366f1; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.2); }
.su-checkbox.err { border-color: #f87171; }
.su-terms-text { font-size: 12px; color: #475569; line-height: 1.5; }
.su-terms-link { color: #6366f1; font-weight: 600; text-decoration: none; transition: color .15s; }
.su-terms-link:hover { color: #a5b4fc; }

.su-submit-btn {
  width: 100%; height: 50px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white; font-size: 15px; font-weight: 700; font-family: inherit;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: transform .15s, box-shadow .15s;
  box-shadow: 0 8px 28px rgba(99,102,241,.3);
  position: relative; overflow: hidden;
}
.su-submit-btn::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.12), transparent);
  opacity: 0; transition: opacity .2s;
}
.su-submit-btn:hover:not(:disabled)::before { opacity: 1; }
.su-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(99,102,241,.4); }
.su-submit-btn:active:not(:disabled) { transform: translateY(0); }
.su-submit-btn:disabled { opacity: .7; cursor: not-allowed; }
.su-submit-btn.success { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 8px 28px rgba(16,185,129,.3); }
.su-arrow { transition: transform .2s; }
.su-submit-btn:hover .su-arrow { transform: translateX(4px); }
.su-spin { animation: su-spin 0.7s linear infinite; }
@keyframes su-spin { to { transform: rotate(360deg); } }

.su-footer-text { text-align: center; font-size: 13px; color: #475569; }
.su-footer-link { color: #6366f1; font-weight: 700; text-decoration: none; transition: color .15s; }
.su-footer-link:hover { color: #a5b4fc; }
`;

export default Signup;
