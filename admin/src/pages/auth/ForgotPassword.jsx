import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import AuthLayout from "../../components/AuthLayout";
import OTPInput from "../../components/OTPInput";

const ForgotPassword = () => {
  const { forgotPassword, verifyResetOTP, resetPassword, resendOTP, loading, error, clearError } =
    useAdminAuth();

  // step: "email" | "otp" | "reset"
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [adminId, setAdminId] = useState("");
  const [otp, setOtp] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });

  const startTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── STEP 1: Send OTP ──
  const handleSendOTP = async (e) => {
    e.preventDefault();
    clearError();
    const result = await forgotPassword(email);
    if (result.success) {
      setAdminId(result.adminId);
      setStep("otp");
      setSuccessMsg("OTP sent to your email.");
      startTimer();
    }
  };

  // ── STEP 2: Verify OTP ──
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    clearError();
    const result = await verifyResetOTP(adminId, otp);
    if (result.success) {
      setStep("reset");
      setSuccessMsg("");
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    const result = await resendOTP(adminId, "reset");
    if (result.success) {
      setSuccessMsg("OTP resent.");
      startTimer();
    }
  };

  // ── STEP 3: Reset Password ──
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearError();
    await resetPassword(adminId, passwords.newPassword, passwords.confirmPassword);
  };

  const mismatch =
    passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword;

  const stepTitles = {
    email: { title: "Forgot Password", subtitle: "Enter your admin email to receive an OTP" },
    otp: { title: "Verify OTP", subtitle: "Enter the 6-digit code sent to your email" },
    reset: { title: "Reset Password", subtitle: "Create a new secure password" },
  };

  // Step indicator
  const steps = ["email", "otp", "reset"];
  const currentStepIndex = steps.indexOf(step);

  return (
    <AuthLayout title={stepTitles[step].title} subtitle={stepTitles[step].subtitle}>
      {/* Step dots */}
      <div className="flex justify-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= currentStepIndex ? "bg-indigo-500 w-8" : "bg-white/20 w-4"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-5 px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 text-sm text-center">
          {successMsg}
        </div>
      )}

      {/* ── STEP 1: Email ── */}
      {step === "email" && (
        <form onSubmit={handleSendOTP} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { clearError(); setEmail(e.target.value); }}
              placeholder="admin@example.com"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white
                         placeholder:text-slate-500 focus:outline-none focus:border-indigo-500
                         focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                       text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          <p className="text-center text-slate-400 text-sm">
            Remembered?{" "}
            <Link to="/admin/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </form>
      )}

      {/* ── STEP 2: OTP ── */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <p className="text-center text-slate-400 text-sm">
            Code sent to <span className="text-white font-medium">{email}</span>
          </p>

          <OTPInput value={otp} onChange={setOtp} />

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                       text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
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
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => { setStep("email"); setOtp(""); clearError(); }}
            className="w-full text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </form>
      )}

      {/* ── STEP 3: New Password ── */}
      {step === "reset" && (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => { clearError(); setPasswords({ ...passwords, newPassword: e.target.value }); }}
              placeholder="Min. 6 characters"
              required
              minLength={6}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white
                         placeholder:text-slate-500 focus:outline-none focus:border-indigo-500
                         focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => { clearError(); setPasswords({ ...passwords, confirmPassword: e.target.value }); }}
              placeholder="Re-enter password"
              required
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white
                          placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
                          ${mismatch
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                            : "border-white/20 focus:border-indigo-500 focus:ring-indigo-500/30"
                          }`}
            />
            {mismatch && <p className="mt-1 text-xs text-red-400">Passwords do not match</p>}
          </div>

          <button
            type="submit"
            disabled={loading || mismatch}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                       text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
