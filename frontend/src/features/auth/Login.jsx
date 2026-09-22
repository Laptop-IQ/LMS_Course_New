import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

import { getData } from "@/context/userContext";
import { TOKEN_KEY } from "@/constants/auth";

import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  LockKeyhole,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Trophy,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

/* ─────────────────────────────────────────────
   VALIDATION
───────────────────────────────────────────── */
const validators = {
  email: (v) => {
    if (!v) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
      return "Enter a valid email address";
    return null;
  },
  password: (v) => {
    if (!v) return "Password is required";
    if (v.length < 6) return "Password must be at least 6 characters";
    return null;
  },
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
}) => {
  const hasError = touched && error;
  const hasSuccess = touched && !error && value;

  return (
    <div className="ln-field-wrap">
      <label className="ln-field-label">{label}</label>
      <div
        className={`ln-field-box ${hasError ? "err" : ""} ${hasSuccess ? "ok" : ""}`}
      >
        <Icon size={16} className="ln-field-icon" />
        <input
          name={name}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete || "off"}
          className="ln-input"
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
        {isPassword && (
          <button
            type="button"
            className="ln-eye-btn"
            onClick={togglePassword}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
        {!isPassword && hasSuccess && (
          <CheckCircle2 size={15} className="ln-field-check" />
        )}
      </div>

      <AnimatePresence mode="wait">
        {hasError ? (
          <motion.div
            key="err"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18 }}
            className="ln-field-msg ln-field-msg--err"
          >
            <AlertCircle size={12} />
            <span>{error}</span>
          </motion.div>
        ) : hasSuccess && !isPassword ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18 }}
            className="ln-field-msg ln-field-msg--ok"
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
   PASSWORD STRENGTH
