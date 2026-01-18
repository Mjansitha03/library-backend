import express from "express";
import { getAdminStats } from "../Controllers/adminStatsController.js";
import { getAdminAnalytics } from "../Controllers/adminAnalyticsController.js";
import { getRecentActivity } from "../Controllers/adminActivityController.js";
import { protect, authorizeRoles } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, authorizeRoles("admin"), getAdminStats);
router.get("/analytics", protect, authorizeRoles("admin"), getAdminAnalytics);
router.get("/recent-activity", protect, authorizeRoles("admin"), getRecentActivity);

export default router;
