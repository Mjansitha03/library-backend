import express from "express";
import { protect, authorizeRoles } from "../Middleware/authMiddleware.js";
import {
  reserveBook,
  getReservations,
  getMyReservations,
} from "../Controllers/reservationController.js";

const router = express.Router();

router.post("/:bookId", protect, authorizeRoles("user"), reserveBook);
router.get("/my", protect, authorizeRoles("user"), getMyReservations);

router.get("/", protect, authorizeRoles("admin", "librarian"), getReservations);

export default router;
