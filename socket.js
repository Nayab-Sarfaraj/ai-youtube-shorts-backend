import { Server } from "socket.io";
let io;
export const socketIOMap = {};

export const initiateSocket = (server) => {
  io = new Server(server);
  io.on("connect", (socket) => {
    console.log(`USER JOINED ${socket.id}`);
    socket.on("save-info", ({ userId }) => {
      console.log(userId);
      socketIOMap[userId] = socket.id;
      console.log(socketIOMap[userId]);
      console.log(`Saved userId ${userId} with socket id ${socket.id}`);
    });
    socket.on("disconnect", () => {
      console.log(`USER LEFT ${socket.id}`);
    });
  });
};

export const getIO = () => {
  if (!io) return console.log("Not connected");
  return io;
};
