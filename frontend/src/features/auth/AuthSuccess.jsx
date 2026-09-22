import React, { useEffect } from "react";

import axios from "axios";

import { motion } from "framer-motion";

import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { toast } from "sonner";

import { getData } from "@/context/userContext";

import { TOKEN_KEY } from "@/constants/auth";

const API_BASE = import.meta.env.VITE_API_BASE;

const AuthSuccess = () => {
  const { setUser } = getData();

  const navigate = useNavigate();

  /* HANDLE AUTH */
  useEffect(() => {
    const handleAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);

        const accessToken = params.get("token");

        /* TOKEN NOT FOUND */
        if (!accessToken) {
          toast.error("Authentication failed");

          navigate("/login", {
            replace: true,
          });

          return;
        }

        /* SAVE TOKEN */
        localStorage.setItem(TOKEN_KEY, accessToken);

        /* FETCH USER */
        const res = await axios.get(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res?.data?.success) {
          /* SAVE USER */
          setUser?.(res.data.user);

          localStorage.setItem("user", JSON.stringify(res.data.user));

          toast.success("Login successful");

          /* REDIRECT */
          setTimeout(() => {
            navigate("/", {
              replace: true,
            });
          }, 1200);
        } else {
          throw new Error("Failed to fetch user");
        }
      } catch (error) {
        console.error("Authentication Error:", error);

        localStorage.removeItem(TOKEN_KEY);

        localStorage.removeItem("user");

        toast.error("Authentication failed");

        navigate("/login", {
          replace: true,
        });
      }
    };

    handleAuth();
  }, [navigate, setUser]);

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
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
        }}
        className="
          relative
          w-full
          max-w-sm
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

            p-8
          "
        >
          {/* ICON */}
          <div className="flex justify-center mb-6">
            <div
              className="
                relative

                flex
                items-center
                justify-center

                w-20
                h-20

                rounded-3xl

                bg-gradient-to-br
                from-sky-500
                to-cyan-500

                text-white
                shadow-lg
              "
            >
              {/* PULSE */}
              <div
                className="
                  absolute
                  inset-0

                  rounded-3xl

                  bg-sky-400/30
                  blur-xl
                  animate-pulse
                "
              />

              {/* ICON */}
              <div className="relative">
                <Loader2 size={34} className="animate-spin" />
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Signing You In
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Please wait while we securely verify your account and prepare your
              dashboard.
            </p>
          </div>

          {/* SECURITY BOX */}
          <div
            className="
              mt-6

              rounded-2xl

              border
              border-sky-200
              dark:border-sky-900

              bg-sky-50
              dark:bg-sky-950/20

              p-4
            "
          >
            <div className="flex items-start gap-3">
              {/* ICON */}
              <div
                className="
                  flex
                  items-center
                  justify-center

                  w-10
                  h-10

                  rounded-xl

                  bg-sky-100
                  dark:bg-sky-900/30
                "
              >
                <ShieldCheck size={20} className="text-sky-600" />
              </div>

              {/* TEXT */}
              <div>
                <h3 className="text-sm font-semibold text-sky-700 dark:text-sky-400">
                  Secure Authentication
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                  We are validating your access token and securely loading your
                  account information.
                </p>
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <CheckCircle2 size={16} className="text-green-500" />
            Redirecting shortly...
          </div>

          {/* DOTS */}
          <div className="flex justify-center gap-2 pt-5">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />

            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-100" />

            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-200" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthSuccess;
