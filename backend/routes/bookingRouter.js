import express from "express";
import {
  createBooking,
  adminCreateBooking,
  deleteBooking,
  getBookings,
  getStats,
  getUserBookings,
  checkBooking,
  confirmPayment,
  cancelPayment,
} from "../controllers/bookingController.js";
import { isAuthenticated } from "../middleware/userAuthenticated.js";

const bookingRouter = express.Router();

// ── Public / Admin routes ──────────────────────────────────────────────────
bookingRouter.get("/", getBookings); // GET  /api/booking
bookingRouter.get("/stats", getStats); // GET  /api/booking/stats
bookingRouter.get("/cancel", cancelPayment); // GET  /api/booking/cancel?session_id=

// Admin: create booking directly (no payment)
bookingRouter.post("/admin/create", adminCreateBooking); // POST /api/booking/admin/create

// Admin: delete booking by MongoDB _id
bookingRouter.delete("/:id", deleteBooking); // DELETE /api/booking/:id

// ── Protected (logged-in user) routes ─────────────────────────────────────
// ✅ FIX: /confirm mein isAuthenticated add kiya — warna req.user undefined hota
//         aur enrolledCourses kabhi update nahi hota tha
bookingRouter.get("/confirm", isAuthenticated, confirmPayment); // GET  /api/booking/confirm?session_id=
bookingRouter.get("/check", isAuthenticated, checkBooking); // GET  /api/booking/check?courseId=
bookingRouter.get("/my", isAuthenticated, getUserBookings); // GET  /api/booking/my
bookingRouter.post("/create", isAuthenticated, createBooking); // POST /api/booking/create

export default bookingRouter;
