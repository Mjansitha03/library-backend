import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./Database/dbConfig.js";
import "./Cron/overdueCron.js";

import authRoute from "./Routes/authRoute.js";
import reviewRoute from "./Routes/reviewRoute.js";
import bookRoute from "./Routes/bookRoute.js";
import announcementRoute from "./Routes/announcementRoute.js";
import notificationRoute from "./Routes/notificationRoute.js";
import adminRoute from "./Routes/adminRoute.js";
import borrowRoute from "./Routes/borrowRoute.js";
import borrowRequestRoute from "./Routes/borrowRequestRoute.js";
import reservationRoute from "./Routes/reservationRoute.js";
import userAdminRoute from "./Routes/userAdminRoute.js";
import userProfileRoute from "./Routes/userProfileRoute.js";
import adminAnalyticsRoutes from "./Routes/adminAnalyticsRoutes.js";
import userStatsRoute from "./Routes/userStatsRoute.js";
import overdueRoute from "./Routes/overdueRoute.js";
import paymentRoute from "./Routes/paymentRoute.js";

dotenv.config();
const app = express();

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

connectDB();

app.get("/", (req, res) => {
  res.send("<h1 style='text-align:center'>Library Management API</h1>");
});

app.use("/api/auth", authRoute);
app.use("/api/users", userAdminRoute);
app.use("/api/users", userProfileRoute);
app.use("/api/user-stats", userStatsRoute);

app.use("/api/books", bookRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/announcements", announcementRoute);
app.use("/api/notifications", notificationRoute);

app.use("/api/borrows", borrowRoute);
app.use("/api/borrow-requests", borrowRequestRoute);
app.use("/api/overdue", overdueRoute);
app.use("/api/payments", paymentRoute);

app.use("/api/reservations", reservationRoute);
app.use("/api/admin", adminRoute);
app.use("/api/admin/analytics", adminAnalyticsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
