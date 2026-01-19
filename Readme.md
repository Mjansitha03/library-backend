# Library Management System Backend

This is the backend part of a library management system. It helps manage books, users, borrowing, and more in a library.

## What This Project Does

- Let users sign up and log in
- Manage books (add, update, search)
- Handle borrowing and returning books
- Make reservations for books
- Send notifications to users
- Process payments for overdue books
- Admin features to manage everything
- Send emails for important updates
- Automatic checks for overdue books

## Technologies Used

- **Node.js**: The main programming language
- **Express.js**: For building the API
- **MongoDB**: Database to store all data
- **Mongoose**: To work with MongoDB easily
- **JWT**: For user authentication
- **Bcrypt**: To hash passwords securely
- **SendGrid**: To send emails
- **Razorpay**: For payment processing
- **Node-cron**: For scheduled tasks like checking overdue books

## Project Structure

### Main Files
- `index.js`: The main file that starts the server
- `package.json`: Lists all dependencies and scripts

### Controllers
These handle the logic for different parts of the app:
- `authController.js`: Login and signup
- `bookController.js`: Book operations
- `borrowController.js`: Borrowing books
- `userController.js`: User management
- `adminActivityController.js`: Admin actions
- `notificationController.js`: Sending notifications
- `paymentController.js`: Handling payments
- `announcementController.js`: Managing announcements
- `borrowRequestController.js`: Handling borrow requests
- `overdueController.js`: Managing overdue books
- `reservationController.js`: Book reservations
- `reviewController.js`: Book reviews
- `userAdminController.js`: Admin user management
- `userProfileController.js`: User profiles
- `userStatsController.js`: User statistics
- `adminStatsController.js`: Admin statistics
- `adminAnalyticsController.js`: Admin analytics

### Database
- `dbConfig.js`: Connects to MongoDB

### Middleware
- `authMiddleware.js`: Checks if user is logged in

### Models
These define the data structure:
- `userSchema.js`: User information
- `bookSchema.js`: Book details
- `borrowSchema.js`: Borrowing records
- `notificationSchema.js`: Notification data
- `announcementSchema.js`: Announcement data
- `borrowRequestSchema.js`: Borrow request data
- `overdueSchema.js`: Overdue data
- `paymentSchema.js`: Payment data
- `reservationSchema.js`: Reservation data
- `reviewSchema.js`: Review data

### Routes
These define the API endpoints:
- `authRoute.js`: Login/signup routes
- `bookRoute.js`: Book-related routes
- `borrowRoute.js`: Borrowing routes
- `userAdminRoute.js`: Admin user routes
- `userProfileRoute.js`: User profile routes
- `userStatsRoute.js`: User stats routes
- `reviewRoute.js`: Review routes
- `announcementRoute.js`: Announcement routes
- `notificationRoute.js`: Notification routes
- `borrowRequestRoute.js`: Borrow request routes
- `reservationRoute.js`: Reservation routes
- `adminRoute.js`: Admin routes
- `adminAnalyticsRoutes.js`: Admin analytics routes
- `overdueRoute.js`: Overdue routes
- `paymentRoute.js`: Payment routes

### Seed
Scripts to add sample data to the database:
- `runSeed.js`: Main seeding script
- `seedAnnouncements.js`: Add sample announcements
- `seedBooks.js`: Add sample books
- `seedBorrowRequests.js`: Add sample borrow requests
- `seedBorrows.js`: Add sample borrows
- `seedPayments.js`: Add sample payments
- `seedReservations.js`: Add sample reservations
- `seedReturnRequests.js`: Add sample return requests
- `seedReviews.js`: Add sample reviews
- `seedUsers.js`: Add sample users

### Utils
Helper tools:
- `mailer.js`: For sending emails
- `dateUtils.js`: Date-related functions
- `phoneUtils.js`: Phone number utilities

### Cron
- `overdueCron.js`: Automatically checks for overdue books

## Installation

