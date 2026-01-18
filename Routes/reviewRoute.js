import express from "express";
import { protect, authorizeRoles } from "../Middleware/authMiddleware.js";
import {
  addReview,
  getMyReviews,
  getAllReviews,
  approveReview,
  deleteReview,
  getAllApprovedReviews,
} from "../Controllers/reviewController.js";

const router = express.Router();

router.get("/approved", getAllApprovedReviews);

router.post("/", protect, authorizeRoles("user"), addReview);
router.get("/my", protect, authorizeRoles("user"), getMyReviews);

router.get("/", protect, authorizeRoles("admin"), getAllReviews);
router.put("/approve/:id", protect, authorizeRoles("admin"), approveReview);
router.delete("/:id", protect, authorizeRoles("admin"), deleteReview);

export default router;
