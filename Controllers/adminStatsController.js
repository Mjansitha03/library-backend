import Book from "../Models/bookSchema.js";
import Borrow from "../Models/borrowSchema.js";
import Reservation from "../Models/reservationSchema.js";

// Admin Overview Stats 
export const getAdminStats = async (req, res) => {
  try {
    // Total books
    const books = await Book.countDocuments();

    // Active users = users who currently borrowed books
    const activeUsers = await Borrow.distinct("user", {
      status: "borrowed",
    });

    // Active borrows
    const activeBorrows = await Borrow.countDocuments({
      status: "borrowed",
    });

    // Overdue borrows
    const overdue = await Borrow.countDocuments({
      status: "borrowed",
      dueDate: { $lt: new Date() },
    });

    // Active reservations (exclude completed / expired if needed)
    const reservations = await Reservation.countDocuments({
      status: { $in: ["pending", "notified", "in-progress"] },
    });

    res.json({
      books,
      users: activeUsers.length, 
      activeBorrows,
      overdue,
      reservations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
