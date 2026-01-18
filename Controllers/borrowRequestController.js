// import BorrowRequest from "../Models/borrowRequestSchema.js";
// import Borrow from "../Models/borrowSchema.js";
// import Book from "../Models/bookSchema.js";
// import Reservation from "../Models/reservationSchema.js"; 
// import { notifyNextReservedUser } from "./reservationController.js";

// const BORROW_DAYS = 7;
// const FINE_PER_DAY = 5;
// const MAX_ACTIVE_BORROWS = 3;

// export const requestBorrow = async (req, res) => {
//   try {
//     const { bookId } = req.body;

//     const book = await Book.findById(bookId);
//     if (!book) {
//       return res.status(404).json({ message: "Book not found" });
//     }

//     const activeNotified = await Reservation.findOne({
//       book: bookId,
//       status: "notified",
//       expiresAt: { $gt: new Date() },
//     });

//     if (activeNotified && !activeNotified.user.equals(req.user._id)) {
//       return res.status(403).json({
//         message: "Book is currently reserved by another user",
//       });
//     }

//     const userReservation = await Reservation.findOne({
//       book: bookId,
//       user: req.user._id,
//       status: "notified",
//     });

//     if (userReservation) {
//       userReservation.status = "in-progress";
//       userReservation.expiresAt = null;
//       await userReservation.save();
//     }

//     if (book.availableCopies <= 0) {
//       return res.status(400).json({ message: "Book unavailable" });
//     }

//     const existing = await BorrowRequest.findOne({
//       user: req.user._id,
//       book: bookId,
//       type: "borrow",
//       status: "pending",
//     });

//     if (existing) {
//       return res.status(200).json({
//         message: "Borrow request already sent",
//         request: existing,
//       });
//     }

//     const request = await BorrowRequest.create({
//       user: req.user._id,
//       book: bookId,
//       type: "borrow",
//       status: "pending",
//     });

//     res.status(201).json({
//       message: "Borrow request sent successfully",
//       request,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// export const requestReturn = async (req, res) => {
//   try {
//     const { borrowId } = req.body;

//     const borrow = await Borrow.findById(borrowId);
//     if (!borrow) {
//       return res.status(400).json({ message: "Invalid borrow" });
//     }

//     if (borrow.status === "pending-return") {
//       return res.status(200).json({
//         message: "Return request already pending",
//       });
//     }

//     if (borrow.status !== "borrowed") {
//       return res.status(400).json({ message: "Invalid borrow state" });
//     }

//     const existing = await BorrowRequest.findOne({
//       borrowRef: borrow._id,
//       type: "return",
//       status: "pending",
//     });

//     if (existing) {
//       return res.status(400).json({
//         message: "Return request already sent",
//       });
//     }

//     const request = await BorrowRequest.create({
//       user: borrow.user,
//       book: borrow.book,
//       borrowRef: borrow._id,
//       type: "return",
//       status: "pending",
//     });

//     borrow.status = "pending-return";
//     await borrow.save();

//     res.status(201).json({
//       message: "Return request submitted",
//       request,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const getBorrowRequests = async (req, res) => {
//   try {
//     const requests = await BorrowRequest.find()
//       .populate("user", "name email")
//       .populate("book", "title author image")
//       .populate("borrowRef")
//       .populate("approvedBy", "name email")
//       .sort({ createdAt: -1 });

//     res.json(requests);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const approveBorrowRequest = async (req, res) => {
//   try {
//     const request = await BorrowRequest.findById(req.params.id)
//       .populate("book")
//       .populate("user");

//     if (!request || request.type !== "borrow" || request.status !== "pending") {
//       return res.status(400).json({ message: "Invalid request" });
//     }

//     const book = await Book.findById(request.book._id);
//     if (!book || book.availableCopies <= 0) {
//       return res.status(400).json({ message: "Book unavailable" });
//     }

//     const existingBorrow = await Borrow.findOne({
//       user: request.user._id,
//       book: request.book._id,
//       status: "borrowed",
//     });

//     if (existingBorrow) {
//       return res.status(400).json({
//         message: "User already borrowed this book",
//       });
//     }

