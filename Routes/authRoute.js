import express from "express";
import { forgotPassword, resetPassword, signin, signup, verifyResetToken } from "../Controllers/authController.js";


const router = express.Router();

router.post("/sign-up", signup);
router.post("/sign-in", signin);
router.post("/forgot-password", forgotPassword);
router.get("/verify-reset/:id/:token", verifyResetToken);
router.post("/reset-password/:id/:token", resetPassword);

export default router;


