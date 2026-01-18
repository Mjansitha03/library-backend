import express from "express";
import { protect, authorizeRoles } from "../Middleware/authMiddleware.js";
import {
  getAllBooks,
  addBook,
  updateBook,
  deleteBook,
} from "../Controllers/bookController.js";

const router = express.Router();

router.get("/", protect, getAllBooks);

router.post("/", protect, authorizeRoles("admin", "librarian"), addBook);
router.put("/:id", protect, authorizeRoles("admin", "librarian"), updateBook);
router.delete("/:id", protect, authorizeRoles("admin"), deleteBook);

export default router;
