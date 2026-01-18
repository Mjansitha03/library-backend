import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
} from "../Controllers/paymentController.js";
import { protect } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", protect, createPaymentOrder);
router.post("/verify", protect, verifyPayment);
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

export default router;
