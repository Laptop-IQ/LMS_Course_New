import React, { useRef, useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";

import {
  Camera,
  Trash2,
  Shield,
  Lock,
  User,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  KeyRound,
} from "lucide-react";

import toast from "react-hot-toast";
import axios from "axios";

/* ===================================================== */
/* CONFIG */
/* ===================================================== */

const API_URL = import.meta.env.VITE_API_BASE;

/* ===================================================== */
/* HELPERS */
/* ===================================================== */

const compressImage = async (file) => {
  try {
    return await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    });
  } catch {
    return file;
  }
};

const getCroppedImg = async (imageSrc, crop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height,
  );

  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob), "image/jpeg"),
  );
};

/* ===================================================== */
/* SUB-COMPONENTS */
/* ===================================================== */

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  icon: Icon,
  placeholder = "",
  rightSlot,
}) => (
  <div>
    <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-cyan-500/60 focus:bg-white/[0.07] focus:ring-1 focus:ring-cyan-500/20"
      />
      {rightSlot && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {rightSlot}
        </div>
      )}
    </div>
  </div>
);

const StatCard = ({ icon: Icon, iconClass, value, label }) => (
  <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
    <div className={`rounded-lg p-2 ${iconClass}`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-sm font-semibold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  </div>
);

/* ===================================================== */
/* TABS CONFIG */
/* ===================================================== */

const TABS = [
  { id: "profile", label: "Personal Info", icon: User },
  { id: "security", label: "Security", icon: KeyRound },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

/* ===================================================== */
/* PROFILE PAGE */
/* ===================================================== */

const ProfilePage = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  /* ---- stats ---- */
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    certificates: 0,
    secure: true,
  });

  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const bookingsRes = await fetch(`${API_URL}/api/booking/my`, {
          headers,
        });
        const bookingsData = await bookingsRes.json();
        const bookings = bookingsData.bookings || [];

        const validBookings = bookings.filter((b) => {
          const hasCourse = b.course || b.courseId;
          if (!hasCourse) return false;
          if (b.isFree === true || b.price === 0 || b.amount === 0) return true;
          const status = b.status?.toLowerCase();
          return ["paid", "success", "completed"].includes(status);
        });

        const certRes = await fetch(`${API_URL}/api/certificate/my`, {
          headers,
        });
        let certCount = 0;
        if (certRes.ok) {
          const certData = await certRes.json();
          certCount = certData.certificates?.length || 0;
        }

        setStats({
          enrolledCourses: validBookings.length,
          certificates: certCount,
          secure: true,
        });
      } catch (err) {
        console.log(err);
      }
    };

    fetchProfileStats();
  }, []);

  /* ---- user ---- */
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  /* ---- states ---- */
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [form, setForm] = useState({
    username: storedUser?.username || "",
    email: storedUser?.email || "",
    phone: storedUser?.phone || "",
    location: storedUser?.location || "",
    bio: storedUser?.bio || "Passionate learner building future-ready skills.",
    avatar: storedUser?.avatar || "https://i.pravatar.cc/300",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [previewImage, setPreviewImage] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  /* ---- handlers ---- */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) =>
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
        file.type,
      )
    ) {
      return toast.error("Only image files allowed");
    }
    const compressed = await compressImage(file);
    setProfileImage(compressed);
    setPreviewImage(URL.createObjectURL(compressed));
  };

  const onCropComplete = (_, croppedPixels) =>
    setCroppedAreaPixels(croppedPixels);

  /* ---- image upload ---- */
  const handleImageUpload = async () => {
    if (!profileImage || !croppedAreaPixels) {
      toast.error("Please select and crop an image first");
      return;
    }
    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(previewImage, croppedAreaPixels);
      const formData = new FormData();
      formData.append("profilePic", croppedBlob, "profile.jpg");

      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/profile/photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userUpdated"));

      setForm((prev) => ({ ...prev, avatar: updatedUser.profilePic }));
      setPreviewImage("");
      setProfileImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);

      toast.success("Profile image updated!");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ---- remove photo ---- */
  const removeProfilePhoto = async () => {
    if (!window.confirm("Remove profile photo?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${API_URL}/api/profile/photo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userUpdated"));
      setForm((prev) => ({
        ...prev,
        avatar: updatedUser.profilePic || "https://i.pravatar.cc/300",
      }));
      toast.success("Profile photo removed");
    } catch {
      toast.error("Failed to remove photo");
    }
  };

  /* ---- update profile ---- */
  const updateProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_URL}/api/profile/update`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("userUpdated"));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  /* ---- change password ---- */
  const changePassword = async () => {
    if (passwordData.newPassword.length < 6)
      return toast.error("Password too short");
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_URL}/api/profile/change-password`,
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(res.data.message);
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  /* ---- delete account ---- */
  const deleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?"))
      return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/profile/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      toast.success("Account deleted successfully");
      window.location.href = "/";
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================== */
  /* RENDER */
  /* ===================================================== */

  return (
    <section className="h-screen overflow-hidden bg-[#030712] px-4 py-4 text-white flex flex-col">
      {/* ---- CROP MODAL ---- */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-[360px] rounded-2xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
            <p className="mb-4 text-sm font-semibold text-slate-300">
              Crop Profile Photo
            </p>
            <div className="relative h-72 w-full overflow-hidden rounded-xl bg-black">
              <Cropper
                image={previewImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-xs text-slate-500">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleImageUpload}
                disabled={uploading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-sm font-semibold transition hover:bg-cyan-400 disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {uploading ? "Uploading…" : "Save Photo"}
              </button>
              <button
                onClick={() => {
                  setPreviewImage("");
                  setProfileImage(null);
                }}
                className="flex flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl w-full flex flex-col flex-1 min-h-0">
        {/* ---- PAGE HEADER ---- */}
        <div className="mb-4">
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">
            My{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Profile
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your account, security, and personal settings.
          </p>
        </div>

        {/* ---- MAIN GRID ---- */}
        <div className="grid gap-4 lg:grid-cols-[280px_1fr] flex-1 min-h-0">
          {/* ========== LEFT SIDEBAR ========== */}
          <div className="space-y-3 flex flex-col min-h-0">
            {/* Avatar card */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-center">
              <div className="group relative mx-auto w-fit">
                <img
                  src={form.avatar}
                  alt="profile"
                  className="h-44 w-44 rounded-2xl object-cover ring-2 ring-cyan-500/20 transition duration-300 group-hover:ring-cyan-500/50"
                />
                {!previewImage && (
                  <div className="absolute inset-0 flex flex-row items-center justify-center gap-3 rounded-2xl bg-black/65 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/90 transition hover:bg-cyan-400"
                      title="Upload photo"
                    >
                      <Camera size={18} />
                    </button>
                    <button
                      onClick={removeProfilePhoto}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/90 transition hover:bg-red-400"
                      title="Remove photo"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
              />

              <h2 className="mt-3 text-base font-black">
                {form.username || "Your Name"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">{form.email}</p>

              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
                🎓 Student Account
              </span>
            </div>

            {/* Stats */}
            <div className="space-y-2">
              <StatCard
                icon={BookOpen}
                iconClass="bg-cyan-500/10 text-cyan-400"
                value={`${stats.enrolledCourses} Courses`}
                label="Enrolled"
              />
              <StatCard
                icon={Shield}
                iconClass="bg-emerald-500/10 text-emerald-400"
                value={stats.secure ? "Account Secure" : "At Risk"}
                label="Security Status"
              />
            </div>
          </div>

          {/* ========== RIGHT CONTENT ========== */}
          <div className="flex flex-col gap-3 min-h-0">
            {/* ---- TAB BAR ---- */}
            <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1 w-fit flex-shrink-0">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    activeTab === id
                      ? id === "danger"
                        ? "bg-red-500/15 text-red-400"
                        : "bg-white/[0.08] text-white"
                      : id === "danger"
                        ? "text-red-500/60 hover:text-red-400"
                        : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>

            {/* ---- PANEL: PERSONAL INFO ---- */}
            {activeTab === "profile" && (
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
                <h3 className="text-lg font-black">Personal Information</h3>
                <p className="mt-0.5 mb-4 text-sm text-slate-500">
                  Update your name, contact, and bio.
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  <InputField
                    label="Full Name"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    icon={User}
                    placeholder="Your name"
                  />
                  <InputField
                    label="Email Address"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    icon={Mail}
                    placeholder="you@example.com"
                  />
                  <InputField
                    label="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    icon={Phone}
                    placeholder="+91 98765 43210"
                  />
                  <InputField
                    label="Location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    icon={MapPin}
                    placeholder="City, Country"
                  />
                </div>

                {/* Bio */}
                <div className="mt-3">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20"
                  />
                </div>

                <button
                  onClick={updateProfile}
                  disabled={loading}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] hover:shadow-cyan-500/30 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {loading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            )}

            {/* ---- PANEL: SECURITY ---- */}
            {activeTab === "security" && (
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
                <h3 className="text-lg font-black">Security Settings</h3>
                <p className="mt-0.5 mb-4 text-sm text-slate-500">
                  Change your password and keep your account safe.
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  <InputField
                    label="Current Password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    type={showPassword ? "text" : "password"}
                    icon={Lock}
                    placeholder="••••••••"
                    rightSlot={
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-500 transition hover:text-slate-300"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    }
                  />
                  <InputField
                    label="New Password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    type={showNewPassword ? "text" : "password"}
                    icon={Shield}
                    placeholder="••••••••"
                    rightSlot={
                      <button
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-slate-500 transition hover:text-slate-300"
                      >
                        {showNewPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    }
                  />
                </div>

                <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-3 text-sm text-emerald-400">
                  <CheckCircle2 size={17} className="mt-0.5 flex-shrink-0" />
                  Use a strong password with uppercase letters, numbers, and
                  symbols. Minimum 6 characters.
                </div>

                <button
                  onClick={changePassword}
                  disabled={loading}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <KeyRound size={16} />
                  )}
                  {loading ? "Updating…" : "Change Password"}
                </button>
              </div>
            )}

            {/* ---- PANEL: DANGER ZONE ---- */}
            {activeTab === "danger" && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-xl bg-red-500/10 p-3 text-red-400">
                    <AlertTriangle size={22} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-red-400">
                      Danger Zone
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Permanently delete your account and all associated data —
                      courses, certificates, and history. This action is{" "}
                      <span className="font-semibold text-red-400">
                        irreversible
                      </span>
                      .
                    </p>

                    <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-red-400">
                        What will be deleted
                      </p>
                      <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
                        {[
                          "Your profile and personal information",
                          "All course enrollments and progress",
                          "Earned certificates",
                          "Payment history and records",
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500/60" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={deleteAccount}
                      disabled={loading}
                      className="mt-4 flex items-center gap-2 rounded-xl bg-red-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 hover:scale-[1.02] disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      {loading ? "Deleting…" : "Delete My Account"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
