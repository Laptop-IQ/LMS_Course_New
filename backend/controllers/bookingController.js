import Booking from "../models/bookingModel.js";
import User from "../models/userModel.js";
import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();
import { createNotification } from "../utils/createNotification.js";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;

if (!STRIPE_KEY) {
  console.warn(
    "[booking] WARNING: STRIPE_SECRET_KEY is not set. Paid bookings will fail.",
  );
} else if (!/^sk_(test|live)_/.test(STRIPE_KEY)) {
  console.warn(
    "[booking] WARNING: STRIPE_SECRET_KEY looks malformed (expected sk_test_... or sk_live_...).",
  );
}

const stripe = STRIPE_KEY
  ? new Stripe(STRIPE_KEY, { apiVersion: "2023-10-16" })
  : null;

const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const genBookingId = () => `BK-${uuidv4()}`;

const calcExpiry = (validity, from = new Date()) => {
  if (validity === "lifetime") return null;
  const d = new Date(from);
  if (validity === "1year") d.setFullYear(d.getFullYear() + 1);
  else if (validity === "2year") d.setFullYear(d.getFullYear() + 2);
  return d;
};

const VALID_VALIDITY = ["1year", "2year", "lifetime"];
const STRIPE_MIN_AMOUNT_INR = 0.5; // ₹0.50 → 50 paise (Stripe minimum)

function buildFrontendBase(req) {
  if (FRONTEND_URL) return FRONTEND_URL.replace(/\/$/, "");
  const origin = req.get("origin");
  if (origin) return origin.replace(/\/$/, "");
  const host = req.get("host");
  if (host) return `${req.protocol || "http"}://${host}`.replace(/\/$/, "");
  return null;
}

