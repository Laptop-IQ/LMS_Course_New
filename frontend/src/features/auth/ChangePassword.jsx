import React, { useState } from "react";

import axios from "axios";

import { motion } from "framer-motion";

import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_BASE = import.meta.env.VITE_API_BASE;

/* ---------------- Floating Password Input ---------------- */
const PasswordInput = ({
  label,
  value,
  onChange,
  showPassword,
  togglePassword,
}) => {
  return (
    <div className="relative w-full">
      {/* ICON */}
      <Lock
        size={16}
        className="
          absolute
          left-3
          top-1/2
          -translate-y-1/2
          text-slate-500
          dark:text-slate-400
        "
      />

      {/* INPUT */}
      <Input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="
          peer
          h-11
          pl-10
          pr-10
          text-sm
          rounded-xl

          bg-white
          dark:bg-slate-900

          text-slate-800
          dark:text-slate-100

          border
          border-slate-300
          dark:border-slate-700

          placeholder:text-transparent

          shadow-none
          outline-none

          focus:outline-none
          focus:ring-0
          focus:ring-offset-0
          focus:border-sky-500

          transition-all
          duration-200
        "
      />

      {/* LABEL */}
      <label
        className={`
          absolute
          left-10
          px-1
          pointer-events-none
          transition-all
          duration-200

          ${
            value
              ? "-top-2 text-xs bg-white dark:bg-slate-900 text-sky-500"
              : "top-3 text-sm text-slate-500 dark:text-slate-400"
          }

          peer-focus:-top-2
          peer-focus:text-xs
          peer-focus:text-sky-500
          peer-focus:bg-white
          dark:peer-focus:bg-slate-900
        `}
      >
        {label}
      </label>

      {/* TOGGLE */}
      <button
        type="button"
        onClick={togglePassword}
        className="
          absolute
          right-3
          top-1/2
          -translate-y-1/2

          text-slate-500
          dark:text-slate-400

          hover:text-sky-500
          transition
        "
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

/* ---------------- Change Password ---------------- */
const ChangePassword = () => {
  const { email } = useParams();

  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  /* CHANGE PASSWORD */
  const handleChangePassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);

      const res = await axios.post(
        `${API_BASE}/api/users/change-password/${email}`,
        {
          newPassword,
          confirmPassword,
        },
      );

      if (res?.data?.success) {
        setSuccess(res?.data?.message || "Password changed successfully");

        toast.success("Password updated");

        setTimeout(() => {
          navigate("/login");
        }, 1800);
      }
    } catch (error) {
      setError(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        px-4

        bg-gradient-to-br
        from-sky-50
        via-white
        to-cyan-50

        dark:from-slate-950
        dark:via-slate-900
        dark:to-slate-950
      "
    >
      {/* WRAPPER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-3xl
        "
      >
        {/* GLOW */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-r
            from-sky-500
            via-cyan-400
            to-indigo-500
            opacity-20
            blur-3xl
          "
        />

        {/* CARD */}
        <div
          className="
            relative

            overflow-hidden
            rounded-3xl

            border border-white/20
            dark:border-slate-800

            bg-white/80
            dark:bg-slate-900/80

            backdrop-blur-2xl
            shadow-2xl

            p-6 md:p-8
          "
        >
          {/* BACK */}
          <Link
            to="/login"
            className="
              inline-flex
              items-center
              gap-2
              mb-6

              text-sm
              text-slate-500
              dark:text-slate-400

              hover:text-sky-500
              transition
            "
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>

          {/* HEADER */}
          <div className="text-center mb-6">
            <div
              className="
                mx-auto
                mb-4

                flex
                items-center
                justify-center

                w-16
                h-16

                rounded-2xl

                bg-gradient-to-br
                from-sky-500
                to-cyan-500

                text-white
              "
            >
              <ShieldCheck size={30} />
            </div>

            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Change Password
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-6">
              Create a new secure password for
            </p>

            <p className="mt-1 text-sm font-semibold text-sky-600 break-all">
              {email}
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div
              className="
                mb-5
                rounded-xl
                border
                border-red-200
                bg-red-50
                dark:bg-red-950/30
                dark:border-red-900
                p-3
                text-center
              "
            >
              <p className="text-sm font-medium text-red-500">{error}</p>
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div
              className="
                mb-5
                rounded-xl
                border
                border-green-200
                bg-green-50
                dark:bg-green-950/30
                dark:border-green-900
                p-3
                text-center
              "
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" />

                <p className="text-sm font-medium text-green-600">{success}</p>
              </div>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* NEW PASSWORD */}
            <PasswordInput
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              showPassword={showNewPassword}
              togglePassword={() => setShowNewPassword((prev) => !prev)}
            />

            {/* CONFIRM PASSWORD */}
            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              showPassword={showConfirmPassword}
              togglePassword={() => setShowConfirmPassword((prev) => !prev)}
            />

            {/* BUTTON */}
            <Button
              type="submit"
              disabled={isLoading}
              className="
                w-full
                h-11
                rounded-xl
                text-sm
                font-medium

                bg-gradient-to-r
                from-sky-500
                to-cyan-500

                hover:from-sky-600
                hover:to-cyan-600

                transition-all
                duration-200

                disabled:opacity-70
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>

          {/* FOOTER */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Use a strong password with letters, numbers, and symbols.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
