import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import cloudinary from "../config/cloudinary.js";

/* ===================================================== */
/* GET PROFILE */
/* ===================================================== */

export const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================== */
/* UPDATE PROFILE */
/* ===================================================== */

export const updateProfile = async (req, res) => {
  try {
    const { username, email, phone, location, bio, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.location = location || user.location;
    user.bio = bio || user.bio;
    user.avatar = avatar || user.avatar;

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===================================================== */
/* CHANGE PASSWORD */
/* ===================================================== */

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password incorrect",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

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
/* DELETE ACCOUNT */
/* ===================================================== */

export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfileWithImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    // delete old image
    if (user.cloudinaryId) {
      await cloudinary.uploader.destroy(user.cloudinaryId);
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "profiles" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        })
        .end(req.file.buffer);
    });

    user.avatar = result.secure_url;
    user.cloudinaryId = result.public_id;

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const removeProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.cloudinaryId) {
      await cloudinary.uploader.destroy(user.cloudinaryId);
    }

    user.avatar = "";
    user.cloudinaryId = "";

    await user.save();

    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};