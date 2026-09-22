// routes/progressRoutes.js
import express from "express";
import Progress, { StudyLog } from "../models/progressModel.js";
import { isAuthenticated } from "../middleware/userAuthenticated.js";

const router = express.Router();

const todayStr = () => new Date().toISOString().split("T")[0];

// ─── GET /api/progress/completed?courseId=xxx ────────────────
router.get("/completed", isAuthenticated, async (req, res) => {
  const { courseId } = req.query;
  const userId = req.user.id;

  if (!courseId)
    return res
      .status(400)
      .json({ success: false, message: "courseId required" });

  try {
    const progress = await Progress.findOne({ userId, courseId });
    return res.json({
      success: true,
      completedChapters: progress?.completedChapters || [],
    });
  } catch (err) {
    console.error("Progress GET error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─── POST /api/progress/mark ─────────────────────────────────
// Body: { courseId, chapterId, completed, durationMins }
router.post("/mark", isAuthenticated, async (req, res) => {
  const { courseId, chapterId, completed, durationMins = 10 } = req.body;
  const userId = req.user.id;

  if (!courseId || !chapterId)
    return res
      .status(400)
      .json({ success: false, message: "courseId and chapterId required" });

  try {
    let progress = await Progress.findOne({ userId, courseId });
    if (!progress)
      progress = new Progress({ userId, courseId, completedChapters: [] });

    if (completed) {
      if (!progress.completedChapters.includes(chapterId))
        progress.completedChapters.push(chapterId);
      progress.lastStudied = new Date();

      // ── StudyLog update ──
      const today = todayStr();
      await StudyLog.findOneAndUpdate(
        { userId, date: today },
        {
          $inc: { durationMins: Number(durationMins) || 10, sessionsCount: 1 },
        },
        { upsert: true, new: true },
      );
    } else {
      progress.completedChapters = progress.completedChapters.filter(
        (id) => id !== chapterId,
      );
    }

    await progress.save();
    return res.json({
      success: true,
      completedChapters: progress.completedChapters,
    });
  } catch (err) {
    console.error("Progress POST error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─── GET /api/progress/streak ────────────────────────────────
router.get("/streak", isAuthenticated, async (req, res) => {
  const userId = req.user.id;
  try {
    const logs = await StudyLog.find({ userId })
      .sort({ date: -1 })
      .select("date")
      .lean();

    if (!logs.length)
      return res.json({
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null,
      });

    const today = todayStr();
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];
    const studyDates = new Set(logs.map((l) => l.date));

    // current streak
    let currentStreak = 0;
    const startDate = studyDates.has(today)
      ? today
      : studyDates.has(yesterday)
        ? yesterday
        : null;

    if (startDate) {
      const d = new Date(startDate);
      while (studyDates.has(d.toISOString().split("T")[0])) {
        currentStreak++;
        d.setDate(d.getDate() - 1);
      }
    }

    // longest streak
    const sorted = [...studyDates].sort();
    let longest = 1,
      temp = 1;
    for (let i = 1; i < sorted.length; i++) {
      const diff = (new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000;
      temp = diff === 1 ? temp + 1 : 1;
      if (temp > longest) longest = temp;
    }
    longest = Math.max(longest, currentStreak);

    return res.json({
      currentStreak,
      longestStreak: longest,
      lastStudyDate: logs[0]?.date || null,
    });
  } catch (err) {
    console.error("Streak error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─── GET /api/progress/weekly-study ─────────────────────────
router.get("/weekly-study", isAuthenticated, async (req, res) => {
  const userId = req.user.id;
  try {
    const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (6 - i) * 86400000);
      return {
        date: d.toISOString().split("T")[0],
        label: DAY_LABELS[d.getDay()],
        mins: 0,
      };
    });

    const logs = await StudyLog.find({
      userId,
      date: { $in: days.map((d) => d.date) },
    }).lean();

    const logMap = Object.fromEntries(
      logs.map((l) => [l.date, l.durationMins || 0]),
    );
    days.forEach((d) => (d.mins = logMap[d.date] || 0));

    return res.json({ success: true, data: days });
  } catch (err) {
    console.error("Weekly study error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ─── GET /api/progress/activity ─────────────────────────────
router.get("/activity", isAuthenticated, async (req, res) => {
  const userId = req.user.id;
  try {
    const DAYS = 84;
    const grid = Array.from({ length: DAYS }, (_, i) => {
      const d = new Date(Date.now() - (DAYS - 1 - i) * 86400000);
      return { date: d.toISOString().split("T")[0], count: 0 };
    });

    const logs = await StudyLog.find({
      userId,
      date: { $in: grid.map((g) => g.date) },
    }).lean();

    const logMap = Object.fromEntries(
      logs.map((l) => [
        l.date,
        Math.min(4, Math.ceil((l.sessionsCount || 1) / 2)),
      ]),
    );
    grid.forEach((g) => (g.count = logMap[g.date] || 0));

    return res.json({ success: true, grid });
  } catch (err) {
    console.error("Activity error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
