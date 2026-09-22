// controllers/courseController.js
import Course from "../models/courseModel.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const toNumber = (v, fallback = 0) => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const parseJSONSafe = (maybe) => {
  if (!maybe) return null;
  if (typeof maybe === "object") return maybe;
  try {
    return JSON.parse(maybe);
  } catch {
    return null;
  }
};

const VALID_VALIDITY = ["1year", "2year", "lifetime"];

const computeDerivedFields = (courseObj) => {
  let totalCourseMinutes = 0;
  if (!Array.isArray(courseObj.lectures)) courseObj.lectures = [];

  courseObj.lectures = courseObj.lectures.map((lec) => {
    lec = { ...lec };
    lec.duration = lec.duration || {};
    lec.chapters = Array.isArray(lec.chapters) ? lec.chapters : [];

    lec.chapters = lec.chapters.map((ch) => {
      ch = { ...ch };
      ch.duration = ch.duration || {};
      const chHours = toNumber(ch.duration.hours);
      const chMins = toNumber(ch.duration.minutes);
      ch.totalMinutes = chHours * 60 + chMins;
      ch.duration = { hours: chHours, minutes: chMins };
      ch.name = ch.name || "";
      ch.topic = ch.topic || "";
      ch.videoUrl = ch.videoUrl || "";
      return ch;
    });

    const chaptersMinutes = lec.chapters.reduce(
      (s, c) => s + toNumber(c.totalMinutes, 0),
      0,
    );
    const lecHours = toNumber(lec.duration.hours);
    const lecMins = toNumber(lec.duration.minutes);
    lec.totalMinutes =
      lec.chapters.length > 0 ? chaptersMinutes : lecHours * 60 + lecMins;

    lec.duration = { hours: lecHours, minutes: lecMins };
    totalCourseMinutes += lec.totalMinutes;
    lec.title = lec.title || "Untitled lecture";
    return lec;
  });

  courseObj.totalDuration = {
    hours: Math.floor(totalCourseMinutes / 60),
    minutes: totalCourseMinutes % 60,
  };
  courseObj.totalLectures = courseObj.lectures.length;
  return courseObj;
};

