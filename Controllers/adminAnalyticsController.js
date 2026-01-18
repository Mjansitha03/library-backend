import Book from "../Models/bookSchema.js";
import Borrow from "../Models/borrowSchema.js";
import Review from "../Models/reviewSchema.js";
import User from "../Models/userSchema.js";

// Admin Analytics 
export const getAdminAnalytics = async (req, res) => {
  try {
    //Book Utilization 
    const bookStats = await Book.aggregate([
      {
        $group: {
          _id: null,
          totalCopies: { $sum: "$totalCopies" },
          availableCopies: { $sum: "$availableCopies" },
        },
      },
    ]);

    const totalCopies = bookStats[0]?.totalCopies || 0;
    const availableCopies = bookStats[0]?.availableCopies || 0;
    const borrowedCopies = totalCopies - availableCopies;

    const utilizationRate = totalCopies
      ? Number(((borrowedCopies / totalCopies) * 100).toFixed(1))
      : 0;

    // Transactions
    const totalTransactions = await Borrow.countDocuments();
    const totalMembers = await User.countDocuments({ role: "user" });

    const lateFeesAgg = await Borrow.aggregate([
      { $group: { _id: null, total: { $sum: "$lateFee" } } },
    ]);
    const lateFees = lateFeesAgg[0]?.total || 0;

    // Genre Distribution
    const collectionByGenre = await Book.aggregate([
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    //Popular Books
    const popularBooks = await Borrow.aggregate([
      { $group: { _id: "$book", borrowCount: { $sum: 1 } } },
      { $sort: { borrowCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: "$book" },
      {
        $project: {
          title: "$book.title",
          author: "$book.author",
          borrowCount: 1,
        },
      },
    ]);

    /* ---------- BORROW TREND (7 MONTHS) ---------- */
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    const borrowingTrend = await Borrow.aggregate([
      { $match: { borrowDate: { $gte: startDate } } },
      {
        $group: {
          _id: { $month: "$borrowDate" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    /* ---------- RATINGS ---------- */
    const avgRatingAgg = await Review.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);

    const averageRating = avgRatingAgg[0]?.avg
      ? Number(avgRatingAgg[0].avg.toFixed(1))
      : 0;

    const returned = await Borrow.countDocuments({ status: "returned" });
    const returnRate = totalTransactions
      ? Number(((returned / totalTransactions) * 100).toFixed(1))
      : 0;

    const totalReviews = await Review.countDocuments();

    res.json({
      topStats: {
        utilizationRate,
        totalTransactions,
        totalMembers,
        lateFees,
      },
      collectionByGenre,
      popularBooks,
      borrowingTrend,
      bottomStats: {
        averageRating,
        returnRate,
        totalReviews,
      },
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    res.status(500).json({ message: "Failed to load analytics" });
  }
};
