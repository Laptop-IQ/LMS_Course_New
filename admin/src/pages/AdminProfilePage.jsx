import React, { useRef, useState, useMemo } from "react";
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
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Key,
  ShieldCheck,
  Crown,
  Star,
  Linkedin,
  Instagram,
  GraduationCap,
  BookOpen,
  Clock,
  Youtube,
  Facebook,
  Twitter,
  Github,
  Globe,
} from "lucide-react";
import API from "../api/adminApi";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE;

/* ─────────────────────────── STAR RATING ─────────────────────────── */
const StarRating = ({ value = 0, max = 5 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }).map((_, i) => {
      const filled = i < Math.floor(value);
      const partial = !filled && i < value;
      return (
        <span key={i} className="relative inline-block w-5 h-5">
          <Star
            size={18}
            className="text-slate-600 absolute inset-0"
            fill="none"
          />
          {(filled || partial) && (
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: partial ? `${(value % 1) * 100}%` : "100%" }}
            >
              <Star size={18} className="text-amber-400" fill="#fbbf24" />
            </span>
          )}
        </span>
      );
    })}
  </div>
);

/* ─────────────────────── SOCIAL LINK CONFIG ──────────────────────── */
const SOCIAL_LINKS = [
  {
    key: "linkedin",
    label: "LinkedIn URL",
    placeholder: "https://linkedin.com/in/yourprofile",
    icon: Linkedin,
    color: "text-[#0A66C2]",
    hoverBorder: "hover:border-[#0A66C2]/40",
    type: "url",
  },
  {
    key: "github",
    label: "GitHub URL",
    placeholder: "https://github.com/yourusername",
    icon: Github,
    color: "text-slate-300",
    hoverBorder: "hover:border-slate-400/40",
    type: "url",
  },
  {
    key: "twitter",
    label: "X (Twitter) URL",
    placeholder: "https://x.com/yourhandle",
    icon: Twitter,
    color: "text-[#1DA1F2]",
    hoverBorder: "hover:border-[#1DA1F2]/40",
    type: "url",
  },
  {
    key: "youtube",
    label: "YouTube URL",
    placeholder: "https://youtube.com/@yourchannel",
    icon: Youtube,
    color: "text-[#FF0000]",
    hoverBorder: "hover:border-[#FF0000]/40",
    type: "url",
  },
  {
    key: "instagram",
    label: "Instagram URL",
    placeholder: "https://instagram.com/yourhandle",
    icon: Instagram,
    color: "text-[#E1306C]",
    hoverBorder: "hover:border-[#E1306C]/40",
    type: "url",
  },
  {
    key: "facebook",
    label: "Facebook URL",
    placeholder: "https://facebook.com/yourprofile",
    icon: Facebook,
    color: "text-[#1877F2]",
    hoverBorder: "hover:border-[#1877F2]/40",
    type: "url",
  },
  {
    key: "website",
    label: "Personal Website",
    placeholder: "https://yourwebsite.com",
    icon: Globe,
    color: "text-emerald-400",
    hoverBorder: "hover:border-emerald-400/40",
    type: "url",
  },
];

