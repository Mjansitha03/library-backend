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
      match: [/^[6-9]\d{9}$/, "Invalid phone number"], // Indian format
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

    activity: {
      borrowed: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      overdue: { type: Number, default: 0 },
    },

    isSeedData: {
      type: Boolean,
      default: false,
    },

    createdAt: Date,
    updatedAt: Date,
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

export default mongoose.model("User", userSchema);
