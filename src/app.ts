import dotenv from "dotenv";
dotenv.config();
import express from "express";
import authRoutes from "./routes/auth.js";
import connectDB from "./lib/db.js";
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/message.js";
import cors from "cors";
import { server,app ,io } from "./lib/Sockets.js";
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
const PORT = process.env.Port;
connectDB();

app.use("/auth", authRoutes);
app.use("/message",messageRoutes );
server.listen(PORT, () => {
  console.log("server is running on port " + PORT);
});
