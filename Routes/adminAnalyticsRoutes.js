import express from "express";
import { protect, authorizeRoles } from "../Middleware/authMiddleware.js";
import { getAdminAnalytics } from "../Controllers/adminAnalyticsController.js";

const router = express.Router();

router.get("/", protect, authorizeRoles("admin"), getAdminAnalytics);

export default router;
