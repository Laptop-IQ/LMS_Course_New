import bcrypt from "bcryptjs";
import User from "../models/Admin.model.js";
import cloudinary from "../config/cloudinary.js";

/* ===================================================== */
/* GET ALL FACULTY (public — no auth needed)             */
/* Returns only admins who have filled their profile     */
/* ===================================================== */

export const getPublicFaculty = async (req, res) => {
  try {
    const faculty = await User.find({
      role: { $in: ["admin", "superadmin", "moderator"] },
      isActive: true,
      username: { $nin: [null, ""] },
    })
      .select(
        "username email avatar education specialization experience rating bio linkedin instagram youtube facebook twitter github website",
      )
      .sort({ rating: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      faculty,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================== */
/* GET ADMIN PROFILE                                     */
/* ===================================================== */

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.admin._id).select("-password");

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      user: admin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================== */
/* GET ADMIN STATS (for frontend stat cards)             */
/* ===================================================== */

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });

    let totalCourses = 0;
    let totalRevenue = 0;
    let totalCertificates = 0;

    try {
      const Course = (await import("../models/courseModel.js")).default;
      totalCourses = await Course.countDocuments();
    } catch (_) {}

    try {
      const Booking = (await import("../models/bookingModel.js")).default;
      const paidBookings = await Booking.find({
        status: { $in: ["paid", "success", "completed"] },
      });
      totalRevenue = paidBookings.reduce(
        (sum, b) => sum + (b.amount || b.price || 0),
        0,
      );
    } catch (_) {}

    try {
      const Certificate = (await import("../models/certificateModel.js"))
        .default;
      totalCertificates = await Certificate.countDocuments();
    } catch (_) {}

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalRevenue,
        totalCertificates,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================== */
/* UPDATE ADMIN PROFILE                                  */
/* ===================================================== */

export const updateAdminProfile = async (req, res) => {
  try {
    const {
      username,
      email,
      phone,
      location,
      bio,
      education,
      specialization,
      experience,
      rating,
      // Social links
      linkedin,
      instagram,
      youtube,
      facebook,
      twitter,
      github,
      website,
    } = req.body;

    const admin = await User.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Basic info
    if (username !== undefined) admin.username = username;
    if (email !== undefined) admin.email = email;
    if (phone !== undefined) admin.phone = phone;
    if (location !== undefined) admin.location = location;
    if (bio !== undefined) admin.bio = bio;

    // Profile card fields
    if (education !== undefined) admin.education = education;
    if (specialization !== undefined) admin.specialization = specialization;
    if (experience !== undefined) admin.experience = experience;

    // Rating — clamp to 0–5
    if (rating !== undefined) {
      const parsed = parseFloat(rating);
      if (!isNaN(parsed)) {
        admin.rating = Math.min(5, Math.max(0, parsed));
      }
    }

    // Social links
    if (linkedin !== undefined) admin.linkedin = linkedin;
    if (instagram !== undefined) admin.instagram = instagram;
    if (youtube !== undefined) admin.youtube = youtube;
    if (facebook !== undefined) admin.facebook = facebook;
    if (twitter !== undefined) admin.twitter = twitter;
    if (github !== undefined) admin.github = github;
    if (website !== undefined) admin.website = website;

    await admin.save();

    const updatedAdmin = await User.findById(admin._id).select("-password");

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      user: updatedAdmin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================== */
/* CHANGE ADMIN PASSWORD                                 */
/* ===================================================== */

export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both current and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const admin = await User.findById(req.admin._id).select("+password");

    const isMatch = await bcrypt.compare(currentPassword, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================== */
/* UPDATE ADMIN PROFILE PHOTO                            */
/* ===================================================== */

export const updateAdminProfilePhoto = async (req, res) => {
  try {
    const admin = await User.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    // Delete old Cloudinary image if exists
    if (admin.cloudinaryId) {
      await cloudinary.uploader.destroy(admin.cloudinaryId);
    }

    // Upload new image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "admin-profiles" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        })
        .end(req.file.buffer);
    });

    admin.avatar = result.secure_url;
    admin.cloudinaryId = result.public_id;

    await admin.save();

    const updatedAdmin = await User.findById(admin._id).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile photo updated",
      user: updatedAdmin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================== */
/* REMOVE ADMIN PROFILE PHOTO                            */
/* ===================================================== */

export const removeAdminProfilePhoto = async (req, res) => {
  try {
    const admin = await User.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.cloudinaryId) {
      await cloudinary.uploader.destroy(admin.cloudinaryId);
    }

    admin.avatar = "";
    admin.cloudinaryId = "";

    await admin.save();

    const updatedAdmin = await User.findById(admin._id).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile photo removed",
      user: updatedAdmin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================== */
/* DELETE ADMIN ACCOUNT                                  */
/* ===================================================== */

export const deleteAdminAccount = async (req, res) => {
  try {
    const admin = await User.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.cloudinaryId) {
      await cloudinary.uploader.destroy(admin.cloudinaryId);
    }

    await User.findByIdAndDelete(req.admin._id);

    return res.status(200).json({
      success: true,
      message: "Admin account deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
