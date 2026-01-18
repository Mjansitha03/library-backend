import mongoose from "mongoose";

const borrowSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },

    borrowDate: Date,
    dueDate: Date,
    returnDate: Date,

    lateFee: { type: Number, default: 0 },
    status: { type: String, enum: ["borrowed", "pending-return", "returned"], default: "borrowed" },

    isSeedData: { type: Boolean, default: false },
    createdAt: Date,
    updatedAt: Date
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
  }
);

export default mongoose.model("Borrow", borrowSchema);
