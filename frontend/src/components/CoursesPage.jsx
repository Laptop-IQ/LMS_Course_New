import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useRef,
} from "react";

import { useNavigate } from "react-router-dom";

import { User, Search, X, SmilePlus, BookOpen, Eye, Clock3 } from "lucide-react";

import { ToastContainer, toast, Slide } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import { TOKEN_KEY } from "@/constants/auth";

import RatingStars from "@/components/common/RatingStars";

const API_BASE = import.meta.env.VITE_API_BASE;

/* =========================================================
   UTILITIES
========================================================= */

const debounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

const formatViews = (views = 0) => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }

  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }

  return views;
};

const formatPrice = (course) => {
  const isFree =
    course.pricingType === "free" ||
    !course.price ||
    (!course?.price?.sale && !course?.price?.original);

  if (isFree) {
    return {
      free: true,
      current: "Free",
      original: null,
    };
  }

  const sale = course?.price?.sale;
  const original = course?.price?.original;

  if (sale) {
    return {
      free: false,
      current: `₹${sale}`,
      original: original && original > sale ? `₹${original}` : null,
    };
  }

  return {
    free: false,
    current: `₹${original}`,
    original: null,
  };
};

/* =========================================================
   COURSE CARD
========================================================= */

const CourseCard = memo(
  ({ course, userRating, onRate, onOpen, isSignedIn }) => {
    const price = useMemo(() => formatPrice(course), [course]);

    return (
      <article
        onClick={() => onOpen(course.id)}
        className="
        group relative overflow-hidden
        rounded-lg border border-white/10
        bg-[#12182d]
        transition-all duration-300
        hover:-translate-y-2
        hover:border-cyan-400/40
        hover:shadow-2xl
        hover:shadow-cyan-500/10
        cursor-pointer
      "
      >
        {/* Glow */}
        <div
          className="
          absolute inset-0 opacity-0
          transition-opacity duration-500
          group-hover:opacity-100
        "
        >
          <div
            className="
            absolute inset-0
            bg-gradient-to-br
            from-cyan-500/5
            via-transparent
            to-blue-500/10
          "
          />
        </div>

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
        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3
            className="
  mb-3 line-clamp-2 text-lg
  font-bold text-white
  transition-colors duration-300
  group-hover:text-cyan-300
  min-h-[3.5rem]
"
          >
            {course.name}
          </h3>

          {/* Teacher */}
          <div
            className="
            mb-4 flex items-center gap-2
            text-sm text-slate-300
          "
          >
            <User className="h-4 w-4 text-cyan-400" />

            <span className="truncate">{course.teacher}</span>
          </div>
          {/* META */}
          <div className="mt-3 mb-3 flex items-center justify-between text-sm text-gray-300">
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

          {/* Rating */}
          <div className="mb-5 flex items-center justify-between">
            <RatingStars
              rating={userRating || Math.round(course.avgRating || 0)}
              size={18}
              interactive={isSignedIn}
              onRate={(value) => onRate(course.id, value)}
            />

            <span className="text-xs font-medium text-slate-400">
              {Number(course.avgRating || 0).toFixed(1)} (
              {course.totalRatings || 0})
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Price */}
            <div>
              {price.free ? (
                <span className="text-lg font-bold text-green-400">Free</span>
              ) : (
                <div className="flex items-end gap-2">
                  <span className="text-lg font-bold text-white">
                    {price.current}
                  </span>

                  {price.original && (
                    <span className="text-sm text-slate-500 line-through">
                      {price.original}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();

                onOpen(course.id);
              }}
              className="
              rounded-xl bg-gradient-to-r
              from-cyan-500 to-blue-600
              px-4 py-2 text-sm font-semibold
              text-white transition-all duration-300
              hover:scale-105
            "
            >
              View
            </button>
          </div>
        </div>
      </article>
    );
  },
);

/* =========================================================
   SKELETON
========================================================= */

const SkeletonCard = () => {
  return (
    <div
      className="
      animate-pulse overflow-hidden rounded-2xl
      border border-white/10 bg-[#12182d]
    "
    >
      <div className="h-52 bg-slate-700/40" />

      <div className="space-y-4 p-5">
        <div className="h-5 rounded bg-slate-700/40" />

        <div className="h-4 w-2/3 rounded bg-slate-700/30" />

        <div className="h-4 w-1/2 rounded bg-slate-700/30" />

        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="
                h-4 w-4 rounded-full
                bg-slate-700/30
              "
            />
          ))}
        </div>

        <div className="h-6 w-24 rounded bg-slate-700/40" />
      </div>
    </div>
  );
};

/* =========================================================
   MAIN PAGE
========================================================= */

