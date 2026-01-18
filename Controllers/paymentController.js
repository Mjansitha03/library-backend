import Payment from "../Models/paymentSchema.js";
import Borrow from "../Models/borrowSchema.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create payment order
export const createPaymentOrder = async (req, res) => {
  try {
    const { borrowId, amount, purpose } = req.body;

    if (!borrowId || !amount) {
      return res.status(400).json({ message: "Borrow ID and amount are required" });
    }

    const borrow = await Borrow.findById(borrowId).populate("user");
    if (!borrow) return res.status(404).json({ message: "Borrow not found" });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `borrow_${borrowId}_${Date.now()}`,
    });

    const payment = await Payment.create({
      user: borrow.user._id,
      borrow: borrow._id,
      amount,
      status: "pending",
      razorpayOrderId: order.id,
      purpose,
    });

    res.json({
      order,
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create payment order" });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const payment = await Payment.findById(paymentId);
    payment.status = "success";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    const borrow = await Borrow.findById(payment.borrow);
    borrow.lateFee = 0;
    await borrow.save();

    res.json({ message: "Payment verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

// Handle webhook
export const handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body;

    if (event.event === "payment_link.paid") {
      const paymentLinkId = event.payload.payment_link.entity.id;

      const payment = await Payment.findOne({ razorpayOrderId: paymentLinkId });
      if (payment && payment.status !== "success") {
        payment.status = "success";
        payment.razorpayPaymentId = event.payload.payment_link.entity.payment_id;
        await payment.save();

        const borrow = await Borrow.findById(payment.borrow);
        if (borrow) {
          borrow.lateFee = 0;
          await borrow.save();
        }
      }
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Webhook error" });
  }
};



