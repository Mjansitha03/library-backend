import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    type: { type: String },
    title: String,
    message: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isRead: { type: Boolean, default: false },
    isSeedData: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

notificationSchema.index(
  { user: 1, referenceId: 1, type: 1 },
  { unique: true },
);

export default mongoose.model("Notification", notificationSchema);
