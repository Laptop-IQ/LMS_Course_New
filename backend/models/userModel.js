import mongoose from "mongoose";
  const userSchema = new mongoose.Schema(
    {
      /* ===================================================== */
      /* BASIC INFO */
      /* ===================================================== */
      username: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 50,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      password: {
        type: String,
        minlength: 6,
        required: true,
      },
      /* ===================================================== */
      /* PROFILE */
      /* ===================================================== */
      phone: {
        type: String,
        default: "",
      },
      location: {
        type: String,
        default: "",
      },
      bio: {
        type: String,
        default: "Passionate learner building future-ready skills.",
      },
      avatar: {
        type: String,
        default: "https://i.pravatar.cc/300",
      },
      /* ===================================================== */
      /* AUTH */
      /* ===================================================== */
      googleId: {
        type: String,
        default: null,
      },
      token: {
        type: String,
        default: null,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      isLoggedIn: {
        type: Boolean,
        default: false,
      },
      /* ===================================================== */
      /* OTP */
      /* ===================================================== */
      otp: {
        type: String,
        default: null,
      },
      otpExpiry: {
        type: Date,
        default: null,
      },
      /* ===================================================== */
      /* ROLE */
      /* ===================================================== */
      role: {
        type: String,
        enum: ["student", "admin", "instructor"],
        default: "student",
      },
      /* ===================================================== */
      /* LMS */
      /* ===================================================== */
      enrolledCourses: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
      ],
      certificates: [
        {
          title: String,
          issuedAt: Date,
        },
      ],
      /* ===================================================== */
      /* SECURITY */
      /* ===================================================== */
      lastLogin: {
        type: Date,
      },
      resetPasswordToken: {
        type: String,
        default: null,
      },
      resetPasswordExpiry: {
        type: Date,
        default: null,
      },
      profilePic: String, // ✅ add this
      cloudinaryId: String, // ✅ add this
    },
    {
      timestamps: true,
    },
  );
const User = mongoose.model("User", userSchema);
export default User;