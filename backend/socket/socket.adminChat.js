
export const registerAdminChatSocket = (io, socket) => {
  socket.on("joinAdminChat", ({ courseId, userId }) => {
    if (!courseId || !userId) return;
    const room = `adminChat_${courseId}_${userId}`;
    socket.join(room);
    console.log(`[AdminChat] Socket ${socket.id} joined room: ${room}`);
  });

  socket.on("leaveAdminChat", ({ courseId, userId }) => {
    if (!courseId || !userId) return;
    const room = `adminChat_${courseId}_${userId}`;
    socket.leave(room);
  });

  socket.on("joinAdminDashboard", () => {
    socket.join("adminDashboard");
    console.log(`[AdminChat] Admin socket ${socket.id} joined adminDashboard`);
  });

  socket.on("leaveAdminDashboard", () => {
    socket.leave("adminDashboard");
  });
};
