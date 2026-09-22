import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for admin-created bookings
      index: true,
    },
    studentName: {
      type: String,
      default: "Unknown",
    },
    email: {
      type: String,
      default: null,
    },
    course: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    teacherName: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // ── Validity / Expiry ──────────────────────────────────────────────────
    validity: {
      type: String,
      enum: ["1year", "2year", "lifetime"],
      default: "lifetime",
    },
    /**
     * expiresAt is null for lifetime access.
     * Set automatically by the controller based on `validity`.
     * 1year  → createdAt + 1 year
     * 2year  → createdAt + 2 years
     * lifetime → null (never expires)
     */
    expiresAt: {
      type: Date,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },

    // ── Payment ───────────────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ["Online", "Admin"],
      default: "Online",
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid",
    },
    paymentIntentId: { type: String, default: null },
    sessionId: { type: String, default: null },

    // ── Order ─────────────────────────────────────────────────────────────
    orderStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed", "Failed"],
      default: "Pending",
    },

    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────
// Fast lookup: is this user enrolled in this course?
bookingSchema.index({ userId: 1, course: 1 });

// Fast expiry queries (e.g. cron job to mark expired enrollments)
bookingSchema.index({ expiresAt: 1, paymentStatus: 1 });

// ── Virtual: isExpired ────────────────────────────────────────────────────
bookingSchema.virtual("isExpired").get(function () {
  if (this.validity === "lifetime" || !this.expiresAt) return false;
  return new Date(this.expiresAt) < new Date();
});

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;
