import express from "express";

import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  removeProfilePhoto,
  updateProfileWithImage,
} from "../controllers/profileController.js";

import { isAuthenticated } from "../middleware/userAuthenticated.js";
import { upload } from "../middleware/multer.js";


const router = express.Router();

router.get("/", isAuthenticated, getProfile);

router.put("/update", isAuthenticated, updateProfile);

router.put("/change-password", isAuthenticated, changePassword);

router.post(
  "/photo",
  isAuthenticated,
  upload.single("profilePic"),
  updateProfileWithImage,
);

router.delete("/photo", isAuthenticated, removeProfilePhoto);

export default router;
