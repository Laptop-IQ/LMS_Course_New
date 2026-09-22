import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import AuthLayout from "../../components/AuthLayout";
import OTPInput from "../../components/OTPInput";

const Signup = () => {
  const { signup, verifySignupOTP, resendOTP, loading, error, clearError } = useAdminAuth();

  const [step, setStep] = useState("signup"); // "signup" | "otp"
  const [adminId, setAdminId] = useState("");
  const [otp, setOtp] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });

  const handleChange = (e) => {
    clearError();
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const startTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return;
    }
    const result = await signup({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    });
    if (result.success) {
      setAdminId(result.adminId);
      setStep("otp");
      setSuccessMsg("OTP sent to your email. Please verify.");
      startTimer();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    await verifySignupOTP(adminId, otp);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    const result = await resendOTP(adminId, "verify");
    if (result.success) {
      setSuccessMsg("OTP resent successfully.");
      startTimer();
    }
  };

  const passwordMismatch =
    form.confirmPassword && form.password !== form.confirmPassword;

  return (
    <AuthLayout
      title="Create Account"
      subtitle={step === "signup" ? "Register a new admin account" : "Verify your email address"}
    >
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

      {/* ── STEP 1: Signup Form ── */}
      {step === "signup" && (
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white
                         placeholder:text-slate-500 focus:outline-none focus:border-indigo-500
                         focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>

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
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white
                         focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30
                         transition-all appearance-none"
            >
              <option value="admin" className="bg-slate-800">Admin</option>
              <option value="moderator" className="bg-slate-800">Moderator</option>
              <option value="superadmin" className="bg-slate-800">Superadmin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
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
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              required
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white
                          placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all
                          ${passwordMismatch
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                            : "border-white/20 focus:border-indigo-500 focus:ring-indigo-500/30"
                          }`}
            />
            {passwordMismatch && (
              <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || passwordMismatch}
            className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                       text-white font-semibold rounded-xl transition-all duration-200
                       shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-center text-slate-400 text-sm">
            Already have an account?{" "}
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
            We sent a 6-digit code to <span className="text-white font-medium">{form.email}</span>
          </p>

          <OTPInput value={otp} onChange={setOtp} />

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                       text-white font-semibold rounded-xl transition-all duration-200
                       shadow-lg shadow-indigo-500/25"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
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
        </form>
      )}
    </AuthLayout>
  );
};

export default Signup;
