// utils/markChapter.js
// Course player mein import karke use karo

const API_BASE = import.meta.env.VITE_API_BASE;

/**
 * Chapter ko complete/incomplete mark karo
 * @param {string} courseId
 * @param {string} chapterId
 * @param {boolean} completed
 * @param {number} durationMins - chapter kitne mins ka tha (default 10)
 */
export const markChapter = async (courseId, chapterId, completed, durationMins = 10) => {
  const token = localStorage.getItem("token"); // apna TOKEN_KEY yahan lagao

  try {
    const res = await fetch(`${API_BASE}/api/progress/mark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId, chapterId, completed, durationMins }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("markChapter error:", err);
    return null;
  }
};

// ─── Usage example in your course player ───────────────────
//
// import { markChapter } from "@/utils/markChapter";
//
// // Jab user chapter complete kare:
// await markChapter(courseId, chapterId, true, chapter.duration || 10);
//
// // Jab unmark kare:
// await markChapter(courseId, chapterId, false);
