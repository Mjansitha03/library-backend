import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    status: {
      type: String,
      enum: ["pending", "notified", "in-progress", "completed", "expired"],
      default: "pending"
    },
    expiresAt: Date,
    isSeedData: { type: Boolean, default: false },

    createdAt: Date,
    updatedAt: Date
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
  }
);

export default mongoose.model("Reservation", reservationSchema);
