import Borrow from "../Models/borrowSchema.js";
import Review from "../Models/reviewSchema.js";
import Reservation from "../Models/reservationSchema.js";

export const getRecentActivity = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const now = new Date();

    // Borrows & Returns
    const borrows = await Borrow.find()
      .sort({ updatedAt: -1 })
      .populate("user", "name")
      .populate("book", "title");

    // Reviews
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate("user", "name")
      .populate("book", "title");

   // Reservation
    const reservations = await Reservation.find()
      .sort({ updatedAt: -1 })
      .populate("user", "name")
      .populate("book", "title");

    // Map Activities
    const borrowActivities = borrows.map((b) => {
      const isOverdue = b.status === "borrowed" && b.dueDate && b.dueDate < now;

      return {
        type: isOverdue
          ? "Overdue"
          : b.status === "borrowed"
            ? "Borrowed"
            : "Returned",
        user: b.user?.name || "Unknown",
        book: b.book?.title || "Unknown",
        date: b.updatedAt,
      };
    });

    const reviewActivities = reviews.map((r) => ({
      type: "Review",
      user: r.user?.name || "Unknown",
      book: r.book?.title || "Unknown",
      date: r.createdAt,
    }));

    const reservationActivities = reservations.map((r) => ({
      type: "Reservation",
      user: r.user?.name || "Unknown",
      book: r.book?.title || "Unknown",
      date: r.updatedAt,
    }));

    const combined = [
      ...borrowActivities,
      ...reviewActivities,
      ...reservationActivities,
    ].sort((a, b) => b.date - a.date);

    const total = combined.length;
    const paginated = combined.slice((page - 1) * limit, page * limit);

    res.json({
      activities: paginated,
      total,
    });
  } catch (error) {
    console.error("Recent activity error:", error);
    res.status(500).json({ message: error.message });
  }
};
