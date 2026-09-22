import React, { useEffect, useMemo, useState, useCallback } from "react";

import { useNavigate } from "react-router-dom";

import { Toaster, toast } from "react-hot-toast";

import { TOKEN_KEY } from "@/constants/auth";

import {
  Star,
  User,
  Play,
  Search,
  BookOpen,
  Clock3,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE;

/* =========================================================
   HELPERS
========================================================= */

const formatViews = (views = 0) => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }

  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }

  return views;
};

const calculateProgress = (course, completedMap) => {
  if (!course) return 0;

  const lectures = course.lectures || [];

  const totalChapters = lectures.flatMap(
    (lecture) => lecture.chapters || [],
  ).length;

  if (!totalChapters) return 0;

  const completed = completedMap[course.id] || [];

  return Math.min(100, Math.round((completed.length / totalChapters) * 100));
};

const normalizeCourse = (course) => {
  return {
    ...course,

    lectures: (course.lectures || []).map((lecture) => ({
      ...lecture,

      chapters: lecture.chapters || [],
    })),
  };
};

/* =========================================================
   COMPONENT
========================================================= */

const MyCoursesPage = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem(TOKEN_KEY);

  const isSignedIn = !!token;

  /* =========================================================
     STATES
  ========================================================= */

  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");

  const [hoverRatings, setHoverRatings] = useState({});

  const [completedMap, setCompletedMap] = useState({});

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
      return [];
    }
  });

  const [userRatings, setUserRatings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userCourseRatings")) || {};
    } catch {
      return {};
    }
  });

  /* =========================================================
     LOCAL STORAGE
  ========================================================= */

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("userCourseRatings", JSON.stringify(userRatings));
  }, [userRatings]);

  /* =========================================================
     FETCH COURSES
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const controller = new AbortController();

    const fetchCourses = async () => {
      try {
        setLoading(true);

        setError(null);

        if (!isSignedIn) {
          setCourses([]);
          return;
        }

        const headers = {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        };

        /* BOOKINGS */

        const bookingsRes = await fetch(`${API_BASE}/api/booking/my`, {
          method: "GET",

          headers,

          credentials: "include",

          signal: controller.signal,
        });

        if (bookingsRes.status === 401) {
          throw new Error("Please login again.");
        }

        if (!bookingsRes.ok) {
          throw new Error("Failed to fetch courses.");
        }

        const bookingsJson = await bookingsRes.json();

        const bookings = bookingsJson.bookings || [];

        /* FETCH COURSE DETAILS */

        const validBookings = bookings.filter((booking) => {
  const hasCourse = booking.course || booking.courseId;
  if (!hasCourse) return false;

  // Free course
  if (booking.isFree === true || booking.price === 0 || booking.amount === 0) {
    return true;
  }

  // Paid course — paymentStatus aur orderStatus dono check karo
  const paymentStatus = booking.paymentStatus?.toLowerCase();
  const orderStatus = booking.orderStatus?.toLowerCase();

  return (
    ["paid", "success", "completed"].includes(paymentStatus) ||
    orderStatus === "confirmed"
  );
          }); 
        const merged = await Promise.all(
          validBookings.map(async (booking) => {
            try {
              const courseId = booking.course || booking.courseId;

              if (!courseId) return null;

              const courseRes = await fetch(
                `${API_BASE}/api/course/${courseId}`,
                {
                  method: "GET",

                  headers,

                  credentials: "include",

                  signal: controller.signal,
                },
              );

              if (!courseRes.ok) {
                return null;
              }

              const courseJson = await courseRes.json();

              const course = normalizeCourse(courseJson?.course);

              if (!course) return null;

              /* FETCH PROGRESS */

              let completedChapters = [];

              try {
                const progressRes = await fetch(
                  `${API_BASE}/api/progress/completed?courseId=${courseId}`,
                  {
                    method: "GET",

                    headers,

                    credentials: "include",

                    signal: controller.signal,
                  },
                );

                if (progressRes.ok) {
                  const progressJson = await progressRes.json();

                  completedChapters = progressJson.completedChapters || [];
                }
              } catch (err) {
                console.log(err);
              }

              return {
                id: course._id || course.id || courseId,

                name: course.name || "Untitled Course",

                teacher: course.teacher || "Unknown Instructor",

                image:
                  course.image ||
                  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",

                overview: course.overview || "Master modern development.",

                avgRating: course.avgRating ?? course.rating ?? 0,

                totalRatings: course.totalRatings ?? course.ratingCount ?? 0,

                lectures: course.lectures || [],

                category: course.category || "Development",

                duration: course.duration || "Self Paced",

                totalLectures:
                  course.totalLectures || course.lectures?.length || 0,

                isFree: course.pricingType === "free" || !course.price,

                price: course.price || {
                  original: 1999,
                  sale: 999,
                },

                views: course.views ?? 0,

                completedChapters,
              };
            } catch {
              return null;
            }
          }),
        );

        if (!mounted) return;

        const finalCourses = merged.filter(
          (course) =>
            course &&
            validBookings.some(
              (booking) =>
                String(booking.course || booking.courseId) ===
                String(course.id),
            ),
        );
        
        /* CREATE COMPLETED MAP */

        const progressMap = {};

        finalCourses.forEach((course) => {
          progressMap[course.id] = course.completedChapters || [];
        });

        setCompletedMap(progressMap);

        setCourses(finalCourses);
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load courses.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCourses();

    return () => {
      mounted = false;

      controller.abort();
    };
  }, [isSignedIn, token]);

  /* =========================================================
     REALTIME COURSE UPDATE
  ========================================================= */

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/course/public?page=1&limit=20`,
        );

        if (!res.ok) return;

        const data = await res.json();

        const updated = data?.courses || data?.items || [];

        setCourses((prev) =>
          prev.map((course) => {
            const latest = updated.find(
              (item) => String(item._id || item.id) === String(course.id),
            );

            if (!latest) return course;

            return {
              ...course,

              avgRating: latest.avgRating ?? course.avgRating,

              totalRatings: latest.totalRatings ?? course.totalRatings,

              views: latest.views ?? course.views ?? 0,
            };
          }),
        );
      } catch (err) {
        console.log(err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /* =========================================================
     FILTERED COURSES
  ========================================================= */

  const filteredCourses = useMemo(() => {
    const q = search.toLowerCase();

    return courses.filter((course) => {
      return (
        course.name?.toLowerCase().includes(q) ||
        course.teacher?.toLowerCase().includes(q) ||
        course.category?.toLowerCase().includes(q)
      );
    });
  }, [courses, search]);

  /* =========================================================
     SUBMIT RATING
  ========================================================= */

  const submitRatingToServer = async (courseId, ratingValue) => {
    try {
      const res = await fetch(`${API_BASE}/api/ratings/rate`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          courseId,

          rating: ratingValue,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit rating");
      }

      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId
            ? {
                ...course,

                avgRating: data.avgRating ?? course.avgRating,

                totalRatings: data.totalRatings ?? course.totalRatings,
              }
            : course,
        ),
      );

      toast.success("Rating submitted!");
    } catch (err) {
      toast.error(err.message || "Failed to submit rating");
    }
  };

  /* =========================================================
     HANDLE RATING
  ========================================================= */

  const handleSetRating = async (e, courseId, rating) => {
    e.stopPropagation();

    if (!isSignedIn) {
      toast.info("Please login first.");

      return;
    }

    setUserRatings((prev) => ({
      ...prev,

      [courseId]: rating,
    }));

    await submitRatingToServer(courseId, rating);
  };

  /* =========================================================
     OPEN COURSE
  ========================================================= */

  const openCourse = useCallback(
    async (id) => {
      if (!isSignedIn) {
       toast.error("Please login to access this course");

        return;
      }

      /* OPTIMISTIC VIEW UPDATE */

      setCourses((prev) =>
        prev.map((course) =>
          course.id === id
            ? {
                ...course,

                views: (course.views || 0) + 1,
              }
            : course,
        ),
      );

      /* BACKEND VIEW UPDATE */

      try {
        await fetch(`${API_BASE}/api/course/${id}/view`, {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,

            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        console.log(err);
      }

      navigate(`/course/${id}`);
    },
    [isSignedIn, navigate, token],
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-[#030712] py-2 text-white">
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-[20rem] w-[20rem] rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="absolute bottom-0 right-0 h-[20rem] w-[20rem] rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-10 h-10 w-60 animate-pulse rounded-xl bg-slate-700" />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({
              length: 8,
            }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
              >
                <div className="h-44 animate-pulse rounded-lg bg-slate-700" />

                <div className="mt-4 space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-700" />

                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-700" />

                  <div className="h-10 animate-pulse rounded bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#030712] px-6 text-white">
        <div className="rounded-2xl border border-red-500/20 bg-white/5 p-10 backdrop-blur-xl">
          <h2 className="mb-3 text-3xl font-black">Something went wrong</h2>

          <p className="text-red-400">{error}</p>
        </div>
      </section>
    );
  }

  /* =========================================================
     EMPTY
  ========================================================= */

  if (!courses.length) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-[#030712] px-6 text-white">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-cyan-500/10">
            <BookOpen size={40} className="text-cyan-400" />
          </div>

          <h2 className="text-4xl font-black">No Courses Yet</h2>

          <p className="mt-3 text-slate-400">
            Start learning by exploring premium courses.
          </p>

          <button
            onClick={() => navigate("/courses")}
            className="mt-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-105"
          >
            Browse Courses
          </button>
        </div>
      </section>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <>
      <section className="relative min-h-screen overflow-hidden bg-[#030712] py-5 text-white">
        {/* BACKGROUND */}
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-[20rem] w-[20rem] rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="absolute bottom-0 right-0 h-[20rem] w-[20rem] rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          {/* HEADER */}
          <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/10 px-4 py-2 text-cyan-300">
                <Sparkles size={14} />
                Continue Learning
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight md:text-4xl">
                My{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Courses
                </span>
              </h1>

              <p className="mt-3 text-lg text-slate-400">
                Track progress and continue your journey.
              </p>
            </div>

            {/* SEARCH */}
            <div className="relative w-full lg:w-[380px]">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search your courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 w-full rounded-xl border border-white/10 bg-white/5 pl-12 pr-5 text-white placeholder:text-slate-500 backdrop-blur-xl outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>
          </div>

          {/* GRID */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredCourses.map((course, index) => {
              const userRating = userRatings[course.id] || 0;

              const hover = hoverRatings[course.id] || 0;

              const displayRating =
                hover || userRating || Math.round(course.avgRating || 0);

              const progressPercentage = calculateProgress(
                course,
                completedMap,
              );

              const totalChapters = course.lectures.flatMap(
                (lecture) => lecture.chapters || [],
              ).length;

              const completedCount = completedMap[course.id]?.length || 0;

              return (
                <div
                  key={course.id}
                  onClick={() => openCourse(course.id)}
                  className="group relative cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-cyan-500/5 via-white/5 to-blue-500/10 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/10"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* IMAGE */}
                  <div className="relative h-38 w-full overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full rounded-lg object-cover p-0.5 transition-transform duration-500 group-hover:scale-[1.03]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

                    {/* PLAY */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/20 backdrop-blur-md">
                        <Play size={22} className="fill-white text-white" />
                      </div>
                    </div>

                    {/* VIEWS */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/90 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-xl">
                      <Eye className="h-3.5 w-3.5 text-cyan-400" />

                      <span>{formatViews(course.views || 0)} views</span>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-lg font-bold text-white transition-colors group-hover:text-blue-200 min-h-[3.5rem]">
                      {course.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                      <User size={14} className="text-cyan-300" />

                      <span className="truncate">{course.teacher}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 size={14} />

                        <span>
                          {completedCount}/{totalChapters} Done
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <BookOpen size={14} />

                        <span>{course.lectures?.length || 0} Lessons</span>
                      </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-slate-400">Progress</span>

                        <span className="font-bold text-cyan-400">
                          {progressPercentage}%
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-700"
                          style={{
                            width: `${progressPercentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* RATING */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {Array.from({
                          length: 5,
                        }).map((_, i) => {
                          const idx = i + 1;

                          const filled = idx <= displayRating;

                          return (
                            <button
                              key={idx}
                              onClick={(e) =>
                                handleSetRating(e, course.id, idx)
                              }
                              onMouseEnter={() =>
                                setHoverRatings((prev) => ({
                                  ...prev,

                                  [course.id]: idx,
                                }))
                              }
                              onMouseLeave={() =>
                                setHoverRatings((prev) => ({
                                  ...prev,

                                  [course.id]: 0,
                                }))
                              }
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                size={18}
                                className={
                                  filled ? "text-yellow-400" : "text-gray-500"
                                }
                                fill={filled ? "currentColor" : "none"}
                              />
                            </button>
                          );
                        })}
                      </div>

                      <span className="text-xs font-medium text-gray-400">
                        {Number(course.avgRating || 0).toFixed(1)} (
                        {course.totalRatings})
                      </span>
                    </div>

                    {/* PRICE */}
                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        {course.isFree ? (
                          <span className="text-lg font-bold text-green-400">
                            Free
                          </span>
                        ) : (
                          <div className="flex items-end gap-2">
                            <span className="text-lg font-bold text-white">
                              ₹{course.price?.sale ?? course.price}
                            </span>

                            {course.price?.original && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{course.price.original}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          openCourse(course.id);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: "#111827",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />
    </>
  );
};

export default MyCoursesPage;
