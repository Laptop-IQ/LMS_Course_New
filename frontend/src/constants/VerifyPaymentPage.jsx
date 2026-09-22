import React, { useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { TOKEN_KEY } from "@/constants/auth";

const API_BASE = import.meta.env.VITE_API_BASE;

/* ─────────────────────────────────────────────
   VerifyPaymentPage

   Mounted at the Stripe success_url, e.g.:
     /booking/success?session_id=cs_xxx

   Flow:
   1. Reads session_id from URL
   2. Calls GET /api/booking/confirm?session_id=
      (protected — sends Bearer token)
   3. Backend verifies payment_status === "paid"
      with Stripe, upserts the booking record,
      and adds the course to user.enrolledCourses
   4. Redirects to /mycourses on success,
      /courses on failure
───────────────────────────────────────────── */
const VerifyPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const safeNavigate = (url) => {
      if (!cancelled) navigate(url, { replace: true });
    };

    const verifyPayment = async () => {
      const params = new URLSearchParams(location.search);
      const session_id = params.get("session_id")?.trim();

      if (!session_id) {
        safeNavigate("/courses?payment_status=Unpaid");
        return;
      }

      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        safeNavigate("/login");
        return;
      }

      try {
        const res = await axios.get(`${API_BASE}/api/booking/confirm`, {
          params: { session_id },
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
        });

        if (res?.data?.success === true) {
          safeNavigate("/mycourses?payment_status=Paid");
        } else {
          safeNavigate("/courses?payment_status=Unpaid");
        }
      } catch {
        safeNavigate("/courses?payment_status=Unpaid");
      }
    };

    verifyPayment();
    return () => {
      cancelled = true;
    };
  }, [location.search, navigate]);

  // Returns null — this page is a pure redirect handler.
  // Wrap with a loading spinner in your router if desired.
  return null;
};

export default VerifyPaymentPage;