const CoursePage = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem(TOKEN_KEY);

  const isSignedIn = !!token;

  const [courses, setCourses] = useState([]);

  const [ratings, setRatings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userCourseRatings")) || {};
    } catch {
      return {};
    }
  });

  const [search, setSearch] = useState("");

  const debouncedSearch = debounce(search, 300);

  const [loading, setLoading] = useState(true);

  const ratingTimeout = useRef(null);

  /* =========================================================
     SAVE RATINGS
  ========================================================= */

  useEffect(() => {
    localStorage.setItem("userCourseRatings", JSON.stringify(ratings));
  }, [ratings]);

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
          `${API_BASE}/api/course/public?page=1&limit=12`,
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

              views: latest.views ?? course.views,
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
     FILTER COURSES
  ========================================================= */

  const filteredCourses = useMemo(() => {
    const q = debouncedSearch.toLowerCase();

    return courses.filter(
      (course) =>
        course.name?.toLowerCase().includes(q) ||
        course.teacher?.toLowerCase().includes(q) ||
        course.category?.toLowerCase().includes(q),
    );
  }, [courses, debouncedSearch]);

  /* =========================================================
     OPEN COURSE
  ========================================================= */

  const openCourse = useCallback(
    async (id) => {
      if (!isSignedIn) {
        toast.error("Please login first", {
          position: "top-right",
          transition: Slide,
          autoClose: 2500,
          theme: "dark",
        });

        return;
      }

      /* Optimistic Views */

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

      navigate(`/courses/${id}`);
    },
    [isSignedIn, navigate, token],
  );

  /* =========================================================
     SUBMIT RATING
  ========================================================= */

  const submitRating = async (courseId, rating) => {
    try {
      const res = await fetch(`${API_BASE}/api/ratings/rate`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          courseId,
          rating,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Rating failed");
      }

      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? {
                ...c,

                avgRating: data.avgRating ?? c.avgRating,

                totalRatings: data.totalRatings ?? c.totalRatings,
              }
            : c,
        ),
      );

      toast.success("Rating submitted");
    } catch (err) {
      toast.error(err.message || "Rating failed");
    }
  };

  /* =========================================================
     HANDLE RATING
  ========================================================= */

  const handleRating = (courseId, rating) => {
    if (!isSignedIn) {
      toast.error("Please login first");

      return;
    }

    /* Optimistic UI */

    setRatings((prev) => ({
      ...prev,
      [courseId]: rating,
    }));

    clearTimeout(ratingTimeout.current);

    ratingTimeout.current = setTimeout(() => {
      submitRating(courseId, rating);
    }, 400);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen overflow-hidden bg-[#030712] text-white">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="
          absolute left-0 top-0
          h-96 w-96 rounded-full
          bg-cyan-500/10 blur-3xl
        "
        />

        <div
          className="
          absolute bottom-0 right-0
          h-96 w-96 rounded-full
          bg-indigo-500/10 blur-3xl
        "
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-5">
        {/* Badge */}
        <div
          className="
          mb-5 inline-flex items-center gap-2
          rounded-lg border border-cyan-400/20
          bg-cyan-400/10 px-5 py-2
          text-sm text-cyan-300
        "
        >
          <BookOpen size={16} />
          Explore Premium Courses
        </div>

        {/* Header */}
        <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black md:text-4xl">
              Learn Skills That
              <span
                className="
                bg-gradient-to-r
                from-cyan-500 to-blue-600
                bg-clip-text text-transparent
              "
              >
                {" "}
                Build Careers
              </span>
            </h1>

            <p className="mt-3 text-lg text-slate-400">
              Discover industry-ready courses with expert instructors.
            </p>
          </div>

          {/* Search */}
          <div className="w-full max-w-md">
            <div className="relative">
              <Search
                className="
                absolute left-5 top-1/2
                h-4 w-4 -translate-y-1/2
                text-slate-500
              "
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="
                h-12 w-full rounded-lg
                border border-white/10
                bg-white/5 pl-14 pr-14
                text-white outline-none
                backdrop-blur-xl
                placeholder:text-slate-500
                focus:border-cyan-400
              "
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="
                  absolute right-5 top-1/2
                  -translate-y-1/2
                  text-slate-400
                  hover:text-white
                "
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Empty */}
        {!loading && filteredCourses.length === 0 && (
          <div className="py-24 text-center">
            <SmilePlus className="mx-auto mb-5 h-16 w-16 text-slate-500" />

            <h3 className="mb-2 text-2xl font-bold">No Courses Found</h3>

            <p className="text-slate-400">
              Try searching with different keywords
            </p>
          </div>
        )}

        {/* Grid */}
        <div
          className="
          grid gap-8
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
        >
          {loading
            ? Array.from({
                length: 8,
              }).map((_, i) => <SkeletonCard key={i} />)
            : filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  userRating={ratings[course.id]}
                  onRate={handleRating}
                  onOpen={openCourse}
                  isSignedIn={isSignedIn}
                />
              ))}
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={2500}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        transition={Slide}
        theme="dark"
      />
    </div>
  );
};

export default CoursePage;
