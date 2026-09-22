import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  User,
  Mail,
  Phone,
  BookOpen,
  CalendarDays,
  LayoutGrid,
  List,
  Plus,
  Trash2,
  X,
  Sparkles,
  ShieldCheck,
  ShieldOff,
  Crown,
  UserCheck,
  UserX,
  GraduationCap,
  Hash,
  RefreshCw,
  Eye,
  ChevronDown,
  BadgeIndianRupee,
  Clock,
  BarChart2,
  Layers,
  MapPin,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

// ---------- Role Badge ----------
const RoleBadge = ({ role }) => {
  const map = {
    admin: {
      icon: <Crown size={11} />,
      label: "Admin",
      color: "text-amber-300 border-amber-500/20 bg-amber-500/10",
    },
    instructor: {
      icon: <GraduationCap size={11} />,
      label: "Instructor",
      color: "text-violet-300 border-violet-500/20 bg-violet-500/10",
    },
    student: {
      icon: <UserCheck size={11} />,
      label: "Student",
      color: "text-cyan-300 border-cyan-500/20 bg-cyan-500/10",
    },
  };
  const cfg = map[role?.toLowerCase()] || {
    icon: <User size={11} />,
    label: role || "User",
    color: "text-slate-400 border-slate-500/20 bg-slate-500/10",
  };
  return (
    <div
      className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.color}`}
    >
      {cfg.icon} {cfg.label}
    </div>
  );
};

// ---------- Status Badge ----------
const StatusBadge = ({ verified }) => (
  <div
    className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
      verified
        ? "text-emerald-300 border-emerald-500/20 bg-emerald-500/10"
        : "text-yellow-300 border-yellow-500/20 bg-yellow-500/10"
    }`}
  >
    {verified ? <ShieldCheck size={11} /> : <ShieldOff size={11} />}
    {verified ? "Verified" : "Unverified"}
  </div>
);

// ---------- Avatar ----------
const Avatar = ({ name, src, size = "lg" }) => {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = [
    "from-cyan-500 to-blue-600",
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
  ];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  const sz = size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";

  if (src && !src.includes("pravatar")) {
    return (
      <img
        src={src}
        alt={name}
        className={`shrink-0 rounded-2xl object-cover shadow-lg ${sz}`}
      />
    );
  }

  return (
    <div
      className={`shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br ${color} font-bold text-white shadow-lg ${sz}`}
    >
      {initials}
    </div>
  );
};

