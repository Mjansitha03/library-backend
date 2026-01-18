import Borrow from "../Models/borrowSchema.js";
import BorrowRequest from "../Models/borrowRequestSchema.js";
import Reservation from "../Models/reservationSchema.js";
import Review from "../Models/reviewSchema.js";

// Get user stats
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      activeBorrows,
      borrowRequests,
      reservations,
      overdues,
      reviews,
      returnedBooks,
    ] = await Promise.all([
      Borrow.countDocuments({ user: userId, status: "borrowed" }),
      BorrowRequest.countDocuments({ user: userId, status: "pending" }),
      Reservation.countDocuments({ user: userId }),
      Borrow.countDocuments({
        user: userId,
        status: "borrowed",
        dueDate: { $lt: new Date() },
      }),
      Review.countDocuments({ user: userId }),
      Borrow.countDocuments({ user: userId, status: "returned" }),
    ]);

    res.json({
      activeBorrows,
      borrowRequests,
      reservations,
      overdues,
      reviews,
      returnedBooks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