//     const activeBorrowCount = await Borrow.countDocuments({
//       user: request.user._id,
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
//       user: request.user._id,
//       book: request.book._id,
//       borrowDate,
//       dueDate,
//       status: "borrowed",
//     });

//     request.status = "approved";
//     request.borrowRef = borrow._id;
//     request.approvedBy = req.user._id;
//     request.approvedAt = new Date();
//     await request.save();

//     book.availableCopies -= 1;
//     await book.save();


//     await Reservation.updateMany(
//       {
//         book: request.book._id,
//         user: request.user._id,
//         status: { $in: ["notified", "in-progress"] },
//       },
//       { status: "completed" }
//     );


//     if (book.availableCopies > 0) {
//       await notifyNextReservedUser(book._id);
//     }

//     res.json({
//       message: "Borrow approved successfully",
//       request,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// export const approveReturnRequest = async (req, res) => {
//   try {
//     const request = await BorrowRequest.findById(req.params.id)
//       .populate("borrowRef")
//       .populate("book");

//     if (!request || request.type !== "return" || request.status !== "pending") {
//       return res.status(400).json({ message: "Invalid request" });
//     }

//     const borrow = await Borrow.findById(request.borrowRef._id);

//     borrow.status = "returned";
//     borrow.returnDate = new Date();

//     const overdueDays = Math.max(
//       0,
//       Math.ceil((borrow.returnDate - borrow.dueDate) / 86400000)
//     );

//     borrow.lateFee = overdueDays * FINE_PER_DAY;
//     await borrow.save();

//     const book = await Book.findById(borrow.book);
//     book.availableCopies += 1;
//     await book.save();

//     request.status = "completed";
//     request.approvedBy = req.user._id;
//     request.approvedAt = new Date();
//     await request.save();


//     await notifyNextReservedUser(book._id);

//     res.json({
//       message: "Return approved successfully",
//       request,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const rejectRequest = async (req, res) => {
//   try {
//     const request = await BorrowRequest.findById(req.params.id);

//     if (!request || request.status !== "pending") {
//       return res.status(400).json({ message: "Invalid request" });
//     }

//     request.status = "rejected";
//     request.rejectedBy = req.user._id;
//     request.rejectedAt = new Date();
//     await request.save();

//     res.json({
//       message: "Request rejected successfully",
//       request,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const getMyBorrowRequests = async (req, res) => {
//   try {
//     const requests = await BorrowRequest.find({
//       user: req.user._id,
//       type: "borrow",
//       status: "pending",
//     }).populate("book", "title author image");

//     res.json(requests);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };





import BorrowRequest from "../Models/borrowRequestSchema.js";
import Borrow from "../Models/borrowSchema.js";
import Book from "../Models/bookSchema.js";
import Reservation from "../Models/reservationSchema.js";
import { notifyNextReservedUser } from "./reservationController.js";


const BORROW_DURATION_MINUTES = 2;

const FINE_PER_MINUTE = 5;

const MAX_ACTIVE_BORROWS = 3;

const ONE_MINUTE_MS = 60 * 1000;

