import mongoose from "mongoose";

/* ================= CHAPTER ================= */
const chapterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    topic: { type: String, required: true },

    duration: {
      hours: { type: Number, default: 0 },
      minutes: { type: Number, default: 0 },
    },

    totalMinutes: { type: Number, default: 0 },
    videoUrl: { type: String, required: true },
  },
  { _id: true },
);

/* ================= LECTURE ================= */
const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    duration: {
      hours: { type: Number, default: 0 },
      minutes: { type: Number, default: 0 },
    },

    totalMinutes: { type: Number, default: 0 },

    chapters: [chapterSchema],
  },
  { _id: true },
);

/* ================= COURSE ================= */
const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    teacher: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    image: { type: String },

    isPublished: { type: Boolean, default: false },

    avgRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },

    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },

    pricingType: {
      type: String,
      enum: ["free", "paid"],
      default: "free",
    },

    price: {
      original: { type: Number, default: 0 },
      sale: { type: Number, default: 0 },
    },

    overview: { type: String },

    totalDuration: {
      hours: { type: Number, default: 0 },
      minutes: { type: Number, default: 0 },
    },

    totalLectures: { type: Number, default: 0 },

    lectures: [lectureSchema],

    courseType: {
      type: String,
      enum: ["regular", "top"],
      default: "regular",
    },

    // ── Enrollment Validity ──────────────────────────────────────────────
    // Controls how long a student retains access after enrolling.
    // This value is copied into the Booking document at purchase time,
    // and the controller uses it to calculate booking.expiresAt.
    validity: {
      type: String,
      enum: ["1year", "2year", "lifetime"],
      default: "lifetime",
    },

    views: { type: Number, default: 0 },

    resources: [
      {
        title: { type: String, required: true },
        type: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
);

/* ================= PRE-SAVE HOOK ================= */
courseSchema.pre("save", function () {
  if (!Array.isArray(this.lectures)) this.lectures = [];

  let courseTotalMinutes = 0;

  this.lectures = this.lectures.map((lecture) => {
    lecture = lecture || {};
    lecture.chapters = Array.isArray(lecture.chapters) ? lecture.chapters : [];

    let chaptersSum = 0;

    lecture.chapters = lecture.chapters.map((chapter) => {
      chapter = chapter || {};
      chapter.duration = chapter.duration || {};

      const chHours = Number(chapter.duration.hours ?? 0);
      const chMins = Number(chapter.duration.minutes ?? 0);
      const chTotal = Math.max(0, chHours * 60 + chMins);

      chapter.totalMinutes = chTotal;
      chapter.duration.hours = chHours;
      chapter.duration.minutes = chMins;

      chaptersSum += chTotal;
      return chapter;
    });

    const lecHours = Number(lecture.duration?.hours ?? 0);
    const lecMins = Number(lecture.duration?.minutes ?? 0);
    const lectureOwnMinutes = Math.max(0, lecHours * 60 + lecMins);
    const lectureTotalMinutes =
      chaptersSum > 0 ? chaptersSum : lectureOwnMinutes;

    lecture.totalMinutes = lectureTotalMinutes;
    lecture.duration.hours = Math.floor(lectureTotalMinutes / 60);
    lecture.duration.minutes = lectureTotalMinutes % 60;

    courseTotalMinutes += lectureTotalMinutes;
    return lecture;
  });

  this.totalDuration.hours = Math.floor(courseTotalMinutes / 60);
  this.totalDuration.minutes = courseTotalMinutes % 60;
  this.totalLectures = this.lectures.length;
});

/* ================= MODEL ================= */
const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

export default Course;
