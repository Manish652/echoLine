import { Server } from 'socket.io';

// Store user socket mappings
const userSocketMap = new Map();

export const getReceiverSocketId = (receiverId) => userSocketMap.get(receiverId);

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true
    }
  });

  // Socket connection handling
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("setup", (userId) => {
      userSocketMap.set(userId, socket.id);
      socket.userId = userId;
      io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
      console.log(`User ${userId} setup complete`);
    });

    // Join group room
    socket.on("joinGroup", (groupId) => {
      socket.join(`group_${groupId}`);
      console.log(`User ${socket.userId} joined group ${groupId}`);
    });

    // Leave group room
    socket.on("leaveGroup", (groupId) => {
      socket.leave(`group_${groupId}`);
      console.log(`User ${socket.userId} left group ${groupId}`);
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        userSocketMap.delete(socket.userId);
        io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });

  return io;
};
