import { useEffect, useRef, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE;

// ─────────────────────────────────────────────────────────────────────────────
// useWatchTracker
// Attach to any <video> element ref.
// Sends minutesStudied to /api/study-log on:
//   1. pause
//   2. video ended
//   3. every HEARTBEAT_SEC seconds while playing
//   4. page unload (sendBeacon)
//
// Usage:
//   const videoRef = useRef(null);
//   useWatchTracker(videoRef, { courseId, lessonId, token });
// ─────────────────────────────────────────────────────────────────────────────

const HEARTBEAT_SEC = 30; // flush every 30 seconds while playing

const useWatchTracker = (videoRef, { courseId, lessonId, token }) => {
  // Tracks seconds watched since last flush
  const accSecs = useRef(0);
  const lastTick = useRef(null);
  const timer = useRef(null);

  // ── Core flush function ──────────────────────────────────────────────────
  const flush = useCallback(
    async (reason = "manual") => {
      const secs = Math.round(accSecs.current);
      if (secs <= 0 || !courseId) return;

      accSecs.current = 0; // reset accumulator before async to avoid double-send

      const body = JSON.stringify({
        courseId,
        lessonId: lessonId || undefined,
        minutesStudied: Math.floor(secs / 60),
        secondsStudied: secs % 60,
      });

      try {
        await fetch(`${API_BASE}/api/study-log`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body,
        });
        console.debug(`[WatchTracker] flushed ${secs}s (${reason})`);
      } catch (e) {
        // Put seconds back so they're not lost on a network blip
        accSecs.current += secs;
        console.warn("[WatchTracker] flush failed, will retry", e);
      }
    },
    [courseId, lessonId, token],
  );

  // ── Beacon flush (page close) ────────────────────────────────────────────
  const beaconFlush = useCallback(() => {
    const secs = Math.round(accSecs.current);
    if (secs <= 0 || !courseId) return;
    const body = JSON.stringify({
      courseId,
      lessonId: lessonId || undefined,
      minutesStudied: Math.floor(secs / 60),
      secondsStudied: secs % 60,
    });
    navigator.sendBeacon(
      `${API_BASE}/api/study-log`,
      new Blob([body], { type: "application/json" }),
    );
  }, [courseId, lessonId]);

  // ── Tick: accumulate playing seconds ────────────────────────────────────
  const tick = useCallback(() => {
    if (lastTick.current) {
      const delta = (Date.now() - lastTick.current) / 1000;
      accSecs.current += Math.min(delta, HEARTBEAT_SEC + 2); // cap to avoid drift
    }
    lastTick.current = Date.now();
  }, []);

  // ── Start / stop heartbeat ───────────────────────────────────────────────
  const startHeartbeat = useCallback(() => {
    if (timer.current) return;
    lastTick.current = Date.now();
    timer.current = setInterval(async () => {
      tick();
      if (accSecs.current >= HEARTBEAT_SEC) await flush("heartbeat");
    }, HEARTBEAT_SEC * 1000);
  }, [tick, flush]);

  const stopHeartbeat = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    lastTick.current = null;
  }, []);

  // ── Attach video event listeners ─────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => startHeartbeat();

    const onPause = async () => {
      tick();
      stopHeartbeat();
      await flush("pause");
    };

    const onEnded = async () => {
      tick();
      stopHeartbeat();
      await flush("ended");
    };

    const onSeeked = () => {
      // Reset tick reference after seek to avoid counting jump
      lastTick.current = Date.now();
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("seeked", onSeeked);
    window.addEventListener("beforeunload", beaconFlush);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("seeked", onSeeked);
      window.removeEventListener("beforeunload", beaconFlush);
      stopHeartbeat();
      flush("unmount"); // best-effort flush on component unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoRef, courseId, lessonId, token]);
};

export default useWatchTracker;
