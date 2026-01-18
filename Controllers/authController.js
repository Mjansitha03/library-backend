import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../Utils/mailer.js";
import User from "../Models/userSchema.js";

dotenv.config();

// User Registration
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashed, phone });

    res.status(201).json({
      message: "User registered successfully",
      data: { id: user._id, name, email, phone },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User Login
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "365d",
      },
    );
    user.token = token;
    await user.save();
    res.json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const RESET_EXPIRY_MINUTES = 2;

// Forgot Password: create and email reset link
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + RESET_EXPIRY_MINUTES * 60000);
    await user.save();

    const url = `http://localhost:5173/reset-password/${user._id}/${resetToken}`;
    await sendEmail(
      email,
      "Password Reset",
      `You are receiving this email because you have requested to reset your password.
      Please click the following link to reset your password:\n\n${url}`,
    );

    res.json({
      message: "Reset link generated successfully",
      expiresInSeconds: RESET_EXPIRY_MINUTES * 60,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Verify if reset token is valid and not expired
export const verifyResetToken = async (req, res) => {
  try {
    const { id, token } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.resetToken !== token)
      return res.status(401).json({ message: "Invalid token" });
    const remaining = user.resetTokenExpiry - Date.now();
    if (remaining <= 0)
      return res.status(410).json({ message: "Reset link expired" });
    res.json({
      message: "Token valid",
      expiresInSeconds: Math.ceil(remaining / 1000),
    });
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Reset password action after token is verified
export const resetPassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.resetToken !== token)
      return res.status(401).json({ message: "Invalid token" });
    if (user.resetTokenExpiry < Date.now())
      return res.status(410).json({ message: "Link expired" });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