// ── GET PUBLIC COURSES ────────────────────────────────────────────────────────
export const getPublicCourses = async (req, res) => {
  try {
    const { home, type = "all", limit } = req.query;
    let filter = { isPublished: true };
    if (home === "true") filter.courseType = "top";
    else if (type === "top") filter.courseType = "top";
    else if (type === "regular") filter.courseType = "regular";

    const q = Course.find(filter).sort({ createdAt: -1 });
    if (home === "true") q.limit(Number(limit || 8));
    else if (limit) q.limit(Number(limit));

    const courses = await q.lean();
    return res.json({ success: true, items: courses });
  } catch (err) {
    console.error("GetPublicCourses", err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ── GET ALL COURSES ───────────────────────────────────────────────────────────
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, courses });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ── GET COURSE BY ID ──────────────────────────────────────────────────────────
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("createdBy", "username avatar role")
      .lean();

    if (!course)
      return res.status(404).json({ success: false, error: "Not found" });

    return res.json({ success: true, course });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ── CREATE COURSE ─────────────────────────────────────────────────────────────
export const createCourse = async (req, res) => {
  try {
    const body = req.body || {};

    let imagePath = body.image || "";
    let imagePublicId = "";
    if (req.file) {
      const { url, public_id } = await uploadToCloudinary(
        req.file.buffer,
        "courses",
      );
      imagePath = url;
      imagePublicId = public_id;
    }

    const priceParsed = parseJSONSafe(body.price) ?? {};
    const price = {
      original: toNumber(priceParsed.original ?? body["price.original"] ?? 0),
      sale: toNumber(priceParsed.sale ?? body["price.sale"] ?? 0),
    };

    let lectures = parseJSONSafe(body.lectures) ?? [];
    if (!Array.isArray(lectures)) lectures = [];

    const validity = VALID_VALIDITY.includes(body.validity)
      ? body.validity
      : "lifetime";

    const courseObj = {
      name: body.name || "",
      teacher: body.teacher || "",
      createdBy: req.user?._id || null,
      image: imagePath,
      imagePublicId,
      rating: toNumber(body.rating, 0),
      pricingType: body.pricingType || "free",
      price,
      overview: body.overview || body.description || "",
      totalDuration: parseJSONSafe(body.totalDuration) ?? {
        hours: toNumber(body["totalDuration.hours"]),
        minutes: toNumber(body["totalDuration.minutes"]),
      },
      totalLectures: toNumber(body.totalLectures, lectures.length),
      lectures,
      courseType: body.courseType || "regular",
      validity,
      category: body.category || null,
    };

    computeDerivedFields(courseObj);
    const course = new Course(courseObj);
    await course.save();

    return res.status(201).json({ success: true, course: course.toObject() });
  } catch (err) {
    console.error("createCourse error:", err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ── DELETE COURSE ─────────────────────────────────────────────────────────────
// NOTE: deleteFromCloudinary is called here — the course thumbnail is automatically
// removed from Cloudinary whenever a course is deleted.

// ── DELETE COURSE ─────────────────────────────────────────────────────────────
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res.status(404).json({ success: false, error: "Not found" });

    // ── Cloudinary image delete ──
    if (course.imagePublicId) {
      // Normal case — imagePublicId DB mein hai
      await deleteFromCloudinary(course.imagePublicId);
    } else if (course.image) {
      // Fallback — purane courses jinke imagePublicId save nahi hua tha
      // Cloudinary URL se public_id extract karo
      // URL format: https://res.cloudinary.com/demo/image/upload/v123/courses/abc123.jpg
      // public_id  = "courses/abc123"  (folder + filename, no extension)
      const match = course.image.match(
        /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i
      );
      if (match?.[1]) {
        await deleteFromCloudinary(match[1]);
      }
    }

    await course.deleteOne();
    return res.json({ success: true, message: "Course Deleted" });
  } catch (err) {
    console.error("deleteCourse error:", err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ── UPDATE COURSE ─────────────────────────────────────────────────────────────
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    const body = req.body || {};

    if (body.isPublished !== undefined)
      course.isPublished =
        body.isPublished === true || body.isPublished === "true";
    if (body.name !== undefined) course.name = body.name;
    if (body.instructor !== undefined) course.teacher = body.instructor;
    if (body.category !== undefined) course.category = body.category;
    if (body.courseType !== undefined) course.courseType = body.courseType;
    if (body.rating !== undefined)
      course.rating = toNumber(body.rating, course.rating);
    if (body.description !== undefined) course.overview = body.description;
    if (body.validity !== undefined && VALID_VALIDITY.includes(body.validity))
      course.validity = body.validity;

    if (body.price !== undefined) {
      course.price = course.price || {};
      course.price.sale = toNumber(body.price, course.price.sale ?? 0);
      if (body.originalPrice !== undefined)
        course.price.original = toNumber(
          body.originalPrice,
          course.price.original ?? 0,
        );
    }

    // ── Thumbnail replace ──
    if (req.file) {
      // 1. Pehle old image Cloudinary se delete karo
      if (course.imagePublicId) {
        await deleteFromCloudinary(course.imagePublicId);
      } else {
        // imagePublicId missing — URL se extract karo aur delete karo
        const match = course.image?.match(
          /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i,
        );
        if (match?.[1]) {
          await deleteFromCloudinary(match[1]);
        }
      }

      // 2. Naya image upload karo
      const { url, public_id } = await uploadToCloudinary(
        req.file.buffer,
        "courses",
      );
      course.image = url;
      course.imagePublicId = public_id;
    }

    if (body.lectures !== undefined) {
      let lectures = parseJSONSafe(body.lectures) ?? [];
      if (!Array.isArray(lectures)) lectures = [];
      const derived = computeDerivedFields({ lectures });
      course.lectures = derived.lectures;
      course.totalLectures = derived.totalLectures;
      course.totalDuration = derived.totalDuration;
    }

    course.markModified("price");
    course.markModified("lectures");
    course.markModified("totalDuration");

    await course.save();

    return res.json({ success: true, course: course.toObject() });
  } catch (err) {
    console.error("updateCourse error:", err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ── PUBLISH / UNPUBLISH COURSE ────────────────────────────────────────────────
export const publishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    const { isPublished } = req.body;
    if (isPublished === undefined)
      return res
        .status(400)
        .json({ success: false, error: "isPublished required" });

    course.isPublished = isPublished === true || isPublished === "true";
    await course.save();

    return res.json({
      success: true,
      isPublished: course.isPublished,
      message: course.isPublished ? "Course published" : "Course unpublished",
    });
  } catch (err) {
    console.error("publishCourse error:", err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};
