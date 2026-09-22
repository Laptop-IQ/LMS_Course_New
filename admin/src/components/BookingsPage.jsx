import React, { useEffect, useRef, useState } from "react";
import {
  BadgeIndianRupee,
  BookOpen,
  Search,
  User,
  GraduationCap,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  Trash2,
  Plus,
  LayoutGrid,
  List,
  X,
  Clock,
  Infinity,
  AlertTriangle,
  CreditCard,
  Mail,
  Hash,
  ShieldCheck,
  XCircle,
  Hourglass,
  Wallet,
  CircleDollarSign,
  PackageCheck,
  PackageX,
  Timer,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

// ---------- validity badge helper ----------
const ValidityBadge = ({ validity, expiresAt }) => {
  const map = {
    "1year": {
      label: "1 Year",
      color: "text-amber-300 border-amber-500/20 bg-amber-500/10",
    },
    "2year": {
      label: "2 Years",
      color: "text-blue-300 border-blue-500/20 bg-blue-500/10",
    },
    lifetime: {
      label: "Lifetime",
      color: "text-violet-300 border-violet-500/20 bg-violet-500/10",
    },
  };
  const cfg = map[validity] || {
    label: "N/A",
    color: "text-slate-400 border-slate-500/20 bg-slate-500/10",
  };

  const expired =
    validity !== "lifetime" && expiresAt && new Date(expiresAt) < new Date();

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <div
        className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.color}`}
      >
        {validity === "lifetime" ? <Infinity size={11} /> : <Clock size={11} />}
        {cfg.label}
      </div>
      {expired && (
        <div className="flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-300">
          <AlertTriangle size={11} />
          Expired
        </div>
      )}
    </div>
  );
};

// ---------- Payment Status Badge ----------
const PaymentBadge = ({ status }) => {
  const map = {
    Paid: {
      icon: <ShieldCheck size={12} />,
      color: "text-emerald-300 border-emerald-500/20 bg-emerald-500/10",
    },
    Unpaid: {
      icon: <XCircle size={12} />,
      color: "text-red-300 border-red-500/20 bg-red-500/10",
    },
    Pending: {
      icon: <Hourglass size={12} />,
      color: "text-yellow-300 border-yellow-500/20 bg-yellow-500/10",
    },
    Refunded: {
      icon: <CircleDollarSign size={12} />,
      color: "text-blue-300 border-blue-500/20 bg-blue-500/10",
    },
  };
  const cfg = map[status] || map["Unpaid"];
  return (
    <div
      className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.color}`}
    >
      {cfg.icon} {status}
    </div>
  );
};

