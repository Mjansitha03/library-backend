import Borrow from "../Models/borrowSchema.js";
import Notification from "../Models/notificationSchema.js";
import Payment from "../Models/paymentSchema.js";
import { sendEmail } from "../Utils/mailer.js";
import Razorpay from "razorpay";

const FIXED_FINE = 20;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Run overdue check
export const runOverdueCheck = async () => {
  try {
    const now = new Date();

    const overdueBorrows = await Borrow.find({
      status: "borrowed",
      dueDate: { $lt: now },
    }).populate("user book");

    for (const borrow of overdueBorrows) {
      const paid = await Payment.exists({
        borrow: borrow._id,
        purpose: "FINE",
        status: "success",
      });

      if (paid) continue;

      if (!borrow.lateFee || borrow.lateFee === 0) {
        borrow.lateFee = FIXED_FINE;
        await borrow.save();
      }

      const notified = await Notification.exists({
        user: borrow.user._id,
        referenceId: borrow._id,
        type: "overdue",
      });

      if (!notified) {
        await Notification.create({
          user: borrow.user._id,
          referenceId: borrow._id,
          type: "overdue",
          message: `Your book "${borrow.book.title}" is overdue. Fine: ₹${borrow.lateFee}`,
          fine: borrow.lateFee,
        });

        await sendEmail(
          borrow.user.email,
          "Overdue Book Reminder",
          `Your book "${borrow.book.title}" is overdue.\nFine: ₹${borrow.lateFee}`,
        );
      }

      const existingPayment = await Payment.findOne({
        borrow: borrow._id,
        purpose: "FINE",
      });

      if (!existingPayment) {
        const paymentLink = await razorpay.paymentLink.create({
          amount: borrow.lateFee * 100,
          currency: "INR",
          description: `Overdue fine for "${borrow.book.title}"`,
          customer: {
            name: borrow.user.name,
            email: borrow.user.email,
          },
          notify: { email: true },
          notes: { borrowId: borrow._id.toString() },
        });

        await Payment.create({
          user: borrow.user._id,
          borrow: borrow._id,
          amount: borrow.lateFee,
          status: "pending",
          razorpayOrderId: paymentLink.id,
          purpose: "FINE",
        });
      }
    }
  } catch (err) {
    console.error("Overdue cron failed:", err);
  }
};

// Get overdue
export const getOverdue = async (req, res) => {
  try {
    const now = new Date();

    const overdueBorrows = await Borrow.find({
      status: "borrowed",
      dueDate: { $lt: now },
    })
      .populate("user", "name email")
      .populate("book", "title")
      .sort({ dueDate: 1 });

    const result = [];

    for (const borrow of overdueBorrows) {
      const payment = await Payment.findOne({
        borrow: borrow._id,
        purpose: "FINE",
      });

      const overdueMinutes = Math.ceil((now - borrow.dueDate) / (60 * 1000));

      result.push({
        borrowId: borrow._id,
        user: borrow.user,
        book: borrow.book,
        dueDate: borrow.dueDate,
        overdueMinutes,
        fine: borrow.lateFee || 0,
        paymentStatus: payment?.status || "pending",
      });
    }

    res.json({
      totalOverdue: result.length,
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
