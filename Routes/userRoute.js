import express from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import { getDashboard } from "../Controllers/userController.js";

const router = express.Router();
router.get("/dashboard", protect, getDashboard);
export default router;
