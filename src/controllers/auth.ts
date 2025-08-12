import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { generateToken } from "../lib/util.js";
import cloudinary from "../Config/cloudinary.js";
import multer from "multer";
import fs from "fs";
export const signin = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      email,
      name,
      password: hashedPassword,
    });
    if (newUser) {
      generateToken(newUser._id.toString(), res);

      await newUser.save();
      return res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    }
  } catch (e) {
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    generateToken(user._id.toString(), res);
    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const logout = async (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logout successful" });
  } catch (e) {
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const upload = multer({ dest: "uploads/" }); // temp local folder

export const updateProfile = [
  upload.single("profilePic"), // matches formData.append("profilePic", file)
  async (req: any, res: Response) => {
    try {
      const user = req.user;
      if (!req.file) {
        return res.status(400).json({ message: "Please provide a profile picture" });
      }

      // Upload to Cloudinary using the file path
      const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
        folder: "profile_pics", // optional
      });

      // Remove local temp file after upload
      fs.unlinkSync(req.file.path);

      // Update user in DB
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { profilePic: uploadResponse.secure_url },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        message: "Profile updated successfully",
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          profilePic: updatedUser.profilePic,
        },
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: e instanceof Error ? e.message : "Internal Server Error" });
    }
  },
];
export const checkAuth = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    return res.status(200).json({
      message: "User authenticated",
      user,
    });
  } catch (e) {
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
