import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import AuthLayout from "../../components/AuthLayout";
import OTPInput from "../../components/OTPInput";

const Login = () => {
  const { login, verifyLoginOTP, resendOTP, loading, error, clearError } = useAdminAuth();

  const [step, setStep] = useState("login"); // "login" | "otp"
  const [adminId, setAdminId] = useState("");
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const [successMsg, setSuccessMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const handleChange = (e) => {
    clearError();
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Start 30s resend countdown
  const startTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(form);
    if (result.success) {
      setAdminId(result.adminId);
      setStep("otp");
      setSuccessMsg("OTP sent to your registered email.");
      startTimer();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    await verifyLoginOTP(adminId, otp);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    const result = await resendOTP(adminId, "login");
    if (result.success) {
      setSuccessMsg("OTP resent successfully.");
      startTimer();
    }
  };

  return (
    <AuthLayout
      title="Admin Login"
      subtitle={step === "login" ? "Sign in to your admin panel" : "Enter the OTP sent to your email"}
    >
      {/* Error */}
      {error && (
        <div className="mb-5 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center">
          {error}
        </div>
      )}

      {/* Success */}
      {successMsg && (
        <div className="mb-5 px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 text-sm text-center">
          {successMsg}
        </div>
      )}

      {/* ── STEP 1: Login Form ── */}
      {step === "login" && (
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white
                         placeholder:text-slate-500 focus:outline-none focus:border-indigo-500
                         focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white
                         placeholder:text-slate-500 focus:outline-none focus:border-indigo-500
                         focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>

          <div className="text-right">
            <Link to="/admin/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                       text-white font-semibold rounded-xl transition-all duration-200
                       shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-slate-400 text-sm">
            Don't have an account?{" "}
            <Link to="/admin/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign Up
            </Link>
          </p>
        </form>
      )}

      {/* ── STEP 2: OTP ── */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <OTPInput value={otp} onChange={setOtp} />

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                       text-white font-semibold rounded-xl transition-all duration-200
                       shadow-lg shadow-indigo-500/25"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0}
              className="text-sm text-indigo-400 hover:text-indigo-300 disabled:text-slate-500 transition-colors"
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => { setStep("login"); setOtp(""); clearError(); setSuccessMsg(""); }}
            className="w-full text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Login
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default Login;
