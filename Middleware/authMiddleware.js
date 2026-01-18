import jwt from "jsonwebtoken";
import User from "../Models/userSchema.js";

/* ======================
   AUTH PROTECT MIDDLEWARE
====================== */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({ message: "No token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    console.log("AUTH USER:", user._id, user.role); // ✅ DEBUG

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ======================
   ROLE AUTHORIZATION
====================== */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = req.user.role.toLowerCase().trim(); // normalize

    const allowedRoles = roles.map((r) => r.toLowerCase().trim()); // normalize allowed roles

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied for role: ${req.user.role}`,
      });
    }

    next();
  };
};