───────────────────────────────────────────── */
const PasswordStrength = ({ value }) => {
  const checks = [
    { pass: value.length >= 6 },
    { pass: /[A-Z]/.test(value) },
    { pass: /[0-9]/.test(value) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["#ef4444", "#f59e0b", "#10b981"];
  const labels = ["Weak", "Fair", "Strong"];

  if (!value) return null;

  return (
    <div className="ln-pw-strength">
      <div className="ln-pw-bars">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="ln-pw-bar"
            style={{
              background:
                i < score ? colors[score - 1] : "rgba(255,255,255,0.08)",
            }}
          />
        ))}
      </div>
      <span
        className="ln-pw-label"
        style={{ color: colors[score - 1] || "#64748b" }}
      >
        {value.length > 0 ? labels[score - 1] || "Weak" : ""}
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN LOGIN COMPONENT
───────────────────────────────────────────── */
const Login = () => {
  const navigate = useNavigate();
  const context = getData();
  const setUser = context?.setUser;

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: null, password: null });
  const [touched, setTouched] = useState({ email: false, password: false });

  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) navigate("/", { replace: true });
  }, [navigate]);

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

    const newTouched = { email: true, password: true };
    setTouched(newTouched);
    const emailErr = validators.email(formData.email);
    const pwErr = validators.password(formData.password);
    setErrors({ email: emailErr, password: pwErr });
    if (emailErr || pwErr) return;

    setServerError("");
    try {
      setIsLoading(true);
      const res = await axios.post(`${API_BASE}/api/users/login`, formData);

      if (res?.data?.success) {
        setLoginSuccess(true);
        localStorage.setItem(TOKEN_KEY, res.data.accessToken);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser?.(res.data.user);
        toast.success("Welcome back! Redirecting…");
        setTimeout(() => navigate("/", { replace: true }), 900);
      } else {
        const msg = res?.data?.message || "Invalid credentials";
        setServerError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const status = err?.response?.status;
      let msg = "Something went wrong. Please try again.";
      if (status === 401) msg = "Incorrect email or password.";
      else if (status === 404) msg = "No account found with this email.";
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

      <div className="ln-root">
        {/* BG — absolute, not fixed, so no per-scroll repaint */}
        <div className="ln-bg-mesh" />
        <div className="ln-bg-grid" />
        <div className="ln-orb ln-orb-1" />
        <div className="ln-orb ln-orb-2" />
        <div className="ln-orb ln-orb-3" />

        <motion.div
          className="ln-card-outer"
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="ln-card">
            {/* ── LEFT PANEL ── */}
            <div className="ln-left">
              <div className="ln-left-inner">
                <div className="ln-logo">
                  <div className="ln-logo-icon">
                    <GraduationCap size={28} />
                  </div>
                  <span className="ln-logo-text">LearnFlow</span>
                </div>

                <div className="ln-left-headline">
                  <h1 className="ln-left-title">
                    Continue your
                    <br />
                    <span className="ln-left-accent">learning journey</span>
                  </h1>
                  <p className="ln-left-sub">
                    Thousands of learners trust us every day to level up their
                    skills.
                  </p>
                </div>

                <div className="ln-features">
                  {[
                    {
                      icon: <BookOpen size={14} />,
                      text: "500+ premium courses",
                    },
                    {
                      icon: <Trophy size={14} />,
                      text: "Earn real certificates",
                    },
                    {
                      icon: <ShieldCheck size={14} />,
                      text: "Secure & private",
                    },
                  ].map((f, i) => (
                    <motion.div
                      key={i}
                      className="ln-feature-chip"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
                    >
                      {f.icon}
                      <span>{f.text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="ln-social-proof">
                  <div className="ln-avatars">
                    {["A", "B", "C", "D"].map((l, i) => (
                      <div
                        key={l}
                        className="ln-avatar"
                        style={{ zIndex: 4 - i, marginLeft: i ? -10 : 0 }}
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                  <span>
                    Joined by <strong>12,000+</strong> learners
                  </span>
                </div>
              </div>

              <div className="ln-shape ln-shape-1" />
              <div className="ln-shape ln-shape-2" />
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="ln-right">
              <div className="ln-form-wrap">
                <motion.div
                  className="ln-form-header"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.35 }}
                >
                  <div className="ln-badge">
                    <Sparkles size={12} />
                    <span>Welcome back</span>
                  </div>
                  <h2 className="ln-form-title">Sign in to your account</h2>
                  <p className="ln-form-sub">
                    Enter your credentials below to continue
                  </p>
                </motion.div>

                <AnimatePresence>
                  {serverError && (
                    <motion.div
                      className="ln-server-error"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                    >
                      <AlertCircle size={16} className="ln-server-error-icon" />
                      <div>
                        <p className="ln-server-error-title">Login failed</p>
                        <p className="ln-server-error-msg">{serverError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {loginSuccess && (
                    <motion.div
                      className="ln-success-banner"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <CheckCircle2 size={18} />
                      <span>Login successful! Redirecting…</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.form
                  onSubmit={handleSubmit}
                  className="ln-form"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22, duration: 0.35 }}
                  noValidate
                >
                  <Field
                    label="Email address"
                    icon={Mail}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.email}
                    touched={touched.email}
                    autoComplete="email"
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
                      autoComplete="current-password"
                    />
                    {formData.password && !errors.password && (
                      <PasswordStrength value={formData.password} />
                    )}
                  </div>

                  <div className="ln-forgot-row">
                    <Link to="/forgot-password" className="ln-forgot-link">
                      Forgot your password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className={`ln-submit-btn ${isLoading ? "loading" : ""} ${loginSuccess ? "success" : ""}`}
                    disabled={isLoading || loginSuccess}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={17} className="ln-spin" />
                        <span>Signing in…</span>
                      </>
                    ) : loginSuccess ? (
                      <>
                        <CheckCircle2 size={17} />
                        <span>Success!</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={17} className="ln-arrow" />
                      </>
                    )}
                  </button>

                  <p className="ln-footer-text">
                    Don't have an account?{" "}
                    <Link to="/signup" className="ln-footer-link">
                      Create one for free
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

.ln-root {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: #060c18; padding: 24px; position: relative; overflow: hidden;
  font-family: 'DM Sans', sans-serif;
}

/* absolute (not fixed) → no repaint on scroll */
.ln-bg-mesh {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse 70% 55% at 20% 15%, rgba(14,165,233,.12) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 80% 85%, rgba(99,102,241,.09) 0%, transparent 60%),
              radial-gradient(ellipse 40% 35% at 60% 20%, rgba(6,182,212,.07) 0%, transparent 55%);
}
.ln-bg-grid {
  position: absolute; inset: 0; pointer-events: none; opacity: .022;
  background-image: linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px);
  background-size: 44px 44px;
}

/* GPU-composited orbs: only transform + opacity, no filter animation */
.ln-orb {
  position: absolute; border-radius: 50%; pointer-events: none;
  will-change: transform;
  animation: ln-float 9s ease-in-out infinite;
}
.ln-orb-1 { width: 340px; height: 340px; background: rgba(14,165,233,.08); top: -80px; left: -80px; filter: blur(72px); animation-delay: 0s; }
.ln-orb-2 { width: 280px; height: 280px; background: rgba(99,102,241,.07); bottom: -60px; right: -60px; filter: blur(72px); animation-delay: -3s; }
.ln-orb-3 { width: 200px; height: 200px; background: rgba(6,182,212,.06); top: 50%; right: 20%; filter: blur(72px); animation-delay: -5s; }

@keyframes ln-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.ln-card-outer {
  width: 100%; max-width: 920px; position: relative;
}
.ln-card-outer::before {
  content: ''; position: absolute; inset: -1px; border-radius: 29px;
  background: linear-gradient(135deg, rgba(14,165,233,.3), rgba(99,102,241,.2), rgba(6,182,212,.15));
  z-index: 0; pointer-events: none;
}

.ln-card {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: 1fr 1fr;
  border-radius: 28px; overflow: hidden;
  background: #0b1220;
  box-shadow: 0 32px 100px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.05);
}
@media(max-width: 700px) { .ln-card { grid-template-columns: 1fr; } }

.ln-left {
  background: linear-gradient(145deg, #0c1e35 0%, #0a1628 50%, #081320 100%);
  padding: 44px 40px; display: flex; flex-direction: column; justify-content: space-between;
  position: relative; overflow: hidden;
  border-right: 1px solid rgba(255,255,255,.06);
}
@media(max-width: 700px) { .ln-left { display: none; } }

.ln-left-inner { display: flex; flex-direction: column; gap: 36px; position: relative; z-index: 2; }

.ln-logo { display: flex; align-items: center; gap: 11px; }
.ln-logo-icon {
  width: 46px; height: 46px; border-radius: 14px;
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  display: flex; align-items: center; justify-content: center; color: white;
  box-shadow: 0 8px 24px rgba(14,165,233,.35);
}
.ln-logo-text { font-family: 'Bricolage Grotesque', sans-serif; font-size: 22px; font-weight: 800; color: #f0f9ff; }

.ln-left-title {
  font-family: 'Bricolage Grotesque', sans-serif; font-size: 32px; font-weight: 800;
  line-height: 1.15; color: #e0f2fe;
}
.ln-left-accent { background: linear-gradient(135deg, #38bdf8, #06b6d4, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.ln-left-sub { font-size: 14px; color: #475569; line-height: 1.6; margin-top: 10px; }

.ln-features { display: flex; flex-direction: column; gap: 10px; }
.ln-feature-chip {
  display: flex; align-items: center; gap: 9px;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
  padding: 9px 14px; border-radius: 12px; font-size: 13px; color: #94a3b8; font-weight: 500;
}
.ln-feature-chip svg { color: #0ea5e9; flex-shrink: 0; }

.ln-social-proof { display: flex; align-items: center; gap: 12px; font-size: 13px; color: #64748b; }
.ln-social-proof strong { color: #94a3b8; }
.ln-avatars { display: flex; }
.ln-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  border: 2px solid #0b1220; display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: white;
}

.ln-shape { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(48px); opacity: .4; }
.ln-shape-1 { width: 200px; height: 200px; background: rgba(14,165,233,.12); bottom: -60px; right: -60px; }
.ln-shape-2 { width: 140px; height: 140px; background: rgba(99,102,241,.1); top: 30%; left: -40px; }

.ln-right { padding: 44px 40px; display: flex; align-items: center; justify-content: center; }
@media(max-width: 480px) { .ln-right { padding: 32px 24px; } }
.ln-form-wrap { width: 100%; max-width: 360px; }

.ln-form-header { margin-bottom: 28px; }
.ln-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(14,165,233,.1); border: 1px solid rgba(14,165,233,.22);
  color: #38bdf8; padding: 5px 12px; border-radius: 99px; font-size: 12px; font-weight: 600;
  margin-bottom: 14px;
}
.ln-form-title {
  font-family: 'Bricolage Grotesque', sans-serif; font-size: 26px; font-weight: 800;
  color: #f0f9ff; line-height: 1.2; margin-bottom: 6px;
}
.ln-form-sub { font-size: 14px; color: #475569; }

.ln-server-error {
  display: flex; align-items: flex-start; gap: 12px;
  background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.25);
  border-radius: 14px; padding: 13px 15px; margin-bottom: 20px;
}
.ln-server-error-icon { color: #f87171; flex-shrink: 0; margin-top: 2px; }
.ln-server-error-title { font-size: 13px; font-weight: 700; color: #fca5a5; margin-bottom: 2px; }
.ln-server-error-msg { font-size: 13px; color: #f87171; line-height: 1.4; }

.ln-success-banner {
  display: flex; align-items: center; gap: 10px;
  background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.25);
  border-radius: 14px; padding: 13px 15px; margin-bottom: 20px;
  color: #6ee7b7; font-size: 14px; font-weight: 600;
}

.ln-form { display: flex; flex-direction: column; gap: 18px; }

.ln-field-wrap { display: flex; flex-direction: column; gap: 6px; }
.ln-field-label { font-size: 13px; font-weight: 600; color: #94a3b8; }
.ln-field-box {
  display: flex; align-items: center;
  background: rgba(255,255,255,.04); border: 1.5px solid rgba(255,255,255,.09);
  border-radius: 13px; padding: 0 14px; height: 48px;
  transition: border-color .2s, background .2s, box-shadow .2s;
}
.ln-field-box:focus-within {
  border-color: #0ea5e9; background: rgba(14,165,233,.05);
  box-shadow: 0 0 0 3px rgba(14,165,233,.12);
}
.ln-field-box.err { border-color: rgba(239,68,68,.5); background: rgba(239,68,68,.04); }
.ln-field-box.err:focus-within { box-shadow: 0 0 0 3px rgba(239,68,68,.1); }
.ln-field-box.ok { border-color: rgba(16,185,129,.4); }
.ln-field-box.ok:focus-within { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,.1); }

.ln-field-icon { color: #475569; flex-shrink: 0; margin-right: 10px; transition: color .2s; }
.ln-field-box:focus-within .ln-field-icon { color: #0ea5e9; }
.ln-field-box.err .ln-field-icon { color: #f87171; }
.ln-field-box.ok .ln-field-icon { color: #10b981; }

.ln-input {
  flex: 1; background: none; border: none; outline: none;
  font-size: 14px; color: #f0f9ff; font-family: inherit; font-weight: 500;
}
.ln-input::placeholder { color: #334155; }

.ln-eye-btn {
  background: none; border: none; color: #475569; cursor: pointer; padding: 2px;
  display: flex; align-items: center; transition: color .15s; margin-left: 8px;
}
.ln-eye-btn:hover { color: #0ea5e9; }
.ln-field-check { color: #10b981; margin-left: 8px; }

.ln-field-msg {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 500; padding: 0 2px; overflow: hidden;
}
.ln-field-msg--err { color: #f87171; }
.ln-field-msg--ok { color: #6ee7b7; }

.ln-pw-strength { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
.ln-pw-bars { display: flex; gap: 5px; flex: 1; }
.ln-pw-bar { flex: 1; height: 4px; border-radius: 99px; transition: background .3s; }
.ln-pw-label { font-size: 11px; font-weight: 700; flex-shrink: 0; }

.ln-forgot-row { display: flex; justify-content: flex-end; margin-top: -6px; }
.ln-forgot-link { font-size: 13px; font-weight: 600; color: #0ea5e9; text-decoration: none; transition: color .15s; }
.ln-forgot-link:hover { color: #38bdf8; }

.ln-submit-btn {
  width: 100%; height: 50px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: white; font-size: 15px; font-weight: 700; font-family: inherit;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 9px;
  transition: transform .15s, box-shadow .15s, background .2s;
  box-shadow: 0 8px 28px rgba(14,165,233,.3);
  position: relative; overflow: hidden;
}
.ln-submit-btn::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.12), transparent);
  opacity: 0; transition: opacity .2s;
}
.ln-submit-btn:hover:not(:disabled)::before { opacity: 1; }
.ln-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(14,165,233,.4); }
.ln-submit-btn:active:not(:disabled) { transform: translateY(0); }
.ln-submit-btn:disabled { opacity: .7; cursor: not-allowed; }
.ln-submit-btn.success { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 8px 28px rgba(16,185,129,.3); }
.ln-arrow { transition: transform .2s; }
.ln-submit-btn:hover .ln-arrow { transform: translateX(4px); }
.ln-spin { animation: ln-spin 0.7s linear infinite; }
@keyframes ln-spin { to { transform: rotate(360deg); } }

.ln-footer-text { text-align: center; font-size: 13px; color: #475569; }
.ln-footer-link { color: #0ea5e9; font-weight: 700; text-decoration: none; transition: color .15s; }
.ln-footer-link:hover { color: #38bdf8; }
`;

export default Login;