export const requestBorrow = async (req, res) => {
  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const activeNotified = await Reservation.findOne({
      book: bookId,
      status: "notified",
      expiresAt: { $gt: new Date() },
    });

    if (activeNotified && !activeNotified.user.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Book reserved by another user" });
    }

    const userReservation = await Reservation.findOne({
      book: bookId,
      user: req.user._id,
      status: "notified",
    });

    if (userReservation) {
      userReservation.status = "in-progress";
      userReservation.expiresAt = null;
      await userReservation.save();
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: "Book unavailable" });
    }

    const existing = await BorrowRequest.findOne({
      user: req.user._id,
      book: bookId,
      type: "borrow",
      status: "pending",
    });

    if (existing) {
      return res.json({
        message: "Borrow request already sent",
        request: existing,
      });
    }

    const request = await BorrowRequest.create({
      user: req.user._id,
      book: bookId,
      type: "borrow",
      status: "pending",
    });

    res.status(201).json({
      message: "Borrow request sent successfully",
      request,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const requestReturn = async (req, res) => {
  try {
    const { borrowId } = req.body;

    const borrow = await Borrow.findById(borrowId);
    if (!borrow) {
      return res.status(400).json({ message: "Invalid borrow" });
    }

    if (borrow.status !== "borrowed") {
      return res.status(400).json({ message: "Invalid borrow state" });
    }

    const existing = await BorrowRequest.findOne({
      borrowRef: borrow._id,
      type: "return",
      status: "pending",
    });

    if (existing) {
      return res.json({ message: "Return request already pending" });
    }

    const request = await BorrowRequest.create({
      user: borrow.user,
      book: borrow.book,
      borrowRef: borrow._id,
      type: "return",
      status: "pending",
    });

    borrow.status = "pending-return";
    await borrow.save();

    res.status(201).json({
      message: "Return request submitted",
      request,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBorrowRequests = async (req, res) => {
  const requests = await BorrowRequest.find()
    .populate("user", "name email")
    .populate("book", "title author image")
    .populate("borrowRef")
    .sort({ createdAt: -1 });

  res.json(requests);
};

export const approveBorrowRequest = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id)
      .populate("user")
      .populate("book");

    if (!request || request.type !== "borrow" || request.status !== "pending") {
      return res.status(400).json({ message: "Invalid request" });
    }

    const activeBorrowCount = await Borrow.countDocuments({
      user: request.user._id,
      status: "borrowed",
    });

    if (activeBorrowCount >= MAX_ACTIVE_BORROWS) {
      return res.status(400).json({
        message: `Max ${MAX_ACTIVE_BORROWS} active borrows reached`,
      });
    }

    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setMinutes(dueDate.getMinutes() + BORROW_DURATION_MINUTES);

    const borrow = await Borrow.create({
      user: request.user._id,
      book: request.book._id,
      borrowDate,
      dueDate,
      status: "borrowed",
      lateFee: 0,
    });

    request.status = "approved";
    request.borrowRef = borrow._id;
    request.approvedBy = req.user._id;
    request.approvedAt = new Date();
    await request.save();

    request.book.availableCopies -= 1;
    await request.book.save();

    await Reservation.updateMany(
      {
        book: request.book._id,
        user: request.user._id,
        status: { $in: ["notified", "in-progress"] },
      },
      { status: "completed" }
    );

    if (request.book.availableCopies > 0) {
      await notifyNextReservedUser(request.book._id);
    }

    res.json({
      message: "Borrow approved (2-minute duration)",
      borrow,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const approveReturnRequest = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id).populate(
      "borrowRef"
    );

    if (!request || request.type !== "return") {
      return res.status(400).json({ message: "Invalid request" });
    }

    const borrow = await Borrow.findById(request.borrowRef._id);

    borrow.status = "returned";
    borrow.returnDate = new Date();

    let overdueMinutes = 0;
    if (borrow.returnDate > borrow.dueDate) {
      overdueMinutes = Math.ceil(
        (borrow.returnDate - borrow.dueDate) / ONE_MINUTE_MS
      );
    }

    borrow.lateFee = overdueMinutes * FINE_PER_MINUTE;
    await borrow.save();

    const book = await Book.findById(borrow.book);
    book.availableCopies += 1;
    await book.save();

    request.status = "completed";
    request.approvedBy = req.user._id;
    request.approvedAt = new Date();
    await request.save();

    await notifyNextReservedUser(book._id);

    res.json({
      message: "Return approved",
      overdueMinutes,
      fine: borrow.lateFee,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id);

    if (!request || request.status !== "pending") {
      return res.status(400).json({ message: "Invalid request" });
    }

    request.status = "rejected";
    request.rejectedBy = req.user._id;
    request.rejectedAt = new Date();
    await request.save();

    res.json({
      message: "Request rejected successfully",
      request,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyBorrowRequests = async (req, res) => {
  try {
    const requests = await BorrowRequest.find({
      user: req.user._id,
      type: "borrow",
      status: "pending",
    }).populate("book", "title author image");

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



