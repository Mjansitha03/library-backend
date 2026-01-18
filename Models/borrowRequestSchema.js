import mongoose from "mongoose";

const borrowRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },

    type: { type: String, enum: ["borrow", "return"], required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending"
    },

    borrowRef: { type: mongoose.Schema.Types.ObjectId, ref: "Borrow" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    returnedAt: Date,

    isSeedData: { type: Boolean, default: false },
    createdAt: Date,
    updatedAt: Date
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
  }
);

export default mongoose.model("BorrowRequest", borrowRequestSchema);
