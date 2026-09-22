import React, { useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";

import axios from "axios";

import { Mail, Loader2, ShieldCheck, ArrowLeft, KeyRound } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

/* ---------------- Floating Input ---------------- */
const FloatingInput = ({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  disabled,
}) => {
  return (
    <div className="relative w-full">
      {/* ICON */}
      <Icon
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
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder=" "
        required
        className="
          peer
          h-11
          pl-10
          pr-4
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
          focus:border-yellow-400

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
              ? "-top-2 text-xs bg-white dark:bg-slate-900 text-yellow-500"
              : "top-3 text-sm text-slate-500 dark:text-slate-400"
          }

          peer-focus:-top-2
          peer-focus:text-xs
          peer-focus:text-yellow-500
          peer-focus:bg-white
          dark:peer-focus:bg-slate-900
        `}
      >
        {label}
      </label>
    </div>
  );
};

/* ---------------- Forgot Password ---------------- */
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  /* SEND OTP */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    try {
      setIsLoading(true);

      const res = await axios.post(`${API_BASE}/api/users/forgot-password`, {
        email,
      });

      if (res?.data?.success) {
        toast.success(res?.data?.message || "OTP sent successfully");

        navigate(`/verify-otp/${email}`);

        setEmail("");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send OTP");
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
          max-w-5xl
          overflow-hidden
          rounded-3xl
        "
      >
        {/* OUTER GLOW */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-r
            from-yellow-400
            via-orange-400
            to-amber-500
            opacity-20
            blur-3xl
          "
        />

        {/* MAIN CARD */}
        <div
          className="
            relative
            grid
            md:grid-cols-2

            overflow-hidden
            rounded-3xl

            border border-white/20
            dark:border-slate-800

            bg-white/80
            dark:bg-slate-900/80

            backdrop-blur-2xl
            shadow-2xl
          "
        >
          {/* LEFT SECTION */}
          <div
            className="
              hidden md:flex
              flex-col
              items-center
              justify-center

              p-10

              bg-gradient-to-br
              from-yellow-400
              to-orange-500

              text-white
            "
          >
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm mb-5">
              <KeyRound size={42} />
            </div>

            <h1 className="text-3xl font-bold text-center">Send OTP</h1>

            <p className="mt-3 text-sm text-white/80 text-center max-w-xs leading-6">
              Enter your email address to receive a secure OTP for password
              reset verification.
            </p>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
              {/* BACK BUTTON */}
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

                  hover:text-yellow-500
                  transition
                "
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>

              {/* TITLE */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Forgot Password?
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-6">
                  We’ll send a One-Time Password (OTP) to your registered email
                  address.
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* EMAIL */}
                <FloatingInput
                  label="Email Address"
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
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
                    from-yellow-400
                    to-orange-500

                    hover:from-yellow-500
                    hover:to-orange-600

                    transition-all
                    duration-200

                    disabled:opacity-70
                  "
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </form>

              {/* FOOTER */}
              <p
                className="
                  mt-5
                  text-center
                  text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Check your inbox and spam folder after sending the OTP.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
