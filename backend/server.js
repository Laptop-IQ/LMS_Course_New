import express from "express";
import cors from "cors";
import "dotenv/config";

import http from "http";
import { Server } from "socket.io";

import connectDB from "./database/db.js";

/* ROUTES */
import ratingRoutes from "./routes/ratingRoutes.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import courseRouter from "./routes/courseRouter.js";
import bookingRouter from "./routes/bookingRouter.js";
import progressRoutes from "./routes/progressRoutes.js";
import courseViewRoutes from "./routes/courseView.routes.js";
import commentRoutes from "./routes/commentRoutes.js";
import adminCommentRoutes from "./routes/adminCommentRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import AdminNotificationRoutes from "./routes/adminNoticationRoutes.js";
import adminProfileRoute from "./routes/adminProfileRoute.js";
import adminChatRoutes from "./routes/adminChat.routes.js";
import adminAuthRoutes from "./routes/adminAuth.routes.js";
import analyticsRouter from "./routes/analyticsRoutes.js";
import studyLogRoutes from "./routes/studyLogRoutes.js";
 import contactRoutes from "./routes/contactRoute.js";
import { registerAdminChatSocket } from "./socket/socket.adminChat.js";

const app = express();
const PORT = process.env.PORT || 3000;

/* =======================================================
   HTTP SERVER
======================================================= */
const server = http.createServer(app);

/* =======================================================
   CORS
======================================================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
].filter(Boolean);

/* =======================================================
   MIDDLEWARES
======================================================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use("/uploads", express.static("uploads"));

/* =======================================================
   SOCKET.IO
======================================================= */
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
  transports: ["websocket", "polling"],
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("✅ User Connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`✅ Joined user room: ${userId}`);
  });
  socket.on("joinRole", (role) => {
    socket.join(`role:${role}`);
    console.log(`🛡️ Joined role room: role:${role}`);
  });
  socket.on("joinCourse", (id) => {
    socket.join(id);
    console.log(`📘 Joined course room: ${id}`);
  });
  socket.on("leaveCourse", (id) => {
    socket.leave(id);
    console.log(`❌ Left course room: ${id}`);
  });

  socket.on("joinPrivateRoom", ({ userId, otherUserId, courseId }) => {
    const roomId = [userId, otherUserId].sort().join("-") + "-" + courseId;
    socket.join(roomId);
    console.log(`💬 Joined private chat room: ${roomId}`);
  });

  socket.on("leavePrivateRoom", ({ userId, otherUserId, courseId }) => {
    const roomId = [userId, otherUserId].sort().join("-") + "-" + courseId;
    socket.leave(roomId);
    console.log(`🚪 Left private chat room: ${roomId}`);
  });

  registerAdminChatSocket(io, socket);

  socket.on("disconnect", () =>
    console.log("❌ User Disconnected:", socket.id),
  );
});

/* =======================================================
   HEALTH CHECK
======================================================= */
app.get("/", (_, res) => res.send("🚀 API running..."));

/* =======================================================
   ROUTES
======================================================= */
app.use("/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/course", courseRouter);
app.use("/api/course", courseViewRoutes);
app.use("/api/booking", bookingRouter);
app.use("/api/ratings", ratingRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/comments", adminCommentRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/adminnotifications", AdminNotificationRoutes);
app.use("/api/admin/profile", adminProfileRoute);
app.use("/api/admin-chat", adminChatRoutes);
app.use("/api/analytics", analyticsRouter);
app.use("/api/study-log", studyLogRoutes);
app.use("/api/contact", contactRoutes); 

/* =======================================================
   GLOBAL ERROR HANDLER
======================================================= */
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* =======================================================
   START SERVER
======================================================= */
connectDB()
  .then(() =>
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)),
  )
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

server.on("error", (err) => console.error("🔥 SERVER CRASH:", err));
process.on("unhandledRejection", (reason) =>
  console.error("🔥 Unhandled Rejection:", reason),
);
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
  process.exit(1);
});
