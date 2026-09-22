import React, { useRef, useState } from "react";

import axios from "axios";

import { motion } from "framer-motion";

import {
  CheckCircle,
  Loader2,
  RotateCcw,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_BASE = import.meta.env.VITE_API_BASE;

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const inputRefs = useRef([]);

  const { email } = useParams();
  const navigate = useNavigate();

  /* HANDLE OTP CHANGE */
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const updatedOtp = [...otp];

    updatedOtp[index] = value;

    setOtp(updatedOtp);

    /* AUTO NEXT */
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /* HANDLE BACKSPACE */
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /* VERIFY OTP */
  const handleVerify = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    try {
      setIsLoading(true);

      setError("");

      const res = await axios.post(`${API_BASE}/api/users/verify-otp/${email}`, {
        otp: finalOtp,
      });

      if (res?.data?.success) {
        setSuccessMessage(res?.data?.message || "OTP verified successfully");

        setIsVerified(true);

        toast.success("OTP Verified");

        setTimeout(() => {
          navigate(`/change-password/${email}`);
        }, 1800);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  /* CLEAR OTP */
  const clearOtp = () => {
    setOtp(["", "", "", "", "", ""]);

    setError("");

    inputRefs.current[0]?.focus();
  };

  /* RESEND OTP */
  const resendOtp = async () => {
    try {
      setIsLoading(true);

      const res = await axios.post(`${API_BASE}/users/send-reset-otp`, {
        email,
      });

      if (res?.data?.success) {
        toast.success(res?.data?.message || "OTP resent");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resend OTP");
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
            to="/forgot-password"
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
            Back
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
              Verify OTP
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-6">
              Enter the 6-digit verification code sent to
            </p>

            <p className="mt-1 text-sm font-semibold text-sky-600 break-all">
              {email}
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <Alert variant="destructive" className="mb-5 rounded-xl">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* SUCCESS */}
          {successMessage && (
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
              <p className="text-sm font-medium text-green-600">
                {successMessage}
              </p>
            </div>
          )}

          {/* OTP INPUTS */}
          {!isVerified && (
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={digit}
                  maxLength={1}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="
                    h-14
                    w-14

                    text-center
                    text-lg
                    font-bold

                    rounded-2xl

                    bg-white
                    dark:bg-slate-900

                    border
                    border-slate-300
                    dark:border-slate-700

                    text-slate-800
                    dark:text-white

                    focus:ring-0
                    focus:outline-none
                    focus:border-sky-500
                  "
                />
              ))}
            </div>
          )}

          {/* VERIFIED */}
          {isVerified && (
            <div className="flex flex-col items-center justify-center py-4">
              <CheckCircle className="text-green-500 mb-3" size={50} />

              <p className="text-green-600 font-semibold">
                OTP Verified Successfully
              </p>

              <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin" />
                Redirecting...
              </div>
            </div>
          )}

          {/* BUTTONS */}
          {!isVerified && (
            <div className="space-y-3">
              {/* VERIFY */}
              <Button
                onClick={handleVerify}
                disabled={isLoading || otp.includes("")}
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
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              {/* CLEAR */}
              <Button
                variant="outline"
                onClick={clearOtp}
                disabled={isLoading}
                className="
                  w-full
                  h-11
                  rounded-xl
                "
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear OTP
              </Button>

              {/* RESEND */}
              <Button
                variant="ghost"
                onClick={resendOtp}
                disabled={isLoading}
                className="
                  w-full
                  text-sky-600
                  hover:text-sky-700
                  hover:bg-sky-50
                  dark:hover:bg-slate-800
                "
              >
                Resend OTP
              </Button>
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Wrong email?{" "}
              <Link
                to="/forgot-password"
                className="font-medium text-sky-600 hover:text-sky-700"
              >
                Change Email
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
