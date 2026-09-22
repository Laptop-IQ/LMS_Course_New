import React, { useEffect, useMemo, useState, useCallback } from "react";

import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/context/NotificationContext";

import axios from "axios";

import {
  Bell,
  BookOpen,
  Star,
  MessageCircle,
  Heart,
  CalendarClock,
  CheckCircle2,
  Trash2,
  Search,
  Clock3,
  Settings2,
  Trophy,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import { toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE;

const notificationIcons = {
  reply: MessageCircle,
  rating: Star,
  like: Heart,
};

const notificationColors = {
  reply: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  rating: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  like: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

const formatTimeAgo = (date) => {
  const now = new Date();

  const notificationDate = new Date(date);

  const seconds = Math.floor((now - notificationDate) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day ago`;
  }

  return notificationDate.toLocaleDateString();
};

const NotificationsPage = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("all");

  const handleNotificationClick = async (item) => {
    try {
      if (!item.read) {
        await markAsRead(item._id);
      }

      // COMMENT notification
      if (item.metadata?.courseId && item.metadata?.commentId) {
        navigate(
          `/course/${item.metadata.courseId}?comment=${item.metadata.commentId}`,
        );

        return;
      }

      // COURSE notification
      if (item.metadata?.courseId) {
        navigate(`/course/${item.metadata.courseId}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch =
        n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.message?.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "unread"
            ? !n.read
            : n.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, filter]);

  if (loading) {
    return (
      <section className="min-h-screen bg-[#030712] px-4 py-28 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-center">
          <Loader2 size={40} className="animate-spin text-cyan-400" />
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#030712] px-6 py-5 text-white">
      <div className="mx-auto max-w-6xl px-6">
        {/* BACK BUTTON */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="
              group inline-flex items-center gap-3
              rounded-lg
              border border-white/10
              bg-white/[0.04]
              px-5 py-3
              text-sm font-medium text-slate-300
              backdrop-blur-xl
              transition-all duration-300
              hover:border-cyan-400/30
              hover:bg-cyan-500/10
              hover:text-cyan-300
            "
          >
            <ArrowLeft
              size={17}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
            <span>Back</span>
          </button>
        </div>

        {/* HEADER */}

        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black md:text-4xl">
              Notifications{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Center
              </span>
            </h1>

            <p className="mt-3 text-slate-400">
              Real-time LMS alerts, replies, achievements and updates.
            </p>
          </div>

          {/* STATS */}

          <div className="flex gap-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] px-6 py-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Bell className="text-cyan-400" />

                <div>
                  <h3 className="text-xl font-black">
                    {notifications.length}
                  </h3>

                  <p className="text-sm text-slate-400">Total</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.04] px-6 py-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-400" />

                <div>
                  <h3 className="text-xl font-black">{unreadCount}</h3>

                  <p className="text-sm text-slate-400">Unread</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}

        <div className="mb-8 flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          {/* SEARCH */}

          <div className="relative w-full max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full rounded-lg
                border border-white/10
                bg-white/[0.05]
                py-4 pl-12 pr-4
                outline-none
                transition-all duration-300
                focus:border-cyan-400
              "
            />
          </div>

          {/* FILTERS */}

          <div className="flex flex-wrap gap-3">
            {[
              "all",
              "unread",
              "reply",
              "rating",
              "like",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`
                  rounded-lg
                  px-5 py-3
                  text-sm font-semibold capitalize
                  transition-all duration-300

                  ${
                    filter === item
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                      : "border border-white/10 bg-white/[0.05] text-slate-300 hover:border-cyan-400/30 hover:bg-white/[0.08]"
                  }
                `}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* ACTIONS */}

        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={markAllAsRead}
            disabled={actionLoading}
            className="
              rounded-lg
              bg-gradient-to-r
              from-cyan-500
              to-blue-600
              px-6 py-3
              font-semibold
              shadow-lg
              shadow-cyan-500/20
              transition-all duration-300
              hover:scale-[1.02]
            "
          >
            Mark All Read
          </button>

          <button
            onClick={clearAll}
            disabled={actionLoading}
            className="
              rounded-lg
              border border-red-500/20
              bg-red-500/10
              px-6 py-3
              font-semibold
              text-red-400
              transition-all duration-300
              hover:bg-red-500/20
            "
          >
            Clear All
          </button>
        </div>

        {/* LIST */}

        <div className="space-y-5">
          {filteredNotifications.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur-xl">
              <Bell size={60} className="mx-auto text-slate-600" />

              <h3 className="mt-5 text-2xl font-bold">
                No Notifications Found
              </h3>

              <p className="mt-2 text-slate-400">You're all caught up 🎉</p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const Icon = notificationIcons[item.type] || Bell;

              return (
                <div
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  className={`
                    group relative overflow-hidden
                    rounded-lg border
                    p-6 backdrop-blur-xl
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:shadow-2xl cursor-pointer

                    ${
                      !item.read
                        ? "border-cyan-500/20 bg-cyan-500/[0.06]"
                        : "border-white/10 bg-white/[0.04]"
                    }
                  `}
                >
                  <div className="flex gap-5">
                    {/* ICON */}

                    <div
                      className={`
                        flex h-14 w-14 shrink-0
                        items-center justify-center
                        rounded-lg border
                        ${
                          notificationColors[item.type] ||
                          "bg-white/10 text-white border-white/10"
                        }
                      `}
                    >
                      <Icon size={24} />
                    </div>

                    {/* CONTENT */}

                    <div className="flex-1">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold">{item.title}</h3>

                            {!item.read && (
                              <span className="rounded-lg bg-cyan-500 px-3 py-1 text-xs font-semibold text-white">
                                New
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-slate-400">{item.message}</p>

                          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                            <Clock3 size={15} />

                            {formatTimeAgo(item.createdAt)}
                          </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="flex gap-3">
                          {!item.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(item._id);
                              }}
                              className="
                                rounded-lg
                                border border-emerald-500/20
                                bg-emerald-500/10
                                px-4 py-3
                                text-emerald-400
                                transition-all duration-300
                                hover:bg-emerald-500/20
                              "
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(item._id);
                            }}
                            className="
                              rounded-lg
                              border border-red-500/20
                              bg-red-500/10
                              px-4 py-3
                              text-red-400
                              transition-all duration-300
                              hover:bg-red-500/20
                            "
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
};

export default NotificationsPage;
