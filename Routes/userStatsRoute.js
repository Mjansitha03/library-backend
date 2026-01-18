import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import { getUserStats } from "../Controllers/userStatsController.js";

const router = express.Router();

router.get("/me", protect, getUserStats);

export default router;
