import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: String,
    publicationYear: Number,
    isbn: { type: String, required: true, unique: true },
    image: String,

    totalCopies: Number,
    availableCopies: Number,

    availabilityStatus: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },

    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isSeedData: { type: Boolean, default: false },

    createdAt: Date,
    updatedAt: Date,
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

export default mongoose.model("Book", bookSchema);