// ---------- Order Status Badge ----------
const OrderBadge = ({ status }) => {
  const map = {
    Confirmed: {
      icon: <PackageCheck size={12} />,
      color: "text-cyan-300 border-cyan-500/20 bg-cyan-500/10",
    },
    Pending: {
      icon: <Timer size={12} />,
      color: "text-yellow-300 border-yellow-500/20 bg-yellow-500/10",
    },
    Cancelled: {
      icon: <PackageX size={12} />,
      color: "text-red-300 border-red-500/20 bg-red-500/10",
    },
  };
  const cfg = map[status] || map["Pending"];
  return (
    <div
      className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.color}`}
    >
      {cfg.icon} {status}
    </div>
  );
};

// ---------- Add Booking Modal ----------
const AddModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    studentName: "",
    email: "",
    courseId: "",
    courseName: "",
    teacherName: "",
    price: "",
    validity: "lifetime",
    paymentMethod: "Online",
    paymentStatus: "Paid",
    orderStatus: "Confirmed",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.courseId || !form.courseName || !form.studentName) {
      setErr("Student name, Course ID and Course Name are required.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/api/booking/admin/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) || 0 }),
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

  const Field = ({ label, k, type = "text", children }) => (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      {children || (
        <input
          type={type}
          value={form[k]}
          onChange={(e) => set(k, e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
        />
      )}
    </div>
  );

  const SelectField = ({ label, k, options }) => (
    <Field label={label}>
      <select
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-[#0d1117] px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
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

        <h2 className="mb-6 text-xl font-bold text-white">Add Booking</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Student Name" k="studentName" />
            <Field label="Email" k="email" type="email" />
            <Field label="Course ID" k="courseId" />
            <Field label="Course Name" k="courseName" />
            <Field label="Teacher Name" k="teacherName" />
            <Field label="Price (₹)" k="price" type="number" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Validity"
              k="validity"
              options={[
                { value: "1year", label: "1 Year" },
                { value: "2year", label: "2 Years" },
                { value: "lifetime", label: "Lifetime" },
              ]}
            />
            <SelectField
              label="Payment Method"
              k="paymentMethod"
              options={[
                { value: "Online", label: "Online" },
                { value: "Offline", label: "Offline" },
                { value: "UPI", label: "UPI" },
                { value: "Cash", label: "Cash" },
              ]}
            />
            <SelectField
              label="Payment Status"
              k="paymentStatus"
              options={[
                { value: "Paid", label: "Paid" },
                { value: "Unpaid", label: "Unpaid" },
                { value: "Pending", label: "Pending" },
                { value: "Refunded", label: "Refunded" },
              ]}
            />
            <SelectField
              label="Order Status"
              k="orderStatus"
              options={[
                { value: "Confirmed", label: "Confirmed" },
                { value: "Pending", label: "Pending" },
                { value: "Cancelled", label: "Cancelled" },
              ]}
            />
          </div>

          <Field label="Notes" k="notes" />
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
            className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? "Adding…" : "Add Booking"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Delete Confirm ----------
const DeleteConfirm = ({ booking, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/booking/${booking.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onDeleted(booking.id);
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
        <h2 className="text-lg font-bold text-white">Delete Booking?</h2>
        <p className="mt-2 text-sm text-slate-400">
          This will permanently delete booking for{" "}
          <span className="font-semibold text-white">
            {booking.studentName}
          </span>{" "}
          in{" "}
          <span className="font-semibold text-white">{booking.courseName}</span>
          .
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
const BookingsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("card");
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const normalize = (b, idx) => ({
    id: b._id || b.bookingId || String(idx),
    bookingId: b.bookingId || "N/A",
    studentName: b.studentName || b.userName || "Unknown student",
    email: b.userId?.email || b.user?.email || b.email || b.userEmail || b.studentEmail || "—",
    courseName: b.courseName || "Untitled course",
    courseId: b.course || b.courseId || "—",
    price: b.price ?? 0,
    teacherName: b.teacherName || "Unknown teacher",
    purchaseDate: b.createdAt
      ? new Date(b.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-",
    paidAt: b.paidAt
      ? new Date(b.paidAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : null,
    expiresAt: b.expiresAt || null,
    expiresAtFormatted: b.expiresAt
      ? new Date(b.expiresAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : null,
    validity: b.validity || "lifetime",
    paymentMethod: b.paymentMethod || "Online",
    paymentStatus: b.paymentStatus || "Unpaid",
    orderStatus: b.orderStatus || "Pending",
    notes: b.notes || "",
  });

  const fetchBookings = async (search = "") => {
    setLoading(true);
    setError(null);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const q = new URLSearchParams({ limit: "200", page: "1" });
      if (search) q.set("search", search);
      const res = await fetch(`${API_BASE}/api/booking?${q}`, {
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Status ${res.status}`);
      }
      const data = await res.json();
      if (data?.success) {
        setBookings((data.bookings || []).map(normalize));
      } else {
        setBookings([]);
        setError(data?.message || "No data");
      }
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings("");
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => fetchBookings(searchTerm.trim()),
      350,
    );
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const handleDeleted = (id) =>
    setBookings((prev) => prev.filter((b) => b.id !== id));

  // ---------- Card ----------
  const BookingCard = ({ booking, index }) => (
    <div
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-500/30 hover:bg-cyan-500/[0.03]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
          <User className="h-6 w-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-white">
            {booking.studentName}
          </h3>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 truncate">
            <Mail size={12} className="shrink-0" />
            <span className="truncate">{booking.email}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays size={12} /> Enrolled {booking.purchaseDate}
          </div>
        </div>
      </div>

      {/* Status Row */}
      <div className="mt-4 flex flex-wrap gap-2">
        <OrderBadge status={booking.orderStatus} />
        <PaymentBadge status={booking.paymentStatus} />
        <ValidityBadge
          validity={booking.validity}
          expiresAt={booking.expiresAt}
        />
      </div>

      {/* Divider */}
      <div className="my-5 h-px bg-white/5" />

      {/* Details Grid */}
      <div className="space-y-4">
        {/* Course */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
            <BookOpen className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Course
            </p>
            <p className="truncate text-sm font-semibold text-slate-200">
              {booking.courseName}
            </p>
          </div>
        </div>

        {/* Instructor + Payment Method – 2 col */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
              <GraduationCap className="h-4 w-4 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Instructor
              </p>
              <p className="truncate text-sm font-semibold text-slate-200">
                {booking.teacherName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <Wallet className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Method
              </p>
              <p className="truncate text-sm font-semibold text-slate-200">
                {booking.paymentMethod}
              </p>
            </div>
          </div>
        </div>

        {/* Price + Paid At */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <BadgeIndianRupee className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Amount
              </p>
              <p className="text-sm font-bold text-emerald-300">
                ₹{booking.price}
              </p>
            </div>
          </div>
          {booking.paidAt && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                <CreditCard className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Paid On
                </p>
                <p className="text-sm font-semibold text-slate-200">
                  {booking.paidAt}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Expires At */}
        {booking.expiresAtFormatted && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Access Expires
              </p>
              <p className="text-sm font-semibold text-slate-200">
                {booking.expiresAtFormatted}
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              Notes
            </p>
            <p className="text-xs text-slate-400">{booking.notes}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
        <div>
          <p className="text-[10px] text-slate-600 mb-0.5">Booking ID</p>
          <span className="font-mono text-xs text-cyan-300">
            {booking.bookingId !== "N/A"
              ? booking.bookingId.replace("BK-", "BK-").slice(0, 18) + "…"
              : `#${booking.id.slice(-6)}`}
          </span>
        </div>
        <button
          onClick={() => setDeleteTarget(booking)}
          className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );

  // ---------- List Row ----------
  const BookingRow = ({ booking }) => (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 transition hover:bg-white/[0.06]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
        <User className="h-5 w-5 text-white" />
      </div>

      {/* Name + email */}
      <div className="min-w-[140px] flex-1">
        <p className="text-sm font-bold text-white">{booking.studentName}</p>
        <p className="text-xs text-slate-500 truncate max-w-[160px]">
          {booking.email}
        </p>
      </div>

      {/* Course */}
      <div className="min-w-[160px] flex-1">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          Course
        </p>
        <p className="text-sm font-semibold text-slate-200 truncate">
          {booking.courseName}
        </p>
      </div>

      {/* Instructor */}
      <div className="min-w-[110px]">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          Instructor
        </p>
        <p className="text-sm font-semibold text-slate-200">
          {booking.teacherName}
        </p>
      </div>

      {/* Price */}
      <div className="min-w-[70px]">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          Amount
        </p>
        <p className="text-sm font-bold text-emerald-300">₹{booking.price}</p>
      </div>

      {/* Method */}
      <div className="min-w-[70px]">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          Method
        </p>
        <p className="text-xs font-semibold text-slate-300">
          {booking.paymentMethod}
        </p>
      </div>

      {/* Paid On */}
      {booking.paidAt && (
        <div className="min-w-[90px]">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Paid On
          </p>
          <p className="text-xs font-semibold text-slate-300">
            {booking.paidAt}
          </p>
        </div>
      )}

      {/* Expires */}
      {booking.expiresAtFormatted && (
        <div className="min-w-[90px]">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Expires
          </p>
          <p className="text-xs font-semibold text-amber-300">
            {booking.expiresAtFormatted}
          </p>
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <OrderBadge status={booking.orderStatus} />
        <PaymentBadge status={booking.paymentStatus} />
        <ValidityBadge
          validity={booking.validity}
          expiresAt={booking.expiresAt}
        />
      </div>

      {/* Booking ID */}
      <div className="hidden xl:block">
        <p className="text-[10px] text-slate-600">Booking ID</p>
        <span className="font-mono text-xs text-cyan-400">
          {booking.bookingId !== "N/A"
            ? booking.bookingId.slice(0, 20) + "…"
            : `#${booking.id.slice(-6)}`}
        </span>
      </div>

      <button
        onClick={() => setDeleteTarget(booking)}
        className="ml-auto flex items-center gap-1 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
      >
        <Trash2 size={13} /> Delete
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* BG */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-2">
        {/* HEADER */}
        <div>
          <h1 className="mt-5 text-3xl font-black tracking-tight md:text-4xl">
            Course
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {" "}
              Bookings
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 mb-2 text-slate-400 md:text-base">
            Monitor student purchases, premium enrollments, and instructor
            performance in real-time.
          </p>
        </div>

        {/* TOOLBAR */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search by student, course, teacher, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent py-4 pl-14 pr-5 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="flex rounded-2xl border border-white/10 bg-white/[0.04] p-1">
            <button
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${viewMode === "card" ? "bg-cyan-500 text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              <LayoutGrid size={16} /> Cards
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${viewMode === "list" ? "bg-cyan-500 text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              <List size={16} /> List
            </button>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.03]"
          >
            <Plus size={16} /> Add Booking
          </button>
        </div>

        {/* STATES */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-6 py-5 text-red-300">
            {error}
          </div>
        )}

        {/* CONTENT */}
        {!loading &&
          bookings.length > 0 &&
          (viewMode === "card" ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {bookings.map((b, i) => (
                <BookingCard key={b.id} booking={b} index={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <BookingRow key={b.id} booking={b} />
              ))}
            </div>
          ))}

        {/* EMPTY */}
        {!loading && bookings.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] py-24 text-center">
            <Search className="h-14 w-14 text-slate-600" />
            <h3 className="mt-6 text-2xl font-bold text-white">
              No bookings found
            </h3>
            <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
              No bookings match your current search. Try different keywords or
              clear your search.
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.03]"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => fetchBookings(searchTerm)}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          booking={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
};

export default BookingsPage;
