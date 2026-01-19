import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    isApproved: { type: Boolean, default: false },
    isSeedData: { type: Boolean, default: false },

    createdAt: Date,
    updatedAt: Date,
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

export default mongoose.model("Review", reviewSchema);
