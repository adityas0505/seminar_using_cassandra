# Seminar Hall Booking System

A full-stack web application built using the MERN stack (MongoDB, Express.js, React.js with Vite, Node.js) and Tailwind CSS. The system allows users to view and book seminar halls, while providing administrators with tools to manage halls and approve/reject bookings.

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, React Router, Axios, Lucide React, React Toastify
- **Backend**: Node.js, Express.js, Mongoose (MongoDB), JSON Web Tokens (JWT), Bcrypt

## Features
- **User Authentication**: Secure registration and login with JWT and password hashing.
- **Role-based Access Control**: Distinct features for Users and Admins.
- **Hall Management**: Admins can Add, Edit, and Delete seminar halls.
- **Booking System**: Users can request bookings for specific dates and times.
- **Overlap Prevention Logic**: The system automatically rejects double booking requests for overlapping times.
- **Booking Management**: Admins can view all bookings and update statuses (Approve/Reject).

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local installation or MongoDB Atlas URI)

### 1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd seminar-booking-system
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`

Create a `.env` file in the `backend` directory (a default one might already be provided):
\`\`\`env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/seminar_booking
JWT_SECRET=supersecretjwtkey12345!
\`\`\`

Start the backend server (Development mode):
\`\`\`bash
npm run dev
\`\`\`

### 3. Frontend Setup
Open a new terminal window:
\`\`\`bash
cd frontend
npm install
\`\`\`

Start the frontend development server:
\`\`\`bash
npm run dev
\`\`\`

### 4. Testing the Application
- Open `http://localhost:5173` in your browser.
- Create a new account.
- **Admin Setup**: To test admin features, you can either manually change a user's role to `'admin'` directly in your MongoDB database, or create an account with role `'admin'` via the registration form UI.
- Login and start booking!

## Booking Overlap Logic
The application enforces strict overlap prevention using the logic:
\`newStartTime < existingEndTime AND newEndTime > existingStartTime\`
This ensures that a hall cannot be double-booked for intersecting time frames.
