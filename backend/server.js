const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ==========================================
// MONGODB CONNECTION SETUP
// ==========================================
// Fixed URI: Removed angle brackets '<' and '>' around the password
const MONGO_URI = "mongodb+srv://ridesharing:db_gR0t4qYaqEbcPZDF@cluster0.wsyh0ov.mongodb.net/ridesharing?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// ==========================================
// MONGOOSE SCHEMAS & MODELS
// ==========================================
const RideSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  riderName: String,
  pickup: String,
  destination: String,
  pickupCoords: Object,
  destCoords: Object,
  fare: String,
  otp: String,
  driverName: String,
  status: { type: String, default: 'Requested' },
  declinedDriverIds: [String],
  createdAt: { type: Date, default: Date.now }
});

const Ride = mongoose.model('Ride', RideSchema);

const NoticeSchema = new mongoose.Schema({
  title: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Notice = mongoose.model('Notice', NoticeSchema);

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serves your existing frontend HTML/CSS/JS files

// ==========================================
// 1. ADMIN NOTICES API
// ==========================================

// Admin posts a new notice
app.post('/api/notices', async (req, res) => {
  try {
    const { title, message } = req.body;
    const notice = new Notice({ title, message });
    await notice.save();

    // Broadcast to all connected drivers instantly
    io.emit('new_notice', notice);
    res.json({ success: true, notice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Drivers fetch past notices
app.get('/api/notices', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. RIDE CANCELLATION & REASSIGNMENT API
// ==========================================

app.post('/api/rides/cancel', async (req, res) => {
  try {
    const { rideId, driverId } = req.body;

    let ride = await Ride.findOne({ bookingId: rideId });
    if (!ride) {
      ride = new Ride({ bookingId: rideId, declinedDriverIds: [driverId] });
    } else {
      ride.declinedDriverIds.push(driverId);
    }
    await ride.save();

    // Notify online drivers EXCEPT those who declined
    io.to('driversRoom').emit('ride_available', {
      rideId,
      excludedDrivers: ride.declinedDriverIds,
      message: "A new ride is available near you!"
    });

    res.json({ success: true, message: "Ride re-dispatched to available drivers." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. WEBSOCKET REAL-TIME MATCHING ENGINE
// ==========================================

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Driver joins driver pool
  socket.on('driverOnline', async (driverData) => {
    socket.join('driversRoom');
    console.log(`Driver online and joined driversRoom: ${socket.id}`);

    // Check for any existing pending ride requests
    try {
      const pendingRide = await Ride.findOne({ status: 'Requested' }).sort({ createdAt: -1 });
      if (pendingRide) {
        socket.emit('newRideRequest', pendingRide);
      }
    } catch (err) {
      console.error('Error fetching pending rides:', err);
    }
  });

  // Rider requests a ride
  socket.on('requestRide', async (rideData) => {
    try {
      const bookingId = rideData.bookingId || "RIDE_" + Date.now();
      
      const newRide = new Ride({
        ...rideData,
        bookingId,
        status: 'Requested'
      });
      await newRide.save();

      console.log(`New Ride Created & Broadcasted: ${bookingId}`);

      // Broadcast to ALL online drivers
      io.to('driversRoom').emit('newRideRequest', newRide);
      
      // Join rider to their dedicated room
      socket.join(bookingId);
    } catch (err) {
      console.error('Error creating ride request:', err);
    }
  });

  // Driver accepts ride
  socket.on('acceptRide', async ({ rideId, driverName }) => {
    try {
      const ride = await Ride.findOneAndUpdate(
        { bookingId: rideId },
        { status: 'Accepted', driverName },
        { new: true }
      );

      if (ride) {
        // Notify rider room that ride was accepted
        io.to(rideId).emit('rideAccepted', ride);
      }
    } catch (err) {
      console.error('Error accepting ride:', err);
    }
  });

  // Driver updates real-time location tracking
  socket.on('updateDriverLocation', ({ rideId, lat, lng }) => {
    io.to(rideId).emit('driverLocationUpdated', { lat, lng });
  });

  // Start ride
  socket.on('startRide', async ({ rideId }) => {
    await Ride.findOneAndUpdate({ bookingId: rideId }, { status: 'In Progress' });
    io.to(rideId).emit('rideStarted');
  });

  // Complete ride
  socket.on('completeRide', async ({ rideId }) => {
    await Ride.findOneAndUpdate({ bookingId: rideId }, { status: 'Completed' });
    io.to(rideId).emit('rideCompleted');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
