import Borrow from "../Models/borrowSchema.js";
import Reservation from "../Models/reservationSchema.js";
import Notification from "../Models/notificationSchema.js";

// Get dashboard
export const getDashboard = async (req, res) => {
  const borrows = await Borrow.find({ user: req.user._id });
  const reservations = await Reservation.find({ user: req.user._id });
  const notifications = await Notification.find({ user: req.user._id });

  res.json({ borrows, reservations, notifications });
};


