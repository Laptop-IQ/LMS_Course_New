import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    username: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: ["superadmin", "admin", "moderator"],
      default: "admin",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Profile Info ──────────────────────────────────
    phone: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      default: "",
    },

    // ── Profile Card Fields ───────────────────────────
    education: {
      type: String,
      trim: true,
      default: "",
      // e.g. "Ph.D. in Artificial Intelligence"
    },

    specialization: {
      type: String,
      trim: true,
      default: "",
      // e.g. "Machine Learning and Deep Neural Networks"
    },

    experience: {
      type: String,
      trim: true,
      default: "",
      // e.g. "12+ years"
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    // ── Social Links ──────────────────────────────────
    linkedin: {
      type: String,
      trim: true,
      default: "",
    },

    instagram: {
      type: String,
      trim: true,
      default: "",
    },

    youtube: {
      type: String,
      trim: true,
      default: "",
    },

    facebook: {
      type: String,
      trim: true,
      default: "",
    },

    twitter: {
      type: String,
      trim: true,
      default: "",
      // e.g. "https://x.com/handle"
    },

    github: {
      type: String,
      trim: true,
      default: "",
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    // ── Avatar / Cloudinary ───────────────────────────
    avatar: {
      type: String,
      default: "",
    },

    cloudinaryId: {
      type: String,
      default: "",
    },

    // ── OTP ──────────────────────────────────────────
    otp: {
      type: String,
      select: false,
    },

    otpExpiry: {
      type: Date,
      select: false,
    },

    otpVerified: {
      type: Boolean,
      default: false,
    },

    // ── Token blacklist / refresh ─────────────────────
    refreshToken: {
      type: String,
      select: false,
    },

    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true },
);

/* =======================================================
   HOOKS
======================================================= */

// Hash password before save
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/* =======================================================
   METHODS
======================================================= */

// Compare plain password with hashed
adminSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Generate 6-digit OTP and set 10-min expiry
adminSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  this.otpVerified = false;
  return otp;
};

// Check if OTP is valid
adminSchema.methods.isOTPValid = function (inputOtp) {
  return this.otp === inputOtp && this.otpExpiry && this.otpExpiry > new Date();
};

// Clear OTP after use
adminSchema.methods.clearOTP = function () {
  this.otp = undefined;
  this.otpExpiry = undefined;
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
