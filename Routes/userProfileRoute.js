import express from "express";
import {
  getMyProfile,
  updateMyProfile,
} from "../Controllers/userProfileController.js";
import { protect } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

export default router;
