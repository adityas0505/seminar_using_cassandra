# BookMyHall - Seminar Booking System

BookMyHall is a modern, full-stack Seminar Hall Booking System designed to streamline the reservation and management of event spaces. Built with the MERN stack (MongoDB, Express, React, Node.js), it features a futuristic dark-mode glassmorphism UI, robust role-based access control, and real-time scheduling visualization.

## ✨ Features

### User Dashboard
* **Upcoming & History Views:** Easily track active reservations and past/cancelled bookings.
* **Streamlined Booking:** Seamlessly book seminar halls by selecting dates, time slots, and providing the purpose of the event.
* **Status Tracking:** Real-time updates on booking statuses (Pending, Approved, Rejected, Cancelled).

### Admin Core
* **Booking Logs:** Comprehensive view of all system requests, cleanly separated into "Upcoming & Requests" and "Past History".
* **One-Click Approvals:** Approve or reject pending hall requests directly from the dashboard.
* **Hall Matrix:** Allocate, configure, edit, and delete physical seminar halls, including capacity and location metadata.
* **Schedule Matrix:** A powerful visual grid showing real-time hall allocations across all time slots for any selected date.

## 🚀 Tech Stack
* **Frontend:** React, Tailwind CSS, Lucide Icons, Vite
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Authentication:** JWT-based session management

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Aditya0511S/seminar-booking-system.git
   cd seminar-booking-system
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file with your MONGO_URI and JWT_SECRET
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the App:**
   Open your browser and navigate to `http://localhost:5173`.
