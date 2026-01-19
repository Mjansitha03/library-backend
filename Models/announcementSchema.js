import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isSeedData: { type: Boolean, default: false },

    createdAt: Date,
    updatedAt: Date,
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

export default mongoose.model("Announcement", announcementSchema);
