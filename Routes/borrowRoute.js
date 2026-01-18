import express from "express";
import { protect, authorizeRoles } from "../Middleware/authMiddleware.js";
import {
  getMyBorrows,
  getBorrowHistory,
  getMyBorrowedBooks,
  checkoutBook,
  getAllBorrows,
} from "../Controllers/borrowController.js";

const router = express.Router();

router.get("/", protect, authorizeRoles("admin", "librarian"), getAllBorrows);
router.post("/checkout", protect, authorizeRoles("admin", "librarian"), checkoutBook);

router.get("/my", protect, authorizeRoles("user"), getMyBorrows);
router.get("/my-borrowed-books", protect, authorizeRoles("user"), getMyBorrowedBooks);
router.get("/history", protect, authorizeRoles("user"), getBorrowHistory);

export default router;