// ─────────────────────────────────────────────────────────
//  GET /api/booking/my  (protected)
// ─────────────────────────────────────────────────────────
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .populate("userId", "username email")
      .lean()
      .exec();

    const now = new Date();
    const enriched = bookings.map((b) => ({
      ...b,
      isExpired:
        b.validity !== "lifetime" && b.expiresAt && new Date(b.expiresAt) < now,
    }));

    return res.status(200).json({
      success: true,
      enrolled: enriched.length > 0,
      bookings: enriched,
    });
  } catch (err) {
    console.error("getUserBookings ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
//  GET /api/booking  (admin)
// ─────────────────────────────────────────────────────────
export const getBookings = async (req, res) => {
  try {
    const { search, limit = 200, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {};
    if (search) {
      const re = new RegExp(search, "i");
      filter.$or = [
        { studentName: re },
        { courseName: re },
        { teacherName: re },
      ];
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("userId", "email username")
        .lean()
        .exec(),
      Booking.countDocuments(filter),
    ]);

    return res.json({ success: true, bookings, total });
  } catch (err) {
    console.error("getBookings error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────
//  GET /api/booking/check?courseId=  (protected)
// ─────────────────────────────────────────────────────────
export const checkBooking = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res
        .status(200)
        .json({ success: true, enrolled: false, booking: null });

    const { courseId } = req.query;
    if (!courseId)
      return res
        .status(400)
        .json({ success: false, message: "CourseId required" });

    const booking = await Booking.findOne({ course: courseId, userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!booking)
      return res
        .status(200)
        .json({ success: true, enrolled: false, booking: null });

    const paid =
      booking.paymentStatus?.toLowerCase() === "paid" ||
      booking.orderStatus?.toLowerCase() === "confirmed" ||
      Boolean(booking.paidAt);

    const expired =
      paid &&
      booking.validity !== "lifetime" &&
      booking.expiresAt &&
      new Date(booking.expiresAt) < new Date();

    return res.status(200).json({
      success: true,
      enrolled: paid && !expired,
      expired,
      booking,
    });
  } catch (err) {
    console.error("checkBooking error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────
//  POST /api/booking/create  (protected)
//
//  EMAIL AUTO-FILL FIX:
//  Frontend (useCheckout.js) now sends `email` in the
//  request body, read from localStorage("user").email.
//  That value flows into Stripe as customer_email, which
//  causes Stripe to pre-fill and lock the email field on
//  the hosted checkout page.
// ─────────────────────────────────────────────────────────
export const createBooking = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });

    const {
      courseId,
      courseName,
      teacherName = "",
      price,
      notes = "",
      email, // ← sent by useCheckout from localStorage("user").email
      studentName,
      validity = "lifetime",
    } = req.body;

    if (!courseId || !courseName)
      return res
        .status(400)
        .json({ success: false, message: "courseId and courseName required" });

    const numericPrice = safeNumber(price);
    if (numericPrice === null || numericPrice < 0)
      return res
        .status(400)
        .json({ success: false, message: "price must be a valid number" });

    if (numericPrice > 0 && numericPrice < STRIPE_MIN_AMOUNT_INR)
      return res.status(400).json({
        success: false,
        message: `Price must be 0 (free) or at least ₹${STRIPE_MIN_AMOUNT_INR}`,
      });

    if (!VALID_VALIDITY.includes(validity))
      return res.status(400).json({
        success: false,
        message: "validity must be 1year, 2year, or lifetime",
      });

    // Short-circuit if already paid
    const existingBooking = await Booking.findOne({
      userId,
      course: courseId,
      paymentStatus: "Paid",
    });
    if (existingBooking) {
      return res.status(200).json({
        success: true,
        message: "Already enrolled",
        booking: existingBooking,
        checkoutUrl: null,
      });
    }

    const bookingId = genBookingId();
    const user = await User.findById(userId).lean();

    // Resolve display name: body > db username > db fullName > email > fallback
    const resolvedStudentName =
      (studentName && String(studentName).trim()) ||
      user?.username ||
      user?.fullName ||
      (email && String(email).trim()) ||
      `User-${String(userId).slice(0, 8)}`;

    // Resolve email: body.email (from localStorage) > db user email
    // Trimmed and coerced to undefined if empty so Stripe doesn't reject it
    const resolvedEmail =
      (email && String(email).trim()) ||
      (user?.email && String(user.email).trim()) ||
      undefined;

    const expiresAt = calcExpiry(validity);

    const basePayload = {
      bookingId,
      userId,
      studentName: resolvedStudentName,
      email: resolvedEmail || null,
      course: courseId,
      courseName,
      teacherName,
      price: numericPrice,
      validity,
      expiresAt,
      paymentMethod: "Online",
      paymentStatus: "Unpaid",
      notes,
      orderStatus: "Pending",
      createdAt: new Date(),
    };

    // ── Free course ──────────────────────────────────────
    if (numericPrice === 0) {
      const booking = await Booking.create({
        ...basePayload,
        paymentStatus: "Paid",
        orderStatus: "Confirmed",
        paidAt: new Date(),
      });

      await User.findByIdAndUpdate(userId, {
        $addToSet: { enrolledCourses: courseId },
      });

      await createNotification({
        io: req.app.get("io"),
        userId: null,
        targetRole: "admin",
        type: "booking",
        title: "New Enrollment",
        message: `${resolvedStudentName} enrolled in "${courseName}" (Free)`,
        metadata: { courseId, senderId: userId },
      });

      return res
        .status(201)
        .json({ success: true, booking, checkoutUrl: null });
    }

    // ── Paid — Stripe session ────────────────────────────
    if (!stripe)
      return res
        .status(500)
        .json({ success: false, message: "Stripe not configured on server" });

    const base = buildFrontendBase(req);
    if (!base)
      return res
        .status(500)
        .json({ success: false, message: "Frontend URL not determined." });

    const successUrl = `${base}/booking/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${base}/booking/cancel`;

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        // ── EMAIL AUTO-FILL: resolvedEmail is the user's real email
        //    from localStorage → pre-fills & locks the field in Stripe UI
        customer_email: resolvedEmail,
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: { name: courseName },
              unit_amount: Math.round(numericPrice * 100),
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        // Store everything in metadata so confirmPayment can build the
        // booking record without a pre-saved DB document
        metadata: {
          bookingId: String(bookingId),
          courseId: String(courseId),
          userId: String(userId),
          studentName: resolvedStudentName,
          validity: String(validity),
          courseName: String(courseName),
          teacherName: String(teacherName),
          price: String(numericPrice),
          email: String(resolvedEmail || ""),
          notes: String(notes || ""),
        },
      });
    } catch (stripeErr) {
      console.error("Stripe session error:", stripeErr);
      const message =
        stripeErr?.raw?.message || stripeErr?.message || "Stripe error";
      return res.status(502).json({
        success: false,
        message: `Payment provider error: ${message}`,
      });
    }

    // Do NOT save to DB here — user hasn't paid yet.
    // confirmPayment creates the record after Stripe verifies payment.
    return res.status(200).json({
      success: true,
      booking: null,
      checkoutUrl: session.url || null,
    });
  } catch (err) {
    console.error("createBooking unexpected:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
//  POST /api/booking/admin/create  (admin)
// ─────────────────────────────────────────────────────────
export const adminCreateBooking = async (req, res) => {
  try {
    const {
      studentName,
      email,
      courseId,
      courseName,
      teacherName = "",
      price = 0,
      validity = "lifetime",
      notes = "",
    } = req.body;

    if (!studentName || !courseId || !courseName)
      return res.status(400).json({
        success: false,
        message: "studentName, courseId, and courseName are required",
      });

    if (!VALID_VALIDITY.includes(validity))
      return res.status(400).json({
        success: false,
        message: "validity must be 1year, 2year, or lifetime",
      });

    const numericPrice = safeNumber(price);
    if (numericPrice === null || numericPrice < 0)
      return res
        .status(400)
        .json({ success: false, message: "price must be a valid number" });

    const expiresAt = calcExpiry(validity);

    const booking = await Booking.create({
      bookingId: genBookingId(),
      userId: null,
      studentName: String(studentName).trim(),
      email: email ? String(email).trim() : undefined,
      course: courseId,
      courseName,
      teacherName,
      price: numericPrice,
      validity,
      expiresAt,
      paymentMethod: "Admin",
      paymentStatus: "Paid",
      orderStatus: "Confirmed",
      notes,
      paidAt: new Date(),
      createdAt: new Date(),
    });

    if (email) {
      await User.findOneAndUpdate(
        { email: String(email).trim().toLowerCase() },
        { $addToSet: { enrolledCourses: courseId } },
      );
    }

    return res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error("adminCreateBooking error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
//  DELETE /api/booking/:id  (admin)
// ─────────────────────────────────────────────────────────
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Booking ID required" });

    const booking = await Booking.findByIdAndDelete(id).lean();
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    return res.json({ success: true, message: "Booking deleted successfully" });
  } catch (err) {
    console.error("deleteBooking error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────
//  GET /api/booking/confirm?session_id=  (protected)
// ─────────────────────────────────────────────────────────
export const confirmPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });

    const { session_id } = req.query;
    if (!session_id)
      return res
        .status(400)
        .json({ success: false, message: "session_id is required" });

    if (!stripe)
      return res
        .status(500)
        .json({ success: false, message: "Stripe not configured" });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session)
      return res
        .status(400)
        .json({ success: false, message: "Invalid session" });

    if (session.payment_status !== "paid")
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed" });

    const meta = session.metadata || {};
    const validity = meta.validity || "lifetime";
    const expiresAt = calcExpiry(validity);

    // Upsert — idempotent on repeated calls (user refreshes success page)
    const upsertPayload = {
      bookingId: meta.bookingId || genBookingId(),
      userId: meta.userId || null,
      studentName: meta.studentName || "Unknown",
      course: meta.courseId || null,
      courseName: meta.courseName || "",
      teacherName: meta.teacherName || "",
      price: safeNumber(meta.price) ?? 0,
      email: meta.email || null,
      notes: meta.notes || "",
      validity,
      expiresAt,
      paymentStatus: "Paid",
      paymentIntentId: session.payment_intent || null,
      sessionId: session_id,
      orderStatus: "Confirmed",
      paidAt: new Date(),
      paymentMethod: "Online",
    };

    const booking = await Booking.findOneAndUpdate(
      { sessionId: session_id },
      { $set: upsertPayload },
      { new: true, upsert: true },
    );

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    if (booking.userId) {
      await User.findByIdAndUpdate(booking.userId, {
        $addToSet: { enrolledCourses: booking.course },
      });
    }

    await createNotification({
      io: req.app.get("io"),
      userId: null,
      targetRole: "admin",
      type: "booking",
      title: "New Paid Enrollment",
      message: `${booking.studentName} paid and enrolled in "${booking.courseName}"`,
      metadata: { courseId: booking.course, senderId: booking.userId },
    });

    return res.json({ success: true, booking });
  } catch (err) {
    console.error("confirmPayment:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
//  GET /api/booking/stats  (admin)
// ─────────────────────────────────────────────────────────
export const getStats = async (req, res) => {
  try {
    const now = new Date();

    const totalBookings = await Booking.countDocuments();

    const totalRevenueAgg = await Booking.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const bookingsLast7Days = await Booking.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const bookingsPrev7Days = await Booking.countDocuments({
      createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
    });

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [thisMonthBookings, lastMonthBookings] = await Promise.all([
      Booking.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Booking.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
    ]);

    const revenueAgg = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          createdAt: { $gte: startOfLastMonth },
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $gte: ["$createdAt", startOfThisMonth] },
              "thisMonth",
              "lastMonth",
            ],
          },
          total: { $sum: "$price" },
        },
      },
    ]);
    const thisMonthRevenue =
      revenueAgg.find((r) => r._id === "thisMonth")?.total || 0;
    const lastMonthRevenue =
      revenueAgg.find((r) => r._id === "lastMonth")?.total || 0;

    const dailyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      weeklyData.push({
        date: key,
        count: dailyBookings.find((x) => x._id === key)?.count || 0,
      });
    }

    const dailyRevenue = await Booking.aggregate([
      { $match: { paymentStatus: "Paid", createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$price" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const weeklyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      weeklyRevenue.push({
        date: key,
        total: dailyRevenue.find((x) => x._id === key)?.total || 0,
      });
    }

    const expiredCount = await Booking.countDocuments({
      validity: { $ne: "lifetime" },
      expiresAt: { $lt: now },
      paymentStatus: "Paid",
    });

    const validityBreakdown = await Booking.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: "$validity", count: { $sum: 1 } } },
    ]);

    const topCourses = await Booking.aggregate([
      {
        $group: {
          _id: "$courseName",
          count: { $sum: 1 },
          revenue: { $sum: "$price" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $project: { courseName: "$_id", count: 1, revenue: 1, _id: 0 } },
    ]);

    const pctChange = (current, previous) => {
      if (!previous) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return res.json({
      success: true,
      stats: {
        totalBookings,
        totalRevenue,
        bookingsLast7Days,
        expiredCount,
        validityBreakdown,
        topCourses,
        weeklyData,
        weeklyRevenue,
        thisMonthBookings,
        lastMonthBookings,
        thisMonthRevenue,
        lastMonthRevenue,
        bookingsPrev7Days,
        revenueChangePercent: pctChange(thisMonthRevenue, lastMonthRevenue),
        bookingsChangePercent: pctChange(thisMonthBookings, lastMonthBookings),
        weeklyBookingsChangePercent: pctChange(
          bookingsLast7Days,
          bookingsPrev7Days,
        ),
      },
    });
  } catch (err) {
    console.error("getStats:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────
//  GET /api/booking/cancel?session_id=  (public)
// ─────────────────────────────────────────────────────────
export const cancelPayment = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ success: false });

    // Only update if a record exists — no-op if user abandoned before DB write
    await Booking.findOneAndUpdate(
      { sessionId: session_id },
      { paymentStatus: "Unpaid", orderStatus: "Cancelled" },
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("cancelPayment:", err);
    return res.status(500).json({ success: false });
  }
};