1. Make sure you have Node.js installed
2. Clone this project
3. Go to the project folder: `cd library-backend`
4. Install dependencies: `npm install`

## Environment Setup

Create a `.env` file in the root folder with:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
SENDGRID_API_KEY=your_sendgrid_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## Running the Project

- Start the server: `npm start`
- Development mode: `npm run dev`
- Add sample data: `npm run seed`

## API Endpoints

Here are all the API endpoints organized by category:

### Authentication
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/verify-reset/:id/:token` - Verify reset token
- `POST /api/auth/reset-password/:id/:token` - Reset password

### Users
- `GET /api/users` - Get all users (admin/librarian)
- `PUT /api/users/:id/role` - Update user role (admin)
- `DELETE /api/users/:id` - Delete user (admin)
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile

### User Statistics
- `GET /api/user-stats/me` - Get current user statistics

### Books
- `GET /api/books` - Get all books (authenticated users)
- `POST /api/books` - Add new book (admin/librarian)
- `PUT /api/books/:id` - Update book (admin/librarian)
- `DELETE /api/books/:id` - Delete book (admin)

### Reviews
- `GET /api/reviews/approved` - Get all approved reviews (public)
- `POST /api/reviews` - Add review (user)
- `GET /api/reviews/my` - Get user's reviews (user)
- `GET /api/reviews` - Get all reviews (admin)
- `PUT /api/reviews/approve/:id` - Approve review (admin)
- `DELETE /api/reviews/:id` - Delete review (admin)

### Announcements
- `GET /api/announcements` - Get all announcements (public)
- `POST /api/announcements` - Create announcement (admin/librarian)
- `DELETE /api/announcements/:id` - Delete announcement (admin/librarian)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id` - Mark notification as read
- `PATCH /api/notifications/mark-all-read` - Mark all notifications as read
- `DELETE /api/notifications/clear` - Clear all notifications

### Borrowing
- `GET /api/borrows` - Get all borrows (admin/librarian)
- `POST /api/borrows/checkout` - Checkout book (admin/librarian)
- `GET /api/borrows/my` - Get user's borrows (user)
- `GET /api/borrows/my-borrowed-books` - Get user's borrowed books (user)
- `GET /api/borrows/history` - Get user's borrow history (user)

### Borrow Requests
- `POST /api/borrow-requests/borrow` - Request to borrow book (user)
- `POST /api/borrow-requests/return` - Request to return book (user)
- `GET /api/borrow-requests/my-borrow-requests` - Get user's borrow requests (user)
- `GET /api/borrow-requests` - Get all borrow requests (admin/librarian)
- `PUT /api/borrow-requests/approve-borrow/:id` - Approve borrow request (admin/librarian)
- `PUT /api/borrow-requests/approve-return/:id` - Approve return request (admin/librarian)
- `PUT /api/borrow-requests/reject/:id` - Reject request (admin/librarian)

### Reservations
- `POST /api/reservations/:bookId` - Reserve a book (user)
- `GET /api/reservations/my` - Get user's reservations (user)
- `GET /api/reservations` - Get all reservations (admin/librarian)

### Admin
- `GET /api/admin/stats` - Get admin statistics (admin)
- `GET /api/admin/analytics` - Get admin analytics (admin)
- `GET /api/admin/recent-activity` - Get recent admin activity (admin)

### Admin Analytics
- `GET /api/admin/analytics` - Get detailed analytics (admin)

### Overdue
- `GET /api/overdue` - Get overdue books (admin/librarian)

### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Handle payment webhook

## Database

Uses MongoDB. Make sure MongoDB is running.

## Seeding

To add sample data:
```
npm run seed
```

This will add sample users, books, and other data.

## Features

- User authentication with JWT
- Book search and management
- Borrowing system with due dates
- Reservation system
- Payment integration for fines
- Email notifications
- Admin dashboard
- Automatic overdue checks
- Review system for books

## Contributing

1. Fork the project
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License