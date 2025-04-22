import { Server } from "socket.io";
import http from "http";
import express from "express";


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});


const userSocketMap: Record<string, string> = {}; 


export const getReceiverSocketId = (receiverId: string) => {
  return userSocketMap[receiverId];
};


io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {

    userSocketMap[userId as string] = socket.id;
    console.log(`User ${userId} connected with socket id ${socket.id}`);
  } else {

    console.warn("UserId is undefined or missing in handshake.");
    socket.emit("error", { message: "UserId is required in the handshake" });
    socket.disconnect(); // Optionally disconnect the user if `userId` is not valid
  }

  // Emit the list of online users (all userIds)
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId as string];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
