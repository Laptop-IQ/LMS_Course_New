// controllers/analyticsController.js
import Booking from "../models/bookingModel.js";
import Course from "../models/courseModel.js";
import { StudyLog } from "../models/progressModel.js"; // ← apka actual import
import { CourseView } from "../models/courseViewModel.js";

// ─── helpers ────────────────────────────────────────────────────────────────
const pctChange = (curr, prev) => {
  if (!prev) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
};

const dateKey = (d) => d.toISOString().slice(0, 10);

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

const fillDays = (rows, days) => {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = dateKey(d);
    const found = rows.find((r) => r.date === k);
    result.push({ date: k, value: found?.value || 0 });
  }
  return result;
};

// ─── GET /api/analytics/overview?days=7|28|90|365 ───────────────────────────
export const getAnalyticsOverview = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days) || 28, 1), 365);
    const dStartKey = dateKey(daysAgo(days));
    const dPrevKey = dateKey(daysAgo(days * 2));

    // ── 1. VIEWS — CourseView (date = string "YYYY-MM-DD") ────────────────────
    const viewsRaw = await CourseView.aggregate([
      { $match: { date: { $gte: dStartKey } } },
      { $group: { _id: "$date", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const viewsWeekly = fillDays(
      viewsRaw.map((r) => ({ date: r._id, value: r.count })),
      days,
    );
    const viewsSparkline = viewsWeekly.map((d) => d.value);
    const viewsTotalCurr = viewsWeekly.reduce((s, d) => s + d.value, 0);

    const viewsPrevCount = await CourseView.countDocuments({
      date: { $gte: dPrevKey, $lt: dStartKey },
    });
    const viewsChangePct = pctChange(viewsTotalCurr, viewsPrevCount);

    // ── 2. WATCH TIME — StudyLog ──────────────────────────────────────────────
    // Real fields from your DB document:
    //   date         → string "YYYY-MM-DD"   ✅ (string comparison works)
    //   durationMins → number (minutes)      ✅ (was "minutesStudied" before — WRONG)
    //   userId       → ObjectId              (field name is userId, not user)
    //   sessionsCount→ number

    const watchRaw = await StudyLog.aggregate([
      { $match: { date: { $gte: dStartKey } } }, // string comparison ✅
      {
        $group: {
          _id: "$date",
          minutes: { $sum: "$durationMins" }, // ← real field name
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const watchWeekly = fillDays(
      watchRaw.map((r) => ({
        date: r._id,
        value: +(r.minutes / 60).toFixed(2), // mins → hours
      })),
      days,
    );
    const watchSparkline = watchWeekly.map((d) => d.value);
    const watchTotalHrs = +watchWeekly
      .reduce((s, d) => s + d.value, 0)
      .toFixed(1);

    // % change: prev period
    const watchPrevAgg = await StudyLog.aggregate([
      { $match: { date: { $gte: dPrevKey, $lt: dStartKey } } },
      { $group: { _id: null, total: { $sum: "$durationMins" } } },
    ]);
    const watchCurrMins = watchRaw.reduce((s, r) => s + r.minutes, 0);
    const watchChangePct = pctChange(
      Math.round(watchCurrMins),
      Math.round(watchPrevAgg[0]?.total || 0),
    );

    // ── 3. ENROLLMENTS — Booking (createdAt = Date object) ───────────────────
    const dStart = daysAgo(days);
    const dPrev = daysAgo(days * 2);

    const enrollRaw = await Booking.aggregate([
      { $match: { paymentStatus: "Paid", createdAt: { $gte: dStart } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const enrollWeekly = fillDays(
      enrollRaw.map((r) => ({ date: r._id, value: r.count })),
      days,
    );
    const enrollCurrTotal = enrollWeekly.reduce((s, d) => s + d.value, 0);

    const enrollPrevTotal = await Booking.countDocuments({
      paymentStatus: "Paid",
      createdAt: { $gte: dPrev, $lt: dStart },
    });
    const enrollChangePct = pctChange(enrollCurrTotal, enrollPrevTotal);

    const enrollBarData = enrollWeekly.map((d) => ({
      label: new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" }),
      value: d.value,
    }));

    // ── 4. TRAFFIC SOURCES ────────────────────────────────────────────────────
    const freeCourseIds = await Course.distinct("_id", {
      $or: [
        { "price.sale": 0 },
        { "price.original": 0 },
        { pricingType: "free" },
      ],
    });

    const [freeBookings, paidBookings, freeViewCount, paidViewCount] =
      await Promise.all([
        Booking.countDocuments({
          course: { $in: freeCourseIds },
          paymentStatus: "Paid",
          createdAt: { $gte: dStart },
        }),
        Booking.countDocuments({
          course: { $nin: freeCourseIds },
          paymentStatus: "Paid",
          createdAt: { $gte: dStart },
        }),
        CourseView.countDocuments({
          courseId: { $in: freeCourseIds },
          date: { $gte: dStartKey },
        }),
        CourseView.countDocuments({
          courseId: { $nin: freeCourseIds },
          date: { $gte: dStartKey },
        }),
      ]);

    const totalBookings = freeBookings + paidBookings || 1;
    const totalViewCount = freeViewCount + paidViewCount || 1;

    const trafficSources = [
      {
        name: "Paid Enrollments",
        value: Math.round((paidBookings / totalBookings) * 100),
        color: "#ef4444",
        count: paidBookings,
      },
      {
        name: "Free Enrollments",
        value: Math.round((freeBookings / totalBookings) * 100),
        color: "#3b82f6",
        count: freeBookings,
      },
      {
        name: "Paid Views",
        value: Math.round((paidViewCount / totalViewCount) * 100),
        color: "#10b981",
        count: paidViewCount,
      },
      {
        name: "Free Views",
        value: Math.round((freeViewCount / totalViewCount) * 100),
        color: "#f59e0b",
        count: freeViewCount,
      },
    ];

    // ── Chart labels ──────────────────────────────────────────────────────────
    const chartLabels = viewsWeekly.map((d, i) => {
      const dt = new Date(d.date);
      if (days <= 28)
        return dt.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        });
      if (days <= 90)
        return i % 7 === 0
          ? dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
          : "";
      return i % 30 === 0
        ? dt.toLocaleDateString("en-IN", { month: "short" })
        : "";
    });

    return res.json({
      success: true,
      analytics: {
        views: {
          totalWeek: viewsTotalCurr,
          sparkline: viewsSparkline,
          weeklyData: viewsWeekly,
          changePercent: viewsChangePct,
        },
        watchTime: {
          totalHrs: watchTotalHrs,
          sparkline: watchSparkline,
          weeklyData: watchWeekly,
          changePercent: watchChangePct,
        },
        enrollment: {
          last7Days: enrollCurrTotal,
          changePercent: enrollChangePct,
          weeklyData: enrollWeekly,
          barData: enrollBarData,
        },
        trafficSources,
        chartLabels,
      },
    });
  } catch (err) {
    console.error("getAnalyticsOverview error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
