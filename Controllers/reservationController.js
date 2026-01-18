import Reservation from "../Models/reservationSchema.js";
import Book from "../Models/bookSchema.js";

//Reserve Book
export const reserveBook = async (req, res) => {
  const { bookId } = req.params;

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const existing = await Reservation.findOne({
      user: req.user._id,
      book: bookId,
      status: { $in: ["pending", "notified", "in-progress"] },
    });

    if (existing) {
      return res.status(400).json({
        message: "You have already reserved this book",
      });
    }

    const activeReservationsCount = await Reservation.countDocuments({
      book: bookId,
      status: { $in: ["notified", "in-progress"] },
    });

    const reservationData = {
      user: req.user._id,
      book: bookId,
      status: "pending",
    };

    if (book.availableCopies > activeReservationsCount) {
      reservationData.status = "notified";
      reservationData.expiresAt = new Date(Date.now() + 3 * 60 * 1000);
    }

    const reservation = await Reservation.create(reservationData);

    res.status(201).json({
      message:
        reservation.status === "notified"
          ? "Book is available! Borrow now"
          : "Book reserved successfully",
      reservation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get My Reservations
export const getMyReservations = async (req, res) => {
  const reservations = await Reservation.find({ user: req.user._id })
    .populate("book", "title image")
    .sort({ createdAt: -1 });

  const formatted = reservations.map((r) => ({
    _id: r._id,
    status: r.status,
    book: r.book,
    expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
    createdAt: r.createdAt,
  }));

  res.json(formatted);
};

//Get All Reservations
export const getReservations = async (req, res) => {
  const reservations = await Reservation.find()
    .populate("user", "name email")
    .populate("book", "title")
    .sort({ createdAt: -1 });

  res.json(reservations);
};

// Notify Next User (FIFO)
export const notifyNextReservedUser = async (bookId) => {
  const book = await Book.findById(bookId);
  if (!book || book.availableCopies <= 0) return null;

  const next = await Reservation.findOne({
    book: bookId,
    status: "pending",
  }).sort({ createdAt: 1 });

  if (!next) return null;

  next.status = "notified";
  next.expiresAt = new Date(Date.now() + 3 * 60 * 1000);
  await next.save();

  return next;
};

// CRON: expire reservations
setInterval(async () => {
  const expiredReservations = await Reservation.find({
    status: "notified",
    expiresAt: { $lt: new Date() },
  });

  for (const r of expiredReservations) {
    r.status = "expired";
    await r.save();
    await notifyNextReservedUser(r.book);
  }
}, 30 * 1000);