// ---------- Add User Modal ----------
const AddUserModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    role: "student",
    password: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.username || !form.email || !form.password) {
      setErr("Username, email and password are required.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/api/users/admin/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed");
      onSuccess();
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, k, type = "text", placeholder = "" }) => (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <input
        type={type}
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 overflow-y-auto py-6">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d1117] p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-xl p-1 text-slate-500 hover:text-white"
        >
          <X size={20} />
        </button>
        <h2 className="mb-6 text-xl font-bold text-white">Add New User</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Username" k="username" placeholder="rahulsharma" />
            <Field
              label="Email"
              k="email"
              type="email"
              placeholder="rahul@example.com"
            />
            <Field label="Phone" k="phone" placeholder="+91 98765 43210" />
            <Field
              label="Password"
              k="password"
              type="password"
              placeholder="••••••••"
            />
            <Field label="Location" k="location" placeholder="Delhi, India" />
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0d1117] px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>
        {err && (
          <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">
            {err}
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50"
          >
            {loading ? "Adding…" : "Add User"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- User Detail Drawer ----------
const UserDrawer = ({ user, onClose, onDelete }) => {
  if (!user) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative h-full w-full max-w-md overflow-y-auto bg-[#0d1117] border-l border-white/10 p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-xl p-1.5 text-slate-500 hover:bg-white/10 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Profile */}
        <div className="flex flex-col items-center text-center mt-4 mb-8">
          <Avatar name={user.name} src={user.avatar} size="lg" />
          <h2 className="mt-4 text-2xl font-black text-white">{user.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{user.email}</p>
          {user.bio && (
            <p className="mt-2 text-xs text-slate-500 max-w-xs">{user.bio}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            <RoleBadge role={user.role} />
            <StatusBadge verified={user.isVerified} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            {
              label: "Courses",
              value: user.enrolledCourses?.length || 0,
              icon: <BookOpen size={16} className="text-cyan-400" />,
              bg: "bg-cyan-500/10",
            },
            {
              label: "Certs",
              value: user.certificates?.length || 0,
              icon: <BadgeIndianRupee size={16} className="text-emerald-400" />,
              bg: "bg-emerald-500/10",
            },
            {
              label: "Days",
              value: user.daysSinceJoined ?? "—",
              icon: <Clock size={16} className="text-violet-400" />,
              bg: "bg-violet-500/10",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded-2xl border border-white/5 ${s.bg} p-3 text-center`}
            >
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="text-lg font-black text-white">{s.value}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="space-y-3 mb-8">
          {[
            {
              icon: <Mail size={14} className="text-slate-400" />,
              label: "Email",
              value: user.email,
            },
            {
              icon: <Phone size={14} className="text-slate-400" />,
              label: "Phone",
              value: user.phone || "Not provided",
            },
            {
              icon: <MapPin size={14} className="text-slate-400" />,
              label: "Location",
              value: user.location || "Not provided",
            },
            {
              icon: <CalendarDays size={14} className="text-slate-400" />,
              label: "Joined",
              value: user.joinDate,
            },
            {
              icon: <Clock size={14} className="text-slate-400" />,
              label: "Last Login",
              value: user.lastLogin || "Never",
            },
            {
              icon: <Hash size={14} className="text-slate-400" />,
              label: "User ID",
              value: user.id?.slice(-10),
              mono: true,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
            >
              {item.icon}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  {item.label}
                </p>
                <p
                  className={`text-sm font-semibold text-slate-200 truncate ${item.mono ? "font-mono text-xs text-cyan-400" : ""}`}
                >
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Enrolled Courses */}
        {user.enrolledCourses?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Layers size={13} /> Enrolled Courses (
              {user.enrolledCourses.length})
            </h3>
            <div className="space-y-2">
              {user.enrolledCourses.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                    <BookOpen size={14} className="text-cyan-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-200 truncate">
                      {c.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificates */}
        {user.certificates?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Crown size={13} /> Certificates ({user.certificates.length})
            </h3>
            <div className="space-y-2">
              {user.certificates.map((cert, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-200">
                      {cert.title}
                    </p>
                    {cert.issuedAt && (
                      <p className="text-xs text-slate-500">
                        {new Date(cert.issuedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            onDelete(user);
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition"
        >
          <Trash2 size={14} /> Delete User
        </button>
      </div>
    </div>
  );
};

// ---------- Delete Confirm ----------
const DeleteConfirm = ({ user, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const confirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/${user.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onDeleted(user.id);
      onClose();
    } catch (e) {
      alert(e.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0d1117] p-7 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
          <Trash2 className="h-6 w-6 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-white">Delete User?</h2>
        <p className="mt-2 text-sm text-slate-400">
          This will permanently delete{" "}
          <span className="font-semibold text-white">{user.name}</span> and all
          their data.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={loading}
            className="flex-1 rounded-2xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===================== MAIN PAGE =====================
const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("card");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    students: 0,
    instructors: 0,
    verified: 0,
  });

  const debounceRef = useRef(null);
  const abortRef = useRef(null);


 const normalizeCourses = (courses = []) =>
   courses.map((c) => {
     if (c == null) return { name: "Unknown Course" };
     if (typeof c === "string" || typeof c === "number")
       return { name: String(c) };
     return {
       ...c,
       name:
         (c.courseName && String(c.courseName).trim()) || // ✅ YE ADD HUA
         (c.title && String(c.title).trim()) ||
         (c.name && String(c.name).trim()) ||
         "Unnamed Course",
     };
   });

  const normalize = (u, idx) => {
    const joinDate = u.createdAt
      ? new Date(u.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";
    const daysSinceJoined = u.createdAt
      ? Math.floor((Date.now() - new Date(u.createdAt)) / 86400000)
      : null;
    return {
      id: u._id || String(idx),
      name: u.username || u.name || "Unknown",
      email: u.email || "—",
      phone: u.phone || null,
      role: u.role || "student",
      isVerified: u.isVerified ?? false,
      joinDate,
      daysSinceJoined,
      // ✅ KEY FIX: normalize every course item to { name, ...rest }
      enrolledCourses: normalizeCourses(
        u.enrolledCourses ||
          u.courses ||
          u.purchasedCourses ||
          u.myCourses ||
          [],
      ),
      certificates: u.certificates || [],
      totalSpent: u.totalSpent || 0,
      bio: u.bio || "",
      location: u.location || "",
      lastLogin:
        u.lastLogin || u.lastLoginAt || u.last_login || u.updatedAt
          ? new Date(
              u.lastLogin || u.lastLoginAt || u.last_login || u.updatedAt,
            ).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : null,
      avatar: u.profilePic || u.avatar || null,
    };
  };

  const fetchUsers = async (search = "") => {
    setLoading(true);
    setError(null);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const q = new URLSearchParams({ limit: "200", page: "1" });
      if (search) q.set("search", search);
      if (roleFilter !== "all") q.set("role", roleFilter);
      if (statusFilter !== "all")
        q.set("isVerified", statusFilter === "active" ? "true" : "false");

      const res = await fetch(`${API_BASE}/api/users/all?${q}`, {
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Status ${res.status}`);
      }
      const data = await res.json();
      if (data?.success) {
        const normalized = (data.users || []).map(normalize);
        setUsers(normalized);
        setStats({
          total: normalized.length,
          students: normalized.filter((u) => u.role === "student").length,
          instructors: normalized.filter((u) => u.role === "instructor").length,
          verified: normalized.filter((u) => u.isVerified).length,
        });
      } else {
        setUsers([]);
        setError(data?.message || "No data");
      }
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers("");
    return () => abortRef.current?.abort();
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUsers(searchTerm.trim()), 350);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const handleDeleted = (id) =>
    setUsers((prev) => prev.filter((u) => u.id !== id));

  // ---------- Stat Card ----------
  const StatCard = ({ icon, label, value, color, sub }) => (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:-translate-y-0.5">
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${color} to-transparent opacity-0 transition group-hover:opacity-100`}
      />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-black text-white">{value}</p>
          <p className="mt-1 text-sm text-slate-400">{label}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-600">{sub}</p>}
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color.replace("via-", "bg-").replace("/60", "/10")}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  // ---------- User Card ----------
  const UserCard = ({ user, index }) => (
    <div
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-violet-500/[0.03] cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => setSelectedUser(user)}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="flex items-start gap-4">
        <Avatar name={user.name} src={user.avatar} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-white">{user.name}</h3>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 truncate">
            <Mail size={12} className="shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.phone && (
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-600">
              <Phone size={12} className="shrink-0" />
              {user.phone}
            </div>
          )}
          {user.location && (
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-600">
              <MapPin size={12} className="shrink-0" />
              {user.location}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <RoleBadge role={user.role} />
        <StatusBadge verified={user.isVerified} />
      </div>

      <div className="my-4 h-px bg-white/5" />

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/5 bg-cyan-500/5 p-3 text-center">
          <p className="text-base font-black text-white">
            {user.enrolledCourses?.length || 0}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Courses
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-emerald-500/5 p-3 text-center">
          <p className="text-base font-black text-emerald-300">
            {user.certificates?.length || 0}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Certs
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-violet-500/5 p-3 text-center">
          <p className="text-base font-black text-white">
            {user.daysSinceJoined ?? "—"}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Days
          </p>
        </div>
      </div>

      {user.enrolledCourses?.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
            <BookOpen size={10} /> Enrolled Courses
          </p>
          <div className="flex flex-wrap gap-1">
            {user.enrolledCourses.slice(0, 2).map((c, i) => (
              <span
                key={i}
                className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[11px] text-cyan-300 font-medium"
              >
                {c.name}
              </span>
            ))}
            {user.enrolledCourses.length > 2 && (
              <span className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[11px] text-slate-400">
                +{user.enrolledCourses.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
        <div>
          <p className="text-[10px] text-slate-600 mb-0.5">Joined</p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <CalendarDays size={11} /> {user.joinDate}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(user);
            }}
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
          >
            <Eye size={12} /> View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(user);
            }}
            className="flex items-center gap-1 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );

  // ---------- List Row ----------
  const UserRow = ({ user }) => (
    <div
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 transition hover:bg-white/[0.06] cursor-pointer"
      onClick={() => setSelectedUser(user)}
    >
      <Avatar name={user.name} src={user.avatar} size="sm" />
      <div className="min-w-[140px] flex-1">
        <p className="text-sm font-bold text-white">{user.name}</p>
        <p className="text-xs text-slate-500 truncate max-w-[180px]">
          {user.email}
        </p>
        {user.phone && <p className="text-xs text-slate-600">{user.phone}</p>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <RoleBadge role={user.role} />
        <StatusBadge verified={user.isVerified} />
      </div>
      <div className="min-w-[80px]">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          Courses
        </p>
        <p className="text-sm font-bold text-cyan-300">
          {user.enrolledCourses?.length || 0}
        </p>
      </div>
      <div className="min-w-[70px]">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          Certs
        </p>
        <p className="text-sm font-bold text-emerald-300">
          {user.certificates?.length || 0}
        </p>
      </div>
      <div className="min-w-[100px] hidden md:block">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          Joined
        </p>
        <p className="text-xs text-slate-300">{user.joinDate}</p>
      </div>
      {user.lastLogin && (
        <div className="min-w-[100px] hidden lg:block">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Last Login
          </p>
          <p className="text-xs text-slate-300">{user.lastLogin}</p>
        </div>
      )}
      <div className="hidden xl:block min-w-[160px]">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
          Courses
        </p>
        <div className="flex flex-wrap gap-1">
          {user.enrolledCourses?.slice(0, 1).map((c, i) => (
            <span
              key={i}
              className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300"
            >
              {c.name}
            </span>
          ))}
          {user.enrolledCourses?.length > 1 && (
            <span className="text-[10px] text-slate-500">
              +{user.enrolledCourses.length - 1}
            </span>
          )}
        </div>
      </div>
      <div className="ml-auto flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setSelectedUser(user)}
          className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
        >
          <Eye size={12} /> View
        </button>
        <button
          onClick={() => setDeleteTarget(user)}
          className="flex items-center gap-1 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-violet-500/8 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] h-80 w-80 rounded-full bg-cyan-500/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-2">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="mt-5 text-3xl font-black tracking-tight md:text-4xl">
            All
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {" "}
              Users
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
            Manage students, instructors, and admins. View enrollments,
            certificates, and account status at a glance.
          </p>
        </div>

        {/* STATS */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon={<BarChart2 size={20} className="text-cyan-400" />}
            label="Total Users"
            value={stats.total}
            color="via-cyan-400/60"
          />
          <StatCard
            icon={<ShieldCheck size={20} className="text-emerald-400" />}
            label="Verified"
            value={stats.verified}
            color="via-emerald-400/60"
            sub={`${stats.total ? Math.round((stats.verified / stats.total) * 100) : 0}% of total`}
          />
          <StatCard
            icon={<UserCheck size={20} className="text-violet-400" />}
            label="Students"
            value={stats.students}
            color="via-violet-400/60"
          />
          <StatCard
            icon={<GraduationCap size={20} className="text-amber-400" />}
            label="Instructors"
            value={stats.instructors}
            color="via-amber-400/60"
          />
        </div>

        {/* TOOLBAR */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search by username, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent py-4 pl-14 pr-5 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none rounded-2xl border border-white/10 bg-white/[0.04] pl-4 pr-10 py-3 text-sm font-semibold text-slate-300 outline-none cursor-pointer hover:border-white/20"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="instructor">Instructors</option>
              <option value="admin">Admins</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-2xl border border-white/10 bg-white/[0.04] pl-4 pr-10 py-3 text-sm font-semibold text-slate-300 outline-none cursor-pointer hover:border-white/20"
            >
              <option value="all">All Status</option>
              <option value="active">Verified</option>
              <option value="inactive">Unverified</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          <div className="flex rounded-2xl border border-white/10 bg-white/[0.04] p-1">
            <button
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${viewMode === "card" ? "bg-violet-500 text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              <LayoutGrid size={16} /> Cards
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${viewMode === "list" ? "bg-violet-500 text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              <List size={16} /> List
            </button>
          </div>

          <button
            onClick={() => fetchUsers(searchTerm)}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-400 hover:text-white transition"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.03]"
          >
            <Plus size={16} /> Add User
          </button>
        </div>

        {!loading && users.length > 0 && (
          <p className="mb-4 text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-300">{users.length}</span>{" "}
            users
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-6 py-5 text-red-300">
            {error}
          </div>
        )}

        {!loading &&
          users.length > 0 &&
          (viewMode === "card" ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {users.map((u, i) => (
                <UserCard key={u.id} user={u} index={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <UserRow key={u.id} user={u} />
              ))}
            </div>
          ))}

        {!loading && users.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] py-24 text-center">
            <UserX className="h-14 w-14 text-slate-600" />
            <h3 className="mt-6 text-2xl font-bold text-white">
              No users found
            </h3>
            <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
              No users match your current filters. Try different keywords or
              reset filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
                setStatusFilter("all");
              }}
              className="mt-8 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.03]"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => fetchUsers(searchTerm)}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
      {selectedUser && (
        <UserDrawer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onDelete={(u) => {
            setSelectedUser(null);
            setDeleteTarget(u);
          }}
        />
      )}
    </div>
  );
};

export default UsersPage;
