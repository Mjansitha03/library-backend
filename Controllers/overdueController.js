import Borrow from "../Models/borrowSchema.js";
import Notification from "../Models/notificationSchema.js";
import Payment from "../Models/paymentSchema.js";
import Razorpay from "razorpay";

const FIXED_FINE = 20;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const runOverdueCheck = async () => {
  try {
    const now = new Date();

    const overdueBorrows = await Borrow.find({
      status: "borrowed",
      dueDate: { $lt: now },
    }).populate("user book");

    for (const borrow of overdueBorrows) {
      const finePaid = await Payment.exists({
        borrow: borrow._id,
        purpose: "FINE",
        status: "success",
      });
      if (finePaid) continue;

      if (!borrow.lateFee || borrow.lateFee === 0) {
        borrow.lateFee = FIXED_FINE;
        await borrow.save();
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

        await Notification.create({
          user: borrow.user._id,
          title: "Overdue Book Fine",
          message: `Your book "${borrow.book.title}" is overdue.
           A fine of ₹${borrow.lateFee} has been applied.`,
          type: "FINE",
          referenceId: borrow._id,
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
    console.log("Checking overdue borrows at", now);

    const overdueBorrows = await Borrow.find({
      status: "borrowed",
      dueDate: { $lt: now },
    })
      .populate("user", "name email")
      .populate("book", "title")
      .sort({ dueDate: 1 })
      .lean();

    console.log("Overdue borrows found:", overdueBorrows.length);

    const result = await Promise.all(
      overdueBorrows.map(async (borrow) => {
        const user = borrow.user || { name: "Deleted User", email: "N/A" };
        const book = borrow.book || { title: "Deleted Book" };

        const payment = await Payment.findOne({
          borrow: borrow._id,
          purpose: "FINE",
        }).lean();

        const overdueMinutes = Math.ceil(
          (now - new Date(borrow.dueDate)) / (1000 * 60),
        );
        const overdueDays = Math.ceil(overdueMinutes / (60 * 24));
        const fine = borrow.lateFee || FIXED_FINE;

        return {
          borrowId: borrow._id,
          user,
          book,
          dueDate: borrow.dueDate,
          overdueMinutes,
          overdueDays,
          fine,
          paymentStatus: payment?.status || "pending",
        };
      }),
    );

    return res.json({ totalOverdue: result.length, data: result });
  } catch (err) {
    console.error("Error fetching overdue:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
