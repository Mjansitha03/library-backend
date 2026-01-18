import express from "express";
import {
  requestBorrow,
  requestReturn,
  getBorrowRequests,
  approveBorrowRequest,
  approveReturnRequest,
  getMyBorrowRequests,
  rejectRequest,
} from "../Controllers/borrowRequestController.js";
import { protect, authorizeRoles } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/borrow", protect, authorizeRoles("user"), requestBorrow);
router.post("/return", protect, authorizeRoles("user"), requestReturn);
router.get("/my-borrow-requests", protect, authorizeRoles("user"), getMyBorrowRequests);


router.get(
  "/",
  protect,
  authorizeRoles("admin", "librarian"),
  getBorrowRequests
);
router.put(
  "/approve-borrow/:id",
  protect,
  authorizeRoles("admin", "librarian"),
  approveBorrowRequest
);
router.put(
  "/approve-return/:id",
  protect,
  authorizeRoles("admin", "librarian"),
  approveReturnRequest
);
router.put(
  "/reject/:id",
  protect,
  authorizeRoles("admin", "librarian"),
  rejectRequest
);

export default router;
