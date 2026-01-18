// import Borrow from "../Models/borrowSchema.js";
// import Book from "../Models/bookSchema.js";
// import BorrowRequest from "../Models/borrowRequestSchema.js";
// import Reservation from "../Models/reservationSchema.js";

// const BORROW_DAYS = 7;
// const MAX_ACTIVE_BORROWS = 3;
// const FINE_PER_DAY = 5;

// export const getMyBorrows = async (req, res) => {
//   const borrows = await Borrow.find({
//     user: req.user._id,
//     status: { $in: ["borrowed", "pending-return"] },
//   }).populate("book", "title author image");

//   res.json(borrows);
// };

// export const getBorrowHistory = async (req, res) => {
//   const history = await Borrow.find({
//     user: req.user._id,
//     status: "returned",
//   })
//     .populate("book", "title author image")
//     .sort({ returnDate: -1 });

//   res.json(history);
// };

// export const getMyBorrowedBooks = async (req, res) => {
//   const borrows = await Borrow.find({
//     user: req.user._id,
//     status: "borrowed",
//   }).select("book");

//   res.json(borrows.map((b) => b.book));
// };


// export const checkoutBook = async (req, res) => {
//   try {
//     const { userId, bookId, borrowRequestId } = req.body;

//     if (!userId || !bookId) {
//       return res.status(400).json({ message: "User and Book are required" });
//     }

//     const book = await Book.findById(bookId);
//     if (!book || book.availableCopies <= 0) {
//       return res.status(400).json({ message: "Book unavailable" });
//     }

//     const activeReservation = await Reservation.findOne({
//       book: bookId,
//       status: "notified",
//       expiresAt: { $gt: new Date() },
//     });

//     if (activeReservation && !activeReservation.user.equals(userId)) {
//       return res.status(403).json({
//         message: "Book is reserved by another user (24h priority)",
//       });
//     }

//     const activeBorrow = await Borrow.findOne({
//       user: userId,
//       book: bookId,
//       status: "borrowed",
//     });

//     if (activeBorrow) {
//       return res.status(400).json({ message: "Book already borrowed by user" });
//     }

//     const activeBorrowCount = await Borrow.countDocuments({
//       user: userId,
//       status: "borrowed",
//     });

//     if (activeBorrowCount >= MAX_ACTIVE_BORROWS) {
//       return res.status(400).json({
//         message: `User already has ${MAX_ACTIVE_BORROWS} active borrows`,
//       });
//     }

//     const borrowDate = new Date();
//     const dueDate = new Date(borrowDate);
//     dueDate.setDate(dueDate.getDate() + BORROW_DAYS);

//     const borrow = await Borrow.create({
//       user: userId,
//       book: bookId,
//       borrowDate,
//       dueDate,
//       status: "borrowed",
//     });

//     book.availableCopies -= 1;
//     await book.save();

//     if (borrowRequestId) {
//       await BorrowRequest.findByIdAndUpdate(borrowRequestId, {
//         status: "approved",
//         borrowRef: borrow._id,
//         approvedBy: req.user._id,
//         approvedAt: new Date(),
//       });
//     }

//     res.status(201).json({
//       message: "Book checkout successful",
//       borrow,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const getAllBorrows = async (req, res) => {
//   const borrows = await Borrow.find()
//     .populate("user", "name email")
//     .populate("book", "title author")
//     .sort({ createdAt: -1 });

//   res.json(borrows);
// };


import Borrow from "../Models/borrowSchema.js";
import Book from "../Models/bookSchema.js";
import BorrowRequest from "../Models/borrowRequestSchema.js";
import Reservation from "../Models/reservationSchema.js";


const BORROW_DURATION_MINUTES = 2;

const MAX_ACTIVE_BORROWS = 3;

const FINE_PER_MINUTE = 5;


const ONE_MINUTE_MS = 60 * 1000;

export const getMyBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find({
      user: req.user._id,
      status: { $in: ["borrowed", "pending-return"] },
    }).populate("book", "title author image");

    res.json(borrows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
export const getBorrowHistory = async (req, res) => {
  try {
    const history = await Borrow.find({
      user: req.user._id,
      status: "returned",
    })
      .populate("book", "title author image")
      .sort({ returnDate: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyBorrowedBooks = async (req, res) => {
  try {
    const borrows = await Borrow.find({
      user: req.user._id,
      status: "borrowed",
    }).select("book");

    res.json(borrows.map((b) => b.book));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const checkoutBook = async (req, res) => {
  try {
    const { userId, bookId, borrowRequestId } = req.body;

    if (!userId || !bookId) {
      return res.status(400).json({ message: "User and Book are required" });
    }

    const book = await Book.findById(bookId);
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: "Book unavailable" });
    }

    const activeReservation = await Reservation.findOne({
      book: bookId,
      status: "notified",
      expiresAt: { $gt: new Date() },
    });

    if (activeReservation && !activeReservation.user.equals(userId)) {
      return res.status(403).json({
        message: "Book is reserved by another user",
      });
    }

    const activeBorrow = await Borrow.findOne({
      user: userId,
      book: bookId,
      status: "borrowed",
    });

    if (activeBorrow) {
      return res.status(400).json({
        message: "User already borrowed this book",
      });
    }
    const activeBorrowCount = await Borrow.countDocuments({
      user: userId,
      status: "borrowed",
    });

    if (activeBorrowCount >= MAX_ACTIVE_BORROWS) {
      return res.status(400).json({
        message: `User already has ${MAX_ACTIVE_BORROWS} active borrows`,
      });
    }

    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setMinutes(dueDate.getMinutes() + BORROW_DURATION_MINUTES);

    const borrow = await Borrow.create({
      user: userId,
      book: bookId,
      borrowDate,
      dueDate,
      status: "borrowed",
      lateFee: 0,
    });

    book.availableCopies -= 1;
    await book.save();

    if (borrowRequestId) {
      await BorrowRequest.findByIdAndUpdate(borrowRequestId, {
        status: "approved",
        borrowRef: borrow._id,
        approvedBy: req.user._id,
        approvedAt: new Date(),
      });
    }

    res.status(201).json({
      message: "Book checkout successful (2-minute duration)",
      borrow,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find()
      .populate("user", "name email")
      .populate("book", "title author")
      .sort({ createdAt: -1 });

    res.json(borrows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
