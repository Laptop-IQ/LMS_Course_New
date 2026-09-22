import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

io.on("connection", (socket) => {
  console.log("✅ User Connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("joinRole", (role) => {
    socket.join(`role:${role}`);
    console.log(`✅ Joined role room: role:${role}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};
