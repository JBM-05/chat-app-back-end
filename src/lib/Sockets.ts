import {Server} from 'socket.io';
import http from 'http';
import express from 'express';

export const app = express();
export const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: process.env.base_Url,
    credentials: true,
  },
});
const UserSocketMap: Record<string, string> = {};
export function getReceiverSocketId(userId: string): string | undefined {
  return UserSocketMap[userId];
}
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  const userId = socket.handshake.query.userId;

  if (userId) UserSocketMap[userId as string] = socket.id;
    io.emit("getOnlineUsers", Object.keys(UserSocketMap));

  socket.on('disconnect', () => {
    delete UserSocketMap[userId as string];
    io.emit('getOnlineUsers', Object.keys(UserSocketMap));
    console.log('User disconnected:', socket.id);
    
  });


});