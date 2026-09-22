import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { TOKEN_KEY } from "@/constants/auth";

const API_BASE = import.meta.env.VITE_API_BASE;

/* ─────────────────────────────────────────────
   HELPER — safely parse stored user object
───────────────────────────────────────────── */
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/* ─────────────────────────────────────────────
   useCheckout hook

   Usage:
     const { initiateCheckout, isLoading } = useCheckout();

     <button
       onClick={() =>
         initiateCheckout({
           courseId:    course._id,
           courseName:  course.title,
           teacherName: course.instructor ?? "",
           price:       course.price,
           validity:    "lifetime",   // "1year" | "2year" | "lifetime"
         })
       }
       disabled={isLoading}
     >
       {isLoading ? "Please wait…" : "Buy Now"}
     </button>

   What this does:
   1. Reads logged-in user email + name from localStorage
      (saved by Login.jsx → localStorage.setItem("user", ...))
   2. Sends `email` in the POST body → bookingController.createBooking
      reads req.body.email → passed to Stripe as customer_email
   3. Stripe pre-fills & locks the email field on the checkout page
   4. On success redirect → VerifyPaymentPage confirms & enrolls
───────────────────────────────────────────── */
const useCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);

  const initiateCheckout = async ({
    courseId,
    courseName,
    teacherName = "",
    price,
    validity = "lifetime",
    notes = "",
  }) => {
    if (!courseId || !courseName) {
      toast.error("Invalid course. Please try again.");
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      toast.error("Please log in to purchase this course.");
      return;
    }

    // ── Read user from localStorage (set during login) ──
    const user = getStoredUser();
    const email = user?.email?.trim() || "";
    const studentName = user?.username?.trim() || user?.fullName?.trim() || "";

    try {
      setIsLoading(true);

      const res = await axios.post(
        `${API_BASE}/api/booking/create`,
        {
          courseId,
          courseName,
          teacherName,
          price,
          validity,
          notes,
          email, // ← controller reads req.body.email → Stripe customer_email
          studentName, // ← controller uses this for the booking record
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
        },
      );

      // Free course — already enrolled, no Stripe redirect
      if (res?.data?.success && !res.data.checkoutUrl) {
        toast.success("Enrolled successfully!");
        return { success: true, free: true };
      }

      const checkoutUrl = res?.data?.checkoutUrl;
      if (!checkoutUrl) {
        throw new Error("No checkout URL returned from server.");
      }

      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      const status = err?.response?.status;
      const srvMsg = err?.response?.data?.message;
      let msg = "Could not start checkout. Please try again.";

      if (status === 400) msg = srvMsg || "Invalid request.";
      else if (status === 401) msg = "Session expired. Please log in again.";
      else if (status === 404) msg = "Course not found.";
      else if (status === 409 || srvMsg === "Already enrolled")
        msg = "You are already enrolled in this course.";
      else if (status === 429) msg = "Too many requests. Please wait a moment.";
      else if (status === 500) msg = "Server error. Please try again later.";
      else if (status === 502) msg = srvMsg || "Payment provider error.";
      else if (err?.message) msg = err.message;

      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return { initiateCheckout, isLoading };
};

export default useCheckout;
