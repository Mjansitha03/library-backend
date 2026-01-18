import User from "../Models/userSchema.js";
import Borrow from "../Models/borrowSchema.js";
import Reservation from "../Models/reservationSchema.js";
import Payment from "../Models/paymentSchema.js";
import mongoose from "mongoose";

// Get All Users (ADMIN) With Activity
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();

    const borrows = await Borrow.aggregate([
      {
        $group: {
          _id: "$user",
          borrowed: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$returned", false] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$returned", false] },
                    { $lt: ["$dueDate", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const reservations = await Reservation.aggregate([
      {
        $group: {
          _id: "$user",
          reservations: { $sum: 1 },
        },
      },
    ]);

    const payments = await Payment.aggregate([
      {
        $match: { status: "pending" },
      },
      {
        $group: {
          _id: "$user",
          overduePayments: { $sum: 1 },
        },
      },
    ]);

    const activityMap = {};

    borrows.forEach((b) => {
      activityMap[b._id.toString()] = {
        borrowed: b.borrowed,
        active: b.active,
        overdue: b.overdue,
        reservations: 0,
      };
    });

    reservations.forEach((r) => {
      const userId = r._id.toString();
      if (activityMap[userId]) {
        activityMap[userId].reservations = r.reservations;
      } else {
        activityMap[userId] = {
          borrowed: 0,
          active: 0,
          overdue: 0,
          reservations: r.reservations,
        };
      }
    });

    payments.forEach((p) => {
      const userId = p._id.toString();
      if (activityMap[userId]) {
        activityMap[userId].overdue += p.overduePayments;
      } else {
        activityMap[userId] = {
          borrowed: 0,
          active: 0,
          overdue: p.overduePayments,
          reservations: 0,
        };
      }
    });

    const usersWithActivity = users.map((u) => ({
      ...u,
      activity: activityMap[u._id.toString()] || {
        borrowed: 0,
        active: 0,
        overdue: 0,
        reservations: 0,
      },
      phone: u.phone,
    }));

    res.json(usersWithActivity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update User Role
export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!["user", "librarian", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.json({ message: "Role updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
