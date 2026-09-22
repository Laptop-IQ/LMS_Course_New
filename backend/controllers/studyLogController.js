// controllers/studyLogController.js
import StudyLog from "../models/StudyLog.js";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/study-log
// Body: { courseId, lessonId?, minutesStudied, secondsStudied? }
// Video player se call hota hai: pause / end / 30s heartbeat pe
// ─────────────────────────────────────────────────────────────────────────────
export const logStudySession = async (req, res) => {
  try {
    const { courseId, lessonId, minutesStudied, secondsStudied } = req.body;

    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: "courseId is required" });
    }

    const mins = Math.max(0, Math.round(Number(minutesStudied) || 0));
    const secs = Math.max(0, Math.round(Number(secondsStudied) || 0));

    // Zero-duration ping ignore karo (e.g. t=0 pe accidental pause)
    if (mins === 0 && secs === 0) {
      return res.json({ success: true, skipped: true });
    }

    const log = await StudyLog.create({
      user: req.user._id, // isAuthenticated middleware se aata hai
      course: courseId,
      lesson: lessonId || null,
      minutesStudied: mins,
      secondsStudied: secs,
      date: new Date(), // Date object — analytics query Date se compare karti hai
    });

    return res.status(201).json({ success: true, log });
  } catch (err) {
    console.error("logStudySession error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/study-log/me?courseId=xxx
// Logged-in user ka total study time return karta hai
// ─────────────────────────────────────────────────────────────────────────────
export const getMyStudyTime = async (req, res) => {
  try {
    const match = { user: req.user._id };
    if (req.query.courseId) match.course = req.query.courseId;

    const agg = await StudyLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalMins: { $sum: "$minutesStudied" },
          totalSecs: { $sum: "$secondsStudied" },
          sessions: { $sum: 1 },
        },
      },
    ]);

    const totalMins = agg[0]?.totalMins || 0;
    const totalSecs = agg[0]?.totalSecs || 0;
    const sessions = agg[0]?.sessions || 0;
    const totalHrs = +((totalMins + totalSecs / 60) / 60).toFixed(2);

    return res.json({ success: true, totalHrs, totalMins, sessions });
  } catch (err) {
    console.error("getMyStudyTime error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
