import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Invalid phone number"],
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "librarian", "admin"],
      default: "user",
    },

    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },

    activity: {
      borrowed: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      overdue: { type: Number, default: 0 },
    },

    isSeedData: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
