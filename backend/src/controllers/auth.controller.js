import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // If the client uploaded a picture, it will be provided as a URL string in the body
    const profilepic = req.body.profilepic || req.body.profilePic || "";

    // Create new user
    const newUser = await User.create({
      email,
      fullName,
      password: hashedPassword,
      profilepic
    });

    // Generate token and set cookie
    generateToken(newUser._id, res);

    // Return user data without password
    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      fullName: newUser.fullName,
      profilepic: newUser.profilepic
    });
  } catch (error) {
    console.error("Error in signup:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      profilepic: user.profilepic
    });
  } catch (error) {
    console.error("Error in login:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, email } = req.body;

    // Build update object
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
      updateData.email = email;
    }

    const { profilepic, profilePic } = req.body;
    const providedPic = profilepic || profilePic;
    if (providedPic) {
      updateData.profilepic = providedPic;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const token = req.cookies?.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in checkAuth:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
