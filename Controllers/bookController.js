import Book from "../Models/bookSchema.js";
import Borrow from "../Models/borrowSchema.js";
import BorrowRequest from "../Models/borrowRequestSchema.js"; // ✅ FIX
import Reservation from "../Models/reservationSchema.js";

// Create Book
export const addBook = async (req, res) => {
  try {
    const data = {
      ...req.body,
      availabilityStatus:
        req.body.availableCopies > 0 ? "available" : "unavailable",
    };

    const book = await Book.create(data);
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBook = addBook;

// Get All Books
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();

    let borrowed = [];
    let requested = [];
    let userReservations = [];

    if (req.user?.role === "user") {
      borrowed = await Borrow.find({
        user: req.user._id,
        status: "borrowed",
      }).distinct("book");

      requested = await BorrowRequest.find({
        user: req.user._id,
        type: "borrow",
        status: "pending",
      }).distinct("book");

      userReservations = await Reservation.find({
        user: req.user._id,
        status: { $in: ["pending", "notified"] },
      });
    }

    const enrichedBooks = books.map((book) => {
      const reservation = userReservations.find((r) => r.book.equals(book._id));

      return {
        ...book.toObject(),

        borrowedByUser: borrowed.some((id) => id.equals(book._id)),
        requestedByUser: requested.some((id) => id.equals(book._id)),
 
        reservedByUser: !!reservation,
        reservationStatus: reservation?.status || null, 
      };
    });

    res.status(200).json(enrichedBooks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Update Book
export const updateBook = async (req, res) => {
  try {
    
    const oldBook = await Book.findById(req.params.id);
    if (!oldBook) {
      return res.status(404).json({ message: "Book not found" });
    }

 
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (oldBook.availableCopies === 0 && book.availableCopies > 0) {
      await notifyNextReservedUser(book._id);
    }

    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// Delete book
export const deleteBook = async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
