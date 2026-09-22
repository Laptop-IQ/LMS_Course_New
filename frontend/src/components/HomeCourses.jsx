import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
} from "react";

import { useNavigate } from "react-router-dom";
import RatingStars from "@/components/common/RatingStars";

import {
  Star,
  User,
  ArrowRight,
  BookOpen,
  Clock3,
  Sparkles,
  Eye,
} from "lucide-react";

import { Toaster, toast } from "react-hot-toast";



import { TOKEN_KEY } from "@/constants/auth";

const API_BASE = import.meta.env.VITE_API_BASE;

/* =========================================================
   SKELETON
========================================================= */

const CourseSkeleton = () => (
  <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="mb-4 h-40 w-full rounded-lg bg-gray-200" />

    <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />

    <div className="h-4 w-1/2 rounded bg-gray-200" />
  </div>
);

/* =========================================================
   FORMAT VIEWS
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

/* =========================================================
   COURSE CARD
========================================================= */

const CourseCard = memo(function CourseCard({
  course,
  isSignedIn,
  onClick,
  userRating,
  onRate,
}) {
  const displayRating =
    userRating || Math.round(course.avgRating || 0);

  return (
    <div
      onClick={() => onClick(course.id)}
      className="
        group relative cursor-pointer overflow-hidden
        rounded-lg border border-white/10
        bg-white/5 backdrop-blur-md
        shadow-lg transition-all duration-300
        hover:-translate-y-2 hover:shadow-2xl
      "
    >
      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={course.image}
          alt={course.name}
          loading="lazy"
          decoding="async"
          className="
                   h-full w-full object-contain
                   p-0.5 rounded-lg
                   transition-transform duration-500
                   group-hover:scale-105
                 "
        />

        {/* Views */}
        <div
          className="
                   absolute right-3 bottom-3
                   flex items-center gap-1.5
                   rounded-lg border border-white/10
                   bg-black/90 px-3 py-1.5
                   text-xs font-medium text-white
                   backdrop-blur-xl
                 "
        >
          <Eye className="h-3.5 w-3.5 text-cyan-400" />

          <span>{formatViews(course.views || 0)} views</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        {/* TITLE */}
        <h3
          className="
    line-clamp-2 text-lg font-bold text-white
    transition-colors duration-300
    group-hover:text-cyan-300
    min-h-[3.5rem]
  "
        >
          {course.name}
        </h3>

        {/* TEACHER */}
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-300">
          <User size={14} className="text-cyan-300" />

          <span className="truncate">{course.teacher}</span>
        </div>

        {/* META */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-300">
          <div className="flex items-center gap-1">
            <Clock3 size={14} />

            <span>
              {typeof course.duration === "object"
                ? `${course.duration.hours || 0}h ${course.duration.minutes || 0}m`
                : course.duration || "0m"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <BookOpen size={14} />

            <span>{course.totalLectures} Lessons</span>
          </div>
        </div>

        {/* RATING */}
        <div className="mt-4 flex items-center justify-between">
          <RatingStars rating={displayRating} size={15} interactive={false} />
          <span className="text-xs font-medium text-gray-400">
            {Number(course.avgRating || 0).toFixed(1)} ({course.totalRatings})
          </span>
        </div>

        {/* PRICE */}
        <div className="mt-5 flex items-center justify-between">
          <div>
            {course.isFree ? (
              <span className="text-lg font-bold text-green-400">Free</span>
            ) : (
              <div className="flex items-end gap-2">
                <span className="text-lg font-bold text-white">
                  ₹{course.price?.sale ?? course.price}
                </span>

                {course.price?.original && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{course.price.original}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* BUTTON */}
          <button
            onClick={(e) => {
              e.stopPropagation();

              onClick(course.id);
            }}
            className="
              flex h-10 w-10 items-center justify-center
              rounded-full bg-gradient-to-r
              from-cyan-500 to-blue-600
              text-white shadow-lg
              transition-all duration-300
              hover:scale-110
            "
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});

/* =========================================================
   MAIN COMPONENT
========================================================= */

const HomeCourses = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const token = localStorage.getItem(TOKEN_KEY);

  const isSignedIn = !!token;

  const ratingTimeout = useRef(null);

  /* =========================================================
     USER RATINGS
  ========================================================= */

  const [userRatings, setUserRatings] = useState(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("userCourseRatings")
        ) || {}
      );
    } catch {
      return {};
    }
  });

  /* =========================================================
     SAVE RATINGS
  ========================================================= */

  useEffect(() => {
    localStorage.setItem(
      "userCourseRatings",
      JSON.stringify(userRatings)
    );
  }, [userRatings]);

  /* =========================================================
     FETCH COURSES
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const fetchCourses = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_BASE}/api/course/public?page=1&limit=12`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch courses");
        }

        const json = await res.json();

        const items =
          json?.items || json?.courses || [];

        const mapped = items.map((c) => ({
          id: c._id || c.id,

          name: c.name || "Untitled Course",

          teacher: c.teacher || "Unknown Teacher",

          image: c.image || "https://via.placeholder.com/400x300",

          price: c.price,

          duration:
            typeof c.duration === "object"
              ? `${c.duration.hours || 0}h ${c.duration.minutes || 0}m`
              : c.duration ||
                c.totalDuration ||
                (() => {
                  const total =
                    (c.lectures || []).reduce(
                      (acc, lecture) =>
                        acc +
                        (lecture.durationMin || lecture.totalMinutes || 0),
                      0,
                    ) || 0;

                  const h = Math.floor(total / 60);
                  const m = total % 60;

                  if (h <= 0) return `${m}m`;

                  return `${h}h ${m}m`;
                })(),

          totalLectures: c.totalLectures || 0,

          isFree: c.pricingType === "free" || !c.price,

          avgRating: c.avgRating ?? c.rating ?? 0,

          totalRatings: c.totalRatings ?? c.ratingCount ?? 0,

          views: c.views ?? 0,
        }));

        if (mounted) {
          setCourses(mapped.slice(0, 8));
        }
      } catch (err) {
        console.error(err);

        if (mounted) {
          setError("Failed to load courses");
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
    };
  }, []);

  /* =========================================================
     REALTIME UPDATE
  ========================================================= */

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/course/public?page=1&limit=12`
        );

        if (!res.ok) return;

        const data = await res.json();

        const updated =
          data?.courses || data?.items || [];

        setCourses((prev) =>
          prev.map((course) => {
            const latest = updated.find(
              (item) =>
                String(item._id || item.id) ===
                String(course.id)
            );

            if (!latest) return course;

           const total =
             (latest.lectures || []).reduce(
               (acc, lecture) =>
                 acc + (lecture.durationMin || lecture.totalMinutes || 0),
               0,
             ) || 0;

           const h = Math.floor(total / 60);
           const m = total % 60;

           const liveDuration =
             latest.duration ||
             latest.totalDuration ||
             (h > 0 ? `${h}h ${m}m` : `${m}m`);

           return {
             ...course,

             avgRating: latest.avgRating ?? course.avgRating,

             totalRatings: latest.totalRatings ?? course.totalRatings,

             views: latest.views ?? course.views ?? 0,

             duration: liveDuration || course.duration,
           };
          })
        );
      } catch (err) {
        console.log(err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /* =========================================================
     LOGIN TOAST
  ========================================================= */

  const showLoginToast = () => {
    toast.error(
      "Please login to continue",
      {
        position: "top-right",
        autoClose: 2500,
        theme: "dark",
        transition: Slide,
      }
    );
  };

  /* =========================================================
     OPEN COURSE
  ========================================================= */

  const handleCourseClick = useCallback(
    async (id) => {
      if (!isSignedIn) {
        showLoginToast();
        return;
      }

      /* OPTIMISTIC VIEW UPDATE */

      setCourses((prev) =>
        prev.map((course) =>
          course.id === id
            ? {
                ...course,
                views:
                  (course.views || 0) + 1,
              }
            : course
        )
      );

      /* BACKEND VIEW UPDATE */

      try {
        await fetch(
          `${API_BASE}/api/course/${id}/view`,
          {
            method: "POST",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );
      } catch (err) {
        console.log(err);
      }

      navigate(`/course/${id}`);
    },
    [isSignedIn, navigate, token]
  );

  /* =========================================================
     SUBMIT RATING
  ========================================================= */

  const submitRating = async (
    courseId,
    rating
  ) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/ratings/rate`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            courseId,
            rating,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Rating failed"
        );
      }

      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? {
                ...c,

                avgRating:
                  data.avgRating ??
                  c.avgRating,

                totalRatings:
                  data.totalRatings ??
                  c.totalRatings,
              }
            : c
        )
      );
    } catch (err) {
      toast.error(
        err.message || "Rating failed"
      );
    }
  };

  /* =========================================================
     HANDLE RATE
  ========================================================= */

  const handleRate = (
    courseId,
    rating
  ) => {
    if (!isSignedIn) {
      showLoginToast();
      return;
    }

    setUserRatings((prev) => ({
      ...prev,
      [courseId]: rating,
    }));

    clearTimeout(ratingTimeout.current);

    ratingTimeout.current = setTimeout(() => {
      submitRating(courseId, rating);
    }, 400);
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <>
      <section className="relative overflow-hidden bg-[#030712] py-5 text-white">
        {/* BG */}
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-[20rem] w-[20rem] rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="absolute bottom-0 right-0 h-[20rem] w-[20rem] rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 mb-3">
          {/* HEADER */}
          <div className="mb-12 text-center">
            <div
              className="
                inline-flex items-center gap-2
                rounded-lg border border-cyan-500/20
                bg-cyan-500/10 px-4 py-2
                text-sm text-cyan-300
              "
            >
              <Sparkles size={14} />
              Premium Courses
            </div>

            <h2 className="mt-4 text-4xl font-extrabold">
              Top Selling{" "}
              <span
                className="
                  bg-gradient-to-r
                  from-cyan-400 to-blue-500
                  bg-clip-text text-transparent
                "
              >
                Courses
              </span>
            </h2>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CourseSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isSignedIn={isSignedIn}
                  onClick={handleCourseClick}
                  userRating={userRatings[course.id]}
                  onRate={handleRate}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,

          style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },

          success: {
            style: {
              border: "1px solid #06b6d4",
            },
          },

          error: {
            style: {
              border: "1px solid #ef4444",
            },
          },
        }}
      />
    </>
  );
};

export default HomeCourses;