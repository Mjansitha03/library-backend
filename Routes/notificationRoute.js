import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
} from "../Controllers/notificationController.js";

const router = express.Router();

router.get("/", protect, getNotifications);

router.put("/:id", protect, markNotificationRead);

router.patch("/mark-all-read", protect, markAllNotificationsRead);

router.delete("/clear", protect, clearAllNotifications);

export default router;