const AdminProfilePage = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const getToken = () => localStorage.getItem("adminAccessToken");

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("adminUser"));
    } catch {
      return null;
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [form, setForm] = useState({
    username: storedUser?.username || "",
    email: storedUser?.email || "",
    phone: storedUser?.phone || "",
    location: storedUser?.location || "",
    bio: storedUser?.bio || "Administrator of the LMS platform.",
    avatar: storedUser?.avatar || "",
    education: storedUser?.education || "",
    specialization: storedUser?.specialization || "",
    experience: storedUser?.experience || "",
    rating: storedUser?.rating || 0,
    // Social links
    linkedin: storedUser?.linkedin || "",
    github: storedUser?.github || "",
    twitter: storedUser?.twitter || "",
    youtube: storedUser?.youtube || "",
    instagram: storedUser?.instagram || "",
    facebook: storedUser?.facebook || "",
    website: storedUser?.website || "",
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) =>
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

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

  const getCroppedImg = (imageSrc, crop) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
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
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject("Canvas error")),
          "image/jpeg",
        );
      };
      image.onerror = reject;
    });

  const handleImageUpload = async () => {
    if (!profileImage || !croppedAreaPixels) {
      toast.error("Please select and crop an image first");
      return;
    }
    try {
      setUploading(true);
      const croppedBlob = await getCroppedImg(previewImage, croppedAreaPixels);
      const formData = new FormData();
      formData.append("profilePic", croppedBlob, "profile.jpg");
      const token = getToken();
      const { data } = await API.post(
        `${API_BASE}/api/admin/profile/photo`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!data?.success) throw new Error(data?.message || "Upload failed");
      const updatedUser = data.user;
      localStorage.setItem("adminUser", JSON.stringify(updatedUser));
      setForm((prev) => ({
        ...prev,
        avatar: updatedUser.avatar || updatedUser.profilePic || "",
      }));
      setPreviewImage("");
      setProfileImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      toast.success("Profile image updated");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Upload failed",
      );
    } finally {
      setUploading(false);
    }
  };

  const removeProfilePhoto = async () => {
    if (!window.confirm("Remove profile photo?")) return;
    try {
      const token = getToken();
      const { data } = await API.delete(`${API_BASE}/api/admin/profile/photo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem("adminUser", JSON.stringify(data.user));
      setForm((prev) => ({ ...prev, avatar: "" }));
      toast.success("Profile photo removed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove photo");
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await API.put(`${API_BASE}/api/admin/profile/update`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem("adminUser", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("userUpdated"));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    try {
      setLoading(true);
      if (passwordData.newPassword.length < 6)
        return toast.error("Password too short");
      const token = getToken();
      const res = await API.put(
        `${API_BASE}/api/admin/profile/change-password`,
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

  const deleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your admin account?"))
      return;
    try {
      setLoading(true);
      const token = getToken();
      await API.delete(`${API_BASE}/api/admin/profile/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
      toast.success("Account deleted");
      window.location.href = "/";
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={16} /> },
    { id: "security", label: "Security", icon: <Shield size={16} /> },
    { id: "danger", label: "Danger Zone", icon: <AlertTriangle size={16} /> },
  ];

  /* ─── avatar src ─── */
  const avatarSrc =
    previewImage ||
    form.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(form.username || "Admin")}&background=06b6d4&color=fff&size=200`;

  /* ─── active social links (for sidebar display) ─── */
  const activeSocialLinks = SOCIAL_LINKS.filter((s) => form[s.key]);

  return (
    <section className="min-h-screen bg-[#030712] px-2 py-2 text-white flex flex-col">
      {/* ── Crop Modal ── */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#111827] border border-white/10 p-5 rounded-xl w-[360px] shadow-2xl">
            <h3 className="text-center font-bold mb-4 text-cyan-400">
              Crop Profile Photo
            </h3>
            <div className="relative w-full h-72 bg-black rounded-lg overflow-hidden">
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
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full mt-4 accent-cyan-500"
            />
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleImageUpload}
                disabled={uploading}
                className="flex-1 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 font-semibold transition"
              >
                {uploading ? "Uploading..." : "Save Photo"}
              </button>
              <button
                onClick={() => {
                  setPreviewImage("");
                  setProfileImage(null);
                }}
                className="flex-1 py-3 rounded-lg bg-red-500 hover:bg-red-400 font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl w-full px-4 md:px-6">
        {/* Page Header */}
        <div className="mb-6 mt-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20">
              <Crown size={22} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black md:text-4xl">
                Admin{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Profile
                </span>
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Manage your admin account, security & platform settings.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* ══════════════════════════════════════
              LEFT SIDEBAR — Instructor-style card
          ══════════════════════════════════════ */}
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden backdrop-blur-xl">
              {/* Photo section */}
              <div className="relative group">
                <div className="relative h-52 overflow-hidden bg-[#0d1117]">
                  <img
                    src={avatarSrc}
                    alt={form.username || "Admin"}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#030712] to-transparent" />

                  {/* Experience badge */}
                  {form.experience && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10">
                      <Clock size={12} className="text-cyan-400" />
                      {form.experience} Exp
                    </div>
                  )}

                  {/* Photo upload overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex gap-3">
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="h-11 w-11 rounded-xl bg-cyan-500/90 hover:bg-cyan-400 flex items-center justify-center transition shadow-lg"
                        title="Upload photo"
                      >
                        <Camera size={18} />
                      </button>
                      {form.avatar && (
                        <button
                          onClick={removeProfilePhoto}
                          className="h-11 w-11 rounded-xl bg-red-500/90 hover:bg-red-400 flex items-center justify-center transition shadow-lg"
                          title="Remove photo"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      Click to change photo
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>

              {/* Card body */}
              <div className="p-5">
                {/* Name */}
                <h2 className="text-xl font-black leading-tight">
                  {form.username || "Admin Name"}
                </h2>

                {/* Education / Title */}
                {form.education && (
                  <p className="mt-1 text-sm font-semibold text-cyan-400">
                    {form.education}
                  </p>
                )}

                {/* Specialization */}
                {form.specialization && (
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    {form.specialization}
                  </p>
                )}

                {/* Admin badge */}
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                  <ShieldCheck size={12} />
                  Super Administrator
                </div>

                {/* Rating */}
                <div className="mt-4 rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3">
                  <p className="text-xs text-slate-500 mb-1">Student Rating</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-white">
                      {Number(form.rating).toFixed(1)}
                    </span>
                    <StarRating value={Number(form.rating)} />
                  </div>
                </div>

                {/* ── Social Links ── */}
                <div className="mt-4">
                  <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">
                    Social & Links
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {/* Email always visible */}
                    <a
                      href={`mailto:${form.email}`}
                      className="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] hover:border-cyan-500/40 flex items-center justify-center transition-all duration-200"
                      title={form.email}
                    >
                      <Mail size={15} className="text-slate-300" />
                    </a>

                    {activeSocialLinks.map(
                      ({ key, icon: Icon, color, hoverBorder }) => (
                        <a
                          key={key}
                          href={form[key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`h-9 w-9 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] ${hoverBorder} flex items-center justify-center transition-all duration-200`}
                          title={key.charAt(0).toUpperCase() + key.slice(1)}
                        >
                          <Icon size={15} className={color} />
                        </a>
                      ),
                    )}

                    {/* Empty state */}
                    {activeSocialLinks.length === 0 && (
                      <p className="text-xs text-slate-600 italic">
                        No social links added yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200
                      ${
                        activeTab === tab.id
                          ? tab.id === "danger"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : "text-slate-400 hover:bg-white/[0.05] hover:text-white border border-transparent"
                      }
                    `}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════
              RIGHT PANEL — Edit Forms
          ══════════════════════════════════════ */}
          <div>
            {/* ── PROFILE TAB ── */}
            {activeTab === "profile" && (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 md:p-8 backdrop-blur-xl">
                <div className="mb-6">
                  <h3 className="text-2xl font-black">Personal Information</h3>
                  <p className="mt-1 text-slate-400 text-sm">
                    Update your admin profile details and public card info.
                  </p>
                </div>

                {/* ── Basic Info ── */}
                <div className="grid gap-5 md:grid-cols-2">
                  {/* Full Name */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-4 top-[18px] text-slate-500"
                      />
                      <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Dr. Jane Doe"
                        className="w-full rounded-lg border border-white/10 bg-white/[0.05] py-4 pl-11 pr-4 outline-none transition focus:border-cyan-400 placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-4 top-[18px] text-slate-500"
                      />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="admin@example.com"
                        className="w-full rounded-lg border border-white/10 bg-white/[0.05] py-4 pl-11 pr-4 outline-none transition focus:border-cyan-400 placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-4 top-[18px] text-slate-500"
                      />
                      <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+91 9876543210"
                        className="w-full rounded-lg border border-white/10 bg-white/[0.05] py-4 pl-11 pr-4 outline-none transition focus:border-cyan-400 placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin
                        size={16}
                        className="absolute left-4 top-[18px] text-slate-500"
                      />
                      <input
                        type="text"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="Mumbai, India"
                        className="w-full rounded-lg border border-white/10 bg-white/[0.05] py-4 pl-11 pr-4 outline-none transition focus:border-cyan-400 placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Education / Degree
                    </label>
                    <div className="relative">
                      <GraduationCap
                        size={16}
                        className="absolute left-4 top-[18px] text-slate-500"
                      />
                      <input
                        type="text"
                        name="education"
                        value={form.education}
                        onChange={handleChange}
                        placeholder="Ph.D. in Artificial Intelligence"
                        className="w-full rounded-lg border border-white/10 bg-white/[0.05] py-4 pl-11 pr-4 outline-none transition focus:border-cyan-400 placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Years of Experience
                    </label>
                    <div className="relative">
                      <Clock
                        size={16}
                        className="absolute left-4 top-[18px] text-slate-500"
                      />
                      <input
                        type="text"
                        name="experience"
                        value={form.experience}
                        onChange={handleChange}
                        placeholder="12+ years"
                        className="w-full rounded-lg border border-white/10 bg-white/[0.05] py-4 pl-11 pr-4 outline-none transition focus:border-cyan-400 placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Student Rating (0–5)
                    </label>
                    <div className="relative">
                      <Star
                        size={16}
                        className="absolute left-4 top-[18px] text-slate-500"
                      />
                      <input
                        type="number"
                        name="rating"
                        value={form.rating}
                        onChange={handleChange}
                        min={0}
                        max={5}
                        step={0.1}
                        placeholder="4.5"
                        className="w-full rounded-lg border border-white/10 bg-white/[0.05] py-4 pl-11 pr-4 outline-none transition focus:border-cyan-400 placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Specialization
                    </label>
                    <div className="relative">
                      <BookOpen
                        size={16}
                        className="absolute left-4 top-[18px] text-slate-500"
                      />
                      <input
                        type="text"
                        name="specialization"
                        value={form.specialization}
                        onChange={handleChange}
                        placeholder="Machine Learning and Deep Neural Networks"
                        className="w-full rounded-lg border border-white/10 bg-white/[0.05] py-4 pl-11 pr-4 outline-none transition focus:border-cyan-400 placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-5">
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Admin Bio
                  </label>
                  <textarea
                    rows={4}
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Write a short bio about yourself..."
                    className="w-full rounded-lg border border-white/10 bg-white/[0.05] p-4 outline-none transition focus:border-cyan-400 resize-none placeholder:text-slate-600"
                  />
                </div>

                {/* ══ SOCIAL LINKS SECTION ══ */}
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-px flex-1 bg-white/[0.08]" />
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      Social & Links
                    </h4>
                    <div className="h-px flex-1 bg-white/[0.08]" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {SOCIAL_LINKS.map(
                      ({ key, label, placeholder, icon: Icon, color }) => (
                        <div key={key}>
                          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300">
                            <Icon size={14} className={color} />
                            {label}
                          </label>
                          <div className="relative">
                            <Icon
                              size={15}
                              className={`absolute left-4 top-[19px] ${color}`}
                            />
                            <input
                              type="url"
                              name={key}
                              value={form[key]}
                              onChange={handleChange}
                              placeholder={placeholder}
                              className="w-full rounded-lg border border-white/10 bg-white/[0.05] py-4 pl-11 pr-4 outline-none transition focus:border-cyan-400 placeholder:text-slate-600 text-sm"
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Save */}
                <button
                  onClick={updateProfile}
                  disabled={loading}
                  className="mt-8 flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-4 font-semibold shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === "security" && (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 md:p-8 backdrop-blur-xl">
                <div className="mb-6">
                  <h3 className="text-2xl font-black">Security Settings</h3>
                  <p className="mt-1 text-slate-400 text-sm">
                    Protect your admin account with a strong password.
                  </p>
                </div>

                <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                    <p>
                      As a Super Administrator, use a very strong password (12+
                      characters with symbols). Your credentials control the
                      entire platform.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-4 top-[18px] text-slate-500"
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.05] py-4 pl-11 pr-12 outline-none transition focus:border-cyan-400"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-[18px] text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      New Password
                    </label>
                    <div className="relative">
                      <Key
                        size={16}
                        className="absolute left-4 top-[18px] text-slate-500"
                      />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.05] py-4 pl-11 pr-12 outline-none transition focus:border-cyan-400"
                      />
                      <button
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-[18px] text-slate-500 hover:text-slate-300"
                      >
                        {showNewPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                    <span>
                      Use a combination of uppercase, lowercase, numbers, and
                      special symbols for maximum security.
                    </span>
                  </div>
                </div>

                <button
                  onClick={changePassword}
                  disabled={loading}
                  className="mt-6 flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-4 font-semibold shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Shield size={18} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ── DANGER TAB ── */}
            {activeTab === "danger" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      size={20}
                      className="text-red-400 mt-0.5 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-red-400 mb-1">
                        Admin Account Warning
                      </h4>
                      <p className="text-sm text-slate-400">
                        Deleting your admin account will permanently remove all
                        admin privileges, settings, and associated data. This
                        action{" "}
                        <span className="text-red-400 font-semibold">
                          cannot be undone
                        </span>
                        . Make sure to assign another admin before proceeding.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.05] p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-red-500/10 p-3 text-red-400 border border-red-500/20">
                      <AlertTriangle size={22} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-red-400">
                        Danger Zone
                      </h3>
                      <p className="mt-2 text-slate-400 text-sm">
                        Permanently delete your LMS admin account and all
                        associated data. This will remove your admin access to
                        the entire platform.
                      </p>

                      <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-slate-500 space-y-1">
                        <p>⚠️ All admin settings will be permanently deleted</p>
                        <p>⚠️ You will lose access to the admin dashboard</p>
                        <p>⚠️ This action is irreversible</p>
                      </div>

                      <button
                        onClick={deleteAccount}
                        disabled={loading}
                        className="mt-6 flex items-center gap-2 rounded-lg bg-red-500 hover:bg-red-600 px-7 py-4 font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
                      >
                        {loading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            <Trash2 size={18} />
                            Delete Admin Account
                          </>
                        )}
                      </button>
                    </div>
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

export default AdminProfilePage;
