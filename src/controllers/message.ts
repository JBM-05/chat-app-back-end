import { Request, Response } from "express";
import User from "../models/user.js";
import Message from "../models/message.js";
import cloudinary from "../Config/cloudinary.js";
import { getReceiverSocketId } from "../lib/Sockets.js";
import { io } from "../lib/Sockets.js";
export const getAllUsers = async (req: Request, res: Response) => {
  const user = req.user;
  try {
    const users = await User.find({ _id: { $ne: user._id } });
    return res.status(200).json({
      message: "Users fetched successfully",
      users: users.map((u) => ({
        name: u.name,
        email: u.email,
        _id: u._id,
        profilePic: u.profilePic,
      })),
    });
  } catch (e) {
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });
    return res.status(200).json({
      message: "Messages fetched successfully",
      messages: messages,
    });
  } catch (e) {
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const { text, image } = req.body;
    let imageUrl = "";
    let textContent = text || "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: textContent,
      image: imageUrl,
    });
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    return res.status(200).json({
      message: "Message sent successfully",
      newMessage,
    });
  } catch (e) {
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
