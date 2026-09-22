import React, { useEffect, useState } from "react";

import axios from "axios";

import { motion } from "framer-motion";

import {
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_BASE;

const Verify = () => {
  const { token } = useParams();

  const navigate = useNavigate();

  const [status, setStatus] = useState("Verifying your email...");

  const [state, setState] = useState("loading");
  // loading | success | error

  /* VERIFY EMAIL */
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.post(
          `${API_BASE}/api/users/verify`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res?.data?.success) {
          setStatus(res?.data?.message || "Email Verified Successfully");

          setState("success");

          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          setStatus("Invalid or expired token");

          setState("error");
        }
      } catch (error) {
        setStatus(
          error?.response?.data?.message ||
            "Verification failed. Please try again.",
        );

        setState("error");
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

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
          className={`
            absolute inset-0 blur-3xl opacity-20

            ${
              state === "success"
                ? "bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500"
                : state === "error"
                  ? "bg-gradient-to-r from-red-400 via-rose-400 to-pink-500"
                  : "bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500"
            }
          `}
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

          {/* ICON */}
          <div className="flex justify-center mb-5">
            <div
              className={`
                flex
                items-center
                justify-center

                w-20
                h-20

                rounded-3xl
                text-white
                shadow-lg

                ${
                  state === "success"
                    ? "bg-gradient-to-br from-green-400 to-emerald-500"
                    : state === "error"
                      ? "bg-gradient-to-br from-red-400 to-rose-500"
                      : "bg-gradient-to-br from-sky-500 to-cyan-500"
                }
              `}
            >
              {state === "loading" && (
                <Loader2 size={38} className="animate-spin" />
              )}

              {state === "success" && <CheckCircle2 size={38} />}

              {state === "error" && <XCircle size={38} />}
            </div>
          </div>

          {/* TITLE */}
          <div className="text-center">
            <h1
              className={`
                text-2xl
                font-bold

                ${
                  state === "success"
                    ? "text-green-600"
                    : state === "error"
                      ? "text-red-500"
                      : "text-slate-800 dark:text-white"
                }
              `}
            >
              {status}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {state === "loading" &&
                "Please wait while we securely verify your email address."}

              {state === "success" &&
                "Your account has been verified successfully. Redirecting you to login..."}

              {state === "error" &&
                "The verification link may be invalid or expired. Please request a new verification email."}
            </p>
          </div>

          {/* INFO BOX */}
          <div
            className={`
              mt-6
              rounded-2xl
              p-4
              border

              ${
                state === "success"
                  ? `
                    border-green-200
                    bg-green-50
                    dark:bg-green-950/20
                    dark:border-green-900
                  `
                  : state === "error"
                    ? `
                    border-red-200
                    bg-red-50
                    dark:bg-red-950/20
                    dark:border-red-900
                  `
                    : `
                    border-sky-200
                    bg-sky-50
                    dark:bg-sky-950/20
                    dark:border-sky-900
                  `
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div
                className={`
                  flex
                  items-center
                  justify-center

                  w-10
                  h-10

                  rounded-xl

                  ${
                    state === "success"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : state === "error"
                        ? "bg-red-100 dark:bg-red-900/30"
                        : "bg-sky-100 dark:bg-sky-900/30"
                  }
                `}
              >
                <ShieldCheck
                  size={20}
                  className={`
                    ${
                      state === "success"
                        ? "text-green-600"
                        : state === "error"
                          ? "text-red-500"
                          : "text-sky-600"
                    }
                  `}
                />
              </div>

              <div>
                <h3
                  className={`
                    text-sm
                    font-semibold

                    ${
                      state === "success"
                        ? "text-green-700 dark:text-green-400"
                        : state === "error"
                          ? "text-red-700 dark:text-red-400"
                          : "text-sky-700 dark:text-sky-400"
                    }
                  `}
                >
                  Secure Email Verification
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                  Email verification helps secure your account and ensures safe
                  access to your dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          {state === "error" && (
            <div className="mt-6">
              <Button
                onClick={() => navigate("/verify-email")}
                className="
                  w-full
                  h-11
                  rounded-xl

                  bg-gradient-to-r
                  from-red-500
                  to-rose-500

                  hover:from-red-600
                  hover:to-rose-600
                "
              >
                Request New Verification
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Verify;
