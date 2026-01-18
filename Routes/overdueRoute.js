import express from "express";
import { protect, authorizeRoles } from "../Middleware/authMiddleware.js";
import { getOverdue } from "../Controllers/overdueController.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorizeRoles("admin", "librarian"),
  getOverdue
);

export default router;
