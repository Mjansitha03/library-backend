import express from "express";
import { protect, authorizeRoles } from "../Middleware/authMiddleware.js";
import {
  createAnnouncement,
  getAllAnnouncements,
  deleteAnnouncement,
} from "../Controllers/announcementController.js";

const router = express.Router();

router.get("/", protect, getAllAnnouncements);

router.post("/", protect, authorizeRoles("admin", "librarian"), createAnnouncement);
router.delete("/:id", protect, authorizeRoles("admin", "librarian"), deleteAnnouncement);

export default router;
