const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose'); // <-- 1. ADD THIS AT THE TOP

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ==========================================
// MONGODB CONNECTION SETUP
// ==========================================
// <-- 2. PASTE YOUR MONGODB CONNECTION STRING HERE
const MONGO_URI = "mongodb+srv://ridesharing:<db_a0zBv5YRjwbbivbr>@cluster0.wsyh0ov.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serves your existing frontend HTML/CSS/JS files

// --- IN-MEMORY DATA STORES (Replace with MongoDB or PostgreSQL for persistent storage) ---
let notices = [];
let activeRides = [];

// ==========================================
// 1. ADMIN NOTICES API & REAL-TIME EMIT
// ==========================================

// Admin posts a new notice
app.post('/api/notices', (req, res) => {
  const { title, message } = req.body;
  const notice = { id: Date.now(), title, message, createdAt: new Date() };
  notices.unshift(notice);

  // Broadcast to all connected drivers instantly
  io.emit('new_notice', notice);
  res.json({ success: true, notice });
});

// Drivers fetch past notices
app.get('/api/notices', (req, res) => {
  res.json(notices);
});

// ==========================================
// 2. RIDE CANCELLATION & REASSIGNMENT API
// ==========================================

// Driver cancels a ride request
app.post('/api/rides/cancel', (req, res) => {
  const { rideId, driverId } = req.body;

  let ride = activeRides.find(r => r.id === rideId);
  if (!ride) {
    ride = { id: rideId, declinedDriverIds: [] };
    activeRides.push(ride);
  }

  // Prevent notifying the same driver who just canceled
  ride.declinedDriverIds.push(driverId);

  // Notify all drivers EXCEPT the ones who canceled
  io.emit('ride_available', {
    rideId,
    excludedDrivers: ride.declinedDriverIds,
    message: "A new ride is available near you!"
  });

  res.json({ success: true, message: "Ride re-dispatched to available drivers." });
});

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
