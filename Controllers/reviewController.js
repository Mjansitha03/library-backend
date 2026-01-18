import Review from "../Models/reviewSchema.js";
import Book from "../Models/bookSchema.js";

// Update book stats
const updateBookStats = async (bookId) => {
  const stats = await Review.aggregate([
    { $match: { book: bookId, isApproved: true } },
    {
      $group: {
        _id: "$book",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      averageRating: stats[0].avg,
      reviewCount: stats[0].count,
    });
  } else {
    await Book.findByIdAndUpdate(bookId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
};

// Add review
export const addReview = async (req, res) => {
  try {
    const review = await Review.create({
      ...req.body,
      user: req.user._id,
      isApproved: false,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Failed to add review", error });
  }
};

// Get my reviews
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate("book", "title author")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your reviews", error });
  }
};

// Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name")
      .populate("book", "title author")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error });
  }
};

// Approve review
export const approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await updateBookStats(review.book);

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: "Failed to approve review", error });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await Review.findByIdAndDelete(req.params.id);
    await updateBookStats(review.book);

    res.json({ message: "Review removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review", error });
  }
};

// Get approved reviews
export const getAllApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .populate("user", "name")
      .populate("book", "title author")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch approved reviews", error });
  }
};
