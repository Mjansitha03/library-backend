import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    borrow: { type: mongoose.Schema.Types.ObjectId, ref: "Borrow" }, 
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    purpose: { type: String, default: "FINE" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Payment", paymentSchema);
