import express from "express";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../Controllers/userAdminController.js";

import { authorizeRoles, protect,  } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorizeRoles("admin", "librarian"), getAllUsers);
router.put("/:id/role", protect, authorizeRoles("admin"), updateUserRole);
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

export default router;
