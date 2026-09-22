import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Pencil,
  Trash2,
  Link,
  FileText,
  Video,
  Plus,
  X,
  Save,
  ExternalLink,
  Loader2,
  PackageOpen,
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE;

/* ─── per-type config ─── */
const TYPE = {
  link: {
    icon: Link,
    label: "Link",
    iconCls: "text-cyan-300",
    pillCls: "border-cyan-500/20   bg-cyan-500/10   text-cyan-300",
    dotCls: "bg-cyan-400",
  },
  pdf: {
    icon: FileText,
    label: "PDF",
    iconCls: "text-rose-300",
    pillCls: "border-rose-500/20   bg-rose-500/10   text-rose-300",
    dotCls: "bg-rose-400",
  },
  video: {
    icon: Video,
    label: "Video",
    iconCls: "text-violet-300",
    pillCls: "border-violet-500/20 bg-violet-500/10 text-violet-300",
    dotCls: "bg-violet-400",
  },
};

const ghostInput =
  "h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:bg-white/[0.06]";

const ghostSelect =
  "h-10 w-full rounded-xl border border-white/[0.08] bg-[#0c111d] px-3.5 text-sm text-white outline-none transition focus:border-cyan-400/40 cursor-pointer";

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
      {label}
    </span>
    {children}
  </div>
);

/* ════════════════════════════════════════════════════════════════════ */
const CourseResourcesAdmin = ({ courseId }) => {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({ title: "", type: "link", url: "" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    try {
      setFetching(true);
      const res = await axios.get(`${API}/api/resources/${courseId}`);
      setResources(res.data.resources || []);
    } catch {
      toast.error("Failed to load resources");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (courseId) load();
  }, [courseId]);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      toast.error("Title & URL required");
      return;
    }
    try {
      setSubmitting(true);
      const payload = { courseId, ...form };
      if (editingId) {
        await axios.put(`${API}/api/resources/${editingId}`, payload);
        toast.success("Resource updated");
      } else {
        await axios.post(`${API}/api/resources`, payload);
        toast.success("Resource added");
      }
      cancel();
      load();
    } catch {
      toast.error("Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = (r) => {
    setForm({ title: r.title, type: r.type, url: r.url });
    setEditingId(r._id);
    setShowForm(true);
  };
  const onDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      setDeletingId(id);
      await axios.delete(`${API}/api/resources/${id}`);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };
  const cancel = () => {
    setForm({ title: "", type: "link", url: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const counts = resources.reduce(
    (a, r) => ({ ...a, [r.type]: (a[r.type] || 0) + 1 }),
    {},
  );
  const isEditing = Boolean(editingId);

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <div className="space-y-5">
      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between">
        {/* summary pills */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.keys(counts).length === 0 ? (
            <span className="text-xs text-slate-600">No resources yet</span>
          ) : (
            Object.entries(counts).map(([type, n]) => {
              const cfg = TYPE[type] || TYPE.link;
              return (
                <span
                  key={type}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${cfg.pillCls}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotCls}`} />
                  {n} {cfg.label}
                  {n > 1 ? "s" : ""}
                </span>
              );
            })
          )}
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20 active:scale-95"
          >
            <Plus size={13} strokeWidth={2.5} /> Add Resource
          </button>
        )}
      </div>

      {/* ── FORM PANEL ── */}
      {showForm && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
            <span className="text-sm font-semibold text-white">
              {isEditing ? "Edit Resource" : "New Resource"}
            </span>
            <button
              onClick={cancel}
              className="rounded-lg p-1.5 text-slate-600 transition hover:text-slate-300"
            >
              <X size={15} />
            </button>
          </div>

          {/* fields */}
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
            <Field label="Title">
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="e.g. Week 1 Slides"
                className={ghostInput}
                autoFocus
              />
            </Field>
            <Field label="URL">
              <input
                name="url"
                value={form.url}
                onChange={onChange}
                placeholder="https://..."
                className={ghostInput}
              />
            </Field>
            <Field label="Type">
              <select
                name="type"
                value={form.type}
                onChange={onChange}
                className={ghostSelect}
              >
                <option value="link">Link</option>
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
              </select>
            </Field>
          </div>

          {/* footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-white/[0.06] px-5 py-3.5">
            <button
              onClick={cancel}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.08]"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                isEditing
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                  : "border-cyan-500/20  bg-cyan-500/10  text-cyan-300  hover:bg-cyan-500/20"
              }`}
            >
              {submitting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : isEditing ? (
                <Save size={13} />
              ) : (
                <Plus size={13} />
              )}
              {isEditing ? "Save Changes" : "Add Resource"}
            </button>
          </div>
        </div>
      )}

      {/* ── LIST ── */}
      {fetching ? (
        <div className="flex justify-center py-8">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
        </div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/[0.07] py-12 text-center">
          <div className="rounded-2xl bg-white/[0.04] p-4 text-slate-700">
            <PackageOpen size={30} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">
              No resources yet
            </p>
            <p className="mt-0.5 text-xs text-slate-600">
              Add links, PDFs, or videos for students
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-1 flex items-center gap-1.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
          >
            <Plus size={12} /> Add First Resource
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {resources.map((r, idx) => {
            const cfg = TYPE[r.type] || TYPE.link;
            const Icon = cfg.icon;
            const isDel = deletingId === r._id;

            return (
              <div
                key={r._id}
                style={{ animationDelay: `${idx * 40}ms` }}
                className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3.5 transition-all duration-200 hover:border-white/[0.13] hover:bg-white/[0.04]"
              >
                {/* icon */}
                <div
                  className={`shrink-0 rounded-xl border p-2.5 ${cfg.pillCls}`}
                >
                  <Icon size={15} strokeWidth={2} className={cfg.iconCls} />
                </div>

                {/* text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white leading-tight">
                      {r.title}
                    </p>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cfg.pillCls}`}
                    >
                      {r.type}
                    </span>
                  </div>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 flex items-center gap-1 text-xs text-slate-600 transition hover:text-cyan-400"
                  >
                    <span className="truncate max-w-xs">{r.url}</span>
                    <ExternalLink
                      size={10}
                      className="shrink-0 opacity-0 transition group-hover:opacity-100"
                    />
                  </a>
                </div>

                {/* actions — fade in on hover (desktop), always visible mobile */}
                <div className="flex shrink-0 items-center gap-1.5 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                  <button
                    onClick={() => onEdit(r)}
                    title="Edit"
                    className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2 text-slate-500 transition hover:border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-300"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => onDelete(r._id)}
                    disabled={isDel}
                    title="Delete"
                    className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2 text-slate-500 transition hover:border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-40"
                  >
                    {isDel ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseResourcesAdmin;
